import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import { Construct } from "constructs";

export interface ParallelLambdaConfig {
  lambdaFunction: lambda.IFunction;
  inputPath?: string;
  resultPath?: string;
}

export interface StepFunctionProps {
  stateMachineName: string;
  parallelLambdas: ParallelLambdaConfig[];
  cloudWatchTrigger?: {
    ruleName: string;
    scheduleExpression: string;
  };
}

export class StepFunctionConstruct extends Construct {
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: StepFunctionProps) {
    super(scope, id);

    const parallelTasks = new sfn.Parallel(this, "ParallelExecution");

    props.parallelLambdas.forEach((lambdaConfig, index) => {
      const task = new tasks.LambdaInvoke(this, `LambdaTask${index}`, {
        lambdaFunction: lambdaConfig.lambdaFunction,
        inputPath: lambdaConfig.inputPath,
        resultPath: lambdaConfig.resultPath,
      });
      parallelTasks.branch(task);
    });

    this.stateMachine = new sfn.StateMachine(this, "StateMachine", {
      stateMachineName: props.stateMachineName,
      definition: parallelTasks,
    });

    if (props.cloudWatchTrigger) {
      new events.Rule(this, "ScheduleRule", {
        ruleName: props.cloudWatchTrigger.ruleName,
        schedule: events.Schedule.expression(
          props.cloudWatchTrigger.scheduleExpression
        ),
        targets: [new targets.SfnStateMachine(this.stateMachine)],
      });
    }
  }
}
