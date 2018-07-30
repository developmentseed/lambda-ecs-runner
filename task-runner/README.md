# @developmentseed/task-runner

## Background

[AWS Lambda](https://aws.amazon.com/lambda/) functions are great but they don't fit a lot of processing and operation requirements. If your processing takes more than 5 minutes or it requires more memory and CPU provided in the Lambda environment, you must rethink where and how to deploy your code.

The ECS [task-runner](https://npmjs.com/package/@developmentseed/task-runner) and [task-starter](https://npmjs.com/package/@developmentseed/task-starter) solves this problem by enabling you to run an existing lambda function as an [ECS task](https://aws.amazon.com/ecs/) on a [Fargate](https://aws.amazon.com/fargate/) box. This approach requires having an existing lambda function in the first place.

## Task Runner

The task runner is a Docker image that you can use inside the ECS environment to run existing Lambda function as ECS tasks. When a given a Lambda function ARN, the docker image downloads the zip file of the Lambda function and runs at in a similar environment to Lambda.

### CLI

You can use the task-runner's CLI to invoke a Lambda Function with the docker environment by running:

     $ task-runner invoke <lambda arn> --profile <aws profile> --event <input to the lambda> --region <aws region>

You can run the same command in docker by running:

     $ docker run --rm -it developmentseed/lambda-ecs-runner:latest invoke <lambda arn> --profile <aws profile> --event <input to the lambda> --region <aws region>
