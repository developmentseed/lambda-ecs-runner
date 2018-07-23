'use strict'

const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')
const got = require('got')
const extract = require('extract-zip')

/**
 * Downloads the zip file associated with the arn of
 * a lambda function
 *
 * @param {string} arn - the lambda function arn 
 * @param {string} dst - path to where store the zip file
 * @returns {Promise<string>} the handlerId returned by the lambda api 
 */
async function download(arn, dst) {
  const lambda = new AWS.Lambda()

  const data = await lambda.getFunction({ FunctionName: arn }).promise()
  const codeLocation = data.Code.Location
  const handlerId = data.handlerId

  const file = got.stream(codeLocation)
    .pipe(fs.createWriteStream(dst))

  return new Promise((resolve, reject) => {
    file.on('finish', () => resolve(handlerId.split('.')))
    file.on('error', reject)
  })
}

/**
 * Downloads a given lambda function, unzip and invoke it
 * with the given input (event)
 *
 * @param {Object} event - input to the lambda function 
 * @param {string} arn - the lambda function arn 
 * @param {string} dir - the directory to store the lambda function at
 * @returns {Promise<*>} the output of the lambda function
 */
async function invoke(event, arn, dir) {
  const zipFile = path.join(dir, 'lambda.zip')

  // download the lambda
  const handlerId = await download(arn, zipFile)
  const handlerPath = handlerId[0]
  const handler = handlerId[1]

  // unzip the lambda
  await new Promise((resolve, reject) => extract(zipFile, { dir }, (err) => {
    if (err) return reject(err);
    return resolve()
  }))

  const lambda = require(path.join(dir, handlerPath))
  return new Promise((resolve, reject) => {
    lambda[handler](event, {}, (e, r) => {
      if (e) return reject(e)
      return resolve(r)
    })
  })
}

module.exports = {
  download,
  invoke
}