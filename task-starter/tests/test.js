'use strict'

const test = require('ava')

const AWS = require('aws-sdk')
const sinon = require('sinon')
const { handler } = require('../src/index')

function callback() {
  // do nothing
}

const event = {
  arn: '1',
  input: {},
  subnets: [1],
  securityGroups: [1],
  cluster: '1',
  taskDefinition: '1',
  roleArn: '1'
}

Object.keys(event).forEach((key) => {
  test(`should fail without ${key}`, async (t) => {
    const input = Object.assign({}, event)
    delete input[key]
    const promise = handler(input, {}, callback)
    const msg = await t.throws(promise)
    t.truthy(msg.message)
  })
})

test('subnet must be list', async (t) => {
  const input = Object.assign({}, event)
  input.subnets = '1'
  const promise = handler(input, {}, callback)
  const msg = await t.throws(promise)
  t.is(msg.message, 'subnets must be an array')
})

test('securityGroups must be list', async (t) => {
  const input = Object.assign({}, event)
  input.securityGroups = '1'
  const promise = handler(input, {}, callback)
  const msg = await t.throws(promise)
  t.is(msg.message, 'securityGroups must be an array')
})

test('input must be an object', async (t) => {
  const input = Object.assign({}, event)
  input.input = '1'
  const promise = handler(input, {}, callback)
  const msg = await t.throws(promise)
  t.is(msg.message, 'input must be an object')
})

test('test handler', async (t) => {
  const input = {
    arn: 'fake-arn',
    input: {
      test: 'testing'
    },
    subnets: ['subnet'],
    securityGroups: ['security'],
    cluster: 'fakeCluster',
    taskDefinition: 'fakeDefinition',
    roleArn: 'myRole'
  }

  const stubEnvs = sinon.stub(AWS, 'Lambda')
    .returns({
      getFunction: () => ({
        promise: async () => ({
          Configuration: {
            Environment: {
              Variables: {
                ecs_runner_test: 'this is great'
              }
            }
          }
        })
      })
    })

  const stubEcs = sinon.stub(AWS, 'ECS')
    .returns({
      runTask: (params) => {
        t.is(params.cluster, input.cluster)
        t.is(params.taskDefinition, input.taskDefinition)
        t.is(
          params.overrides.containerOverrides[0].environment[0].name,
          'ecs_runner_test'
        )
        t.is(
          params.overrides.containerOverrides[0].environment[0].value,
          'this is great'
        )
        return {
          promise: async () => {
            return {
              Configuration: {
                Environment: {
                  Variables: {
                    ecs_runner_test: 'this is great'
                  }
                }
              }
            }
          }
        }
      }
    })

  await handler(input, {}, callback)
  stubEnvs.restore()
  stubEcs.restore()
})

