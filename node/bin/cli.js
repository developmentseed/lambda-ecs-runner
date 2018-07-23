#!/usr/bin/env node

'use strict'

const fs = require('fs-extra')
const program = require('commander')
const pckg = require('../package.json')
const runner = require('../index')

program.version(pckg.version)

program
  .usage('TYPE COMMAND [options]')

program
  .command('invoke <arn>')
  .description('Invokes a given lambda function')
  .option('-e, --event <event>', 'lambda function input')
  .option('--profile <profile>', 'AWS credentials profile name')
  .option('--region <region>', 'AWS region (defaults to us-east-1)')
  .action((arn, cmd) => {
    let event = {}
    if (cmd.event) {
      event = JSON.parse(cmd.event)
    }
    const tempDir = runner.mkdtemp()
    const region = cmd.region || 'us-east-1'
    const profile = cmd.profile

    runner.configureAws(region, profile)
    runner.invoke(event, arn, tempDir)
      .then(console.log)
      .catch(console.error)
      .then(() => fs.remove(tempDir))
  })

program
  .parse(process.argv)
