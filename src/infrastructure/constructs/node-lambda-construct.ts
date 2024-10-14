import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambdaBase from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";
import { Duration } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";

export interface NodejsLambdaProps {
  functionName: string;
  entry: string;
  handler?: string;
  runtime?: lambdaBase.Runtime;
  environment?: { [key: string]: string };
  timeout?: Duration;
  memorySize?: number;
  layers?: lambdaBase.ILayerVersion[];
  eventSources?: lambdaBase.IEventSource[];
  initialPolicy?: iam.PolicyStatement[];
}

export class NodejsLambdaConstruct extends Construct {
  public readonly function: lambda.NodejsFunction;

  constructor(scope: Construct, id: string, props: NodejsLambdaProps) {
    super(scope, id);

    this.function = new lambda.NodejsFunction(this, id, {
      functionName: props.functionName,
      runtime: props.runtime || lambdaBase.Runtime.NODEJS_18_X,
      handler: props.handler || "handler",
      entry: path.join(__dirname, props.entry),
      environment: props.environment,
      timeout: props.timeout || Duration.seconds(30),
      memorySize: props.memorySize || 128,
      layers: props.layers,
      initialPolicy: props.initialPolicy,
    });

    if (props.eventSources) {
      props.eventSources.forEach((eventSource, index) => {
        this.function.addEventSource(eventSource);
      });
    }
  }

  public addPermission(id: string, permission: lambdaBase.Permission) {
    this.function.addPermission(id, permission);
  }
}
