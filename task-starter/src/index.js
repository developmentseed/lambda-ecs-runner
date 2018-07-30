'use strict'

const AWS = require('aws-sdk')

/**
 * Error object for invalid inputs
 *
 * @param {String} msg - error message
 * @returns {Error} the error object
 */
function newException(msg) {
  const err = new Error(msg)
  err.code = 'INVALID_INPUT'
  return err
}

/**
 * Validate inputs to the lambda function
 *
 * @param {Object} event - the input to the Lambda function
 * @returns {Error} the error object or undefined if the input is good
 */
function validateLambdaInput(event) {
  if (!event.arn) return newException('Lambda ARN is missing')
  if (!event.input) return newException('The input for the ecs task is not provided')
  if (!event.subnets) return newException('The list of subnets is missing')
  if (!event.securityGroups) return newException('The list of security groups is missing')
  if (!event.cluster) return newException('The cluster name is missing')
  if (!event.taskDefinition) return newException('The ECS task definition name is missing')
  if (!event.roleArn) return newException('The ECS role ARN is missing')

  if (!Array.isArray(event.subnets)) return newException('subnets must be an array')
  if (!Array.isArray(event.securityGroups)) return newException('securityGroups must be an array')
  if (typeof event.input !== 'object') return newException('input must be an object')
  return undefined
}

/**
 * Gets Environment Variables of a given Lambda
 *
 * @param {string} arn - lambda arn address
 * @returns {Array} an array of objects with name and value
 */
async function getEnvVariables(arn) {
  const lambda = new AWS.Lambda()
  const data = await lambda.getFunction({ FunctionName: arn }).promise()

  let envs = []
  // if there are environment variables, set them
  if (data.Configuration.Environment) {
    const variables = data.Configuration.Environment.Variables
    envs = Object.keys(variables).map((key) => ({
      name: key,
      value: variables[key]
    }))
  }
  return envs
}

/**
 * Starts an Fargate ECS Task
 *
 * @param {Object} options - an options object
 * @param {string} options.cluster - the ECS cluster
 * @param {string} options.taskDefinition - the ECS taskDefinition
 * @param {Array} options.subnets - a list of subnets that run the task on
 * @param {Array} options.securityGroups - a list of security groups
 * @param {string} options.arn - the lambda function arn
 * @param {string} options.input - the input to the lambda function
 * @param {string} options.roleArn - the IAM role to attach to the ECS task
 * @returns {Promise<Object>} the AWS runTask ECS response
 */
async function startTask(options) {
  const ecs = new AWS.ECS()
  const params = {
    cluster: options.cluster,
    taskDefinition: options.taskDefinition,
    launchType: 'FARGATE',
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: options.subnets,
        assignPublicIp: 'ENABLED',
        securityGroups: options.securityGroups
      }
    },
    overrides: {
      containerOverrides: [
        {
          command: [
            'invoke',
            options.arn,
            '--region',
            process.env.AWS_REGION,
            '--event',
            JSON.stringify(options.input)
          ],
          environment: await getEnvVariables(options.arn),
          name: 'SatApiTaskRunner'
        }
      ],
      executionRoleArn: options.roleArn,
      taskRoleArn: options.roleArn
    }
  }

  return ecs.runTask(params).promise()
}

/**
 * Lambda Function's main handler
 *
 * @param {Object} event - Lambda function event object
 * @param {Object} context - Lambda function's context object
 * @param {Function} cb - callback function
 * @returns {Promise} - the output of the startTask function
 */
function handler(event, context, cb) {
  // validate input
  const err = validateLambdaInput(event)
  if (err) {
    cb(err)
    return Promise.reject(err)
  }

  return startTask(event)
    .then((r) => cb(null, r))
    .catch(cb)
}

module.exports = {
  handler
}
