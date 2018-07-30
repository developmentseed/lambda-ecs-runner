# @developmentseed/task-starter

## Background

[AWS Lambda](https://aws.amazon.com/lambda/) functions are great but they don't fit a lot of processing and operation requirements. If your processing takes more than 5 minutes or it requires more memory and CPU provided in the Lambda environment, you must rethink where and how to deploy your code.

The ECS [task-runner](https://npmjs.com/package/@developmentseed/task-runner) and [task-starter](https://npmjs.com/package/@developmentseed/task-starter) solves this problem by enabling you to run an existing lambda function as an [ECS task](https://aws.amazon.com/ecs/) on a [Fargate](https://aws.amazon.com/fargate/) box. This approach requires having an existing lambda function in the first place.

## Task Starter

task-starter is a lambda function that works with [task-runner] docker image. This lambda function receives a set of input parameters and starts an ECS task. You have to already setup the Task Runner on your aws account before you can use the task-starter.

### Input Requirements

| field | type | purpose
| ----- | ---- | -------
| arn | string | the Lambda function arn
| input | object | the input (event) to be given to the lambda function
| subnets | array of strings | list of subnets to run a Fargate instance on (this subnet must have access to internet)
| securityGroups | array of strings | list of security groups to run a Fargate instance on
| cluster | string | name of the cluster where the ECS task is going to be executed on
| taskDefinition | string | name of an existing task definition for task-runner
| roleArn | string | the IAM role arn to be attached to the ECS task


Example:

```json
{
  "arn": "arn:aws:lambda:us-west-2:00000000000:function:myTestLambdaFunction",
  "input": {},
  "subnets": [
    "subnet-44e36e0f"
  ],
  "securityGroups": [
    "sg-baddbfcb"
  ],
  "cluster": "taskRunnerECSCluster",
  "taskDefinition": "taskRunnerTaskDefinition:1",
  "roleArn": "arn:aws:iam::00000000000:role/taskRunnerRole"
}
```