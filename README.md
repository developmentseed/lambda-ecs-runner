# Run Lambda Functions as ECS Tasks

[![CircleCI](https://circleci.com/gh/developmentseed/lambda-ecs-runner.svg?style=svg)](https://circleci.com/gh/developmentseed/lambda-ecs-runner)


## Background

[AWS Lambda](https://aws.amazon.com/lambda/) functions are great but they don't fit a lot of processing and operation requirements. If your processing takes more than 5 minutes or it requires more memory and CPU provided in the Lambda environment, you must rethink where and how to deploy your code.

The ECS [task-runner](https://npmjs.com/package/@developmentseed/task-runner) and [task-starter](https://npmjs.com/package/@developmentseed/task-starter) solves this problem by enabling you to run an existing lambda function as an [ECS task](https://aws.amazon.com/ecs/) on a [Fargate](https://aws.amazon.com/fargate/) box. This approach requires having an existing lambda function in the first place.

- [Task Runner](task-runner/README.md)
- [Task Starter](task-starter/README.md)

## Development

### Install

     $ yarn
     $ yarn bootstrap

### Test
    
     $ yarn test

### Deployment

Tagged commits on `master` branch are automatically deployed to npm and docker