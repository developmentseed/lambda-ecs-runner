/* eslint-disable no-param-reassign */

'use strict'

import fs from 'fs-extra'
import path from 'path'
import test from 'ava'
import nock from 'nock'
import sinon from 'sinon'
import AWS from 'aws-sdk'
import archiver from 'archiver'
import { download, invoke, mkdtemp } from '../index'

test.beforeEach(async (t) => {
  t.context.tempDir = mkdtemp()
  t.context.lambdaZip = path.join(t.context.tempDir, 'remoteLambda.zip')

  // zip fake lambda
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(t.context.lambdaZip)
    const archive = archiver('zip')
    output.on('close', resolve)
    output.on('error', reject)
    archive.pipe(output)
    archive.file(path.join(__dirname, 'data/fakeLambda.js'), { name: 'fakeLambda.js' })
    archive.finalize()
  })

  nock('https://example.com')
    .get('/lambda')
    .reply(200, () => fs.createReadStream(t.context.lambdaZip))

  t.context.expectedOutput = [
    'fakeLambda',
    'handler'
  ]
  t.context.stub = sinon.stub(AWS, 'Lambda')
    .returns({
      getFunction: () => ({
        promise: async () => ({
          Code: {
            Location: 'https://example.com/lambda'
          },
          Configuration: {
            Handler: t.context.expectedOutput.join('.'),
            Environment: {
              Variables: {
                ecs_runner_test: 'this is great'
              }
            }
          }
        })
      })
    })
})

test.afterEach.always((t) => {
  t.context.stub.restore()
  fs.removeSync(t.context.tempDir)
})

test.serial('test download', async (t) => {
  const dst = path.join(t.context.tempDir, 'lambda.zip')
  const handlerId = await download('fake', dst)
  t.deepEqual(handlerId, t.context.expectedOutput)

  // make sure the file is download
  const stat = fs.statSync(dst)
  t.true(stat.isFile())

  // check env variable is set
  t.is(process.env.ecs_runner_test, 'this is great')
})

test.serial('test successful invoke', async (t) => {
  const event = { hi: 'bye' }
  const output = await invoke(event, 'fake', t.context.tempDir)

  t.deepEqual(event, output)
})

test.serial('test failed invoke', async (t) => {
  const event = { hi: 'bye', error: 'it failed' }
  const promise = invoke(event, 'fake', t.context.tempDir)
  const error = await t.throws(promise)
  t.is(error, event.error)
})
