import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";
import { Duration } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";

export interface PythonLambdaProps {
  functionName: string;
  entry: string;
  handler: string;
  runtime?: lambda.Runtime;
  environment?: { [key: string]: string };
  timeout?: Duration;
  memorySize?: number;
  layers?: lambda.ILayerVersion[];
  eventSources?: lambda.IEventSource[];
  initialPolicy?: iam.PolicyStatement[];
}

export class PythonLambdaConstruct extends Construct {
  public readonly function: lambda.Function;

  constructor(scope: Construct, id: string, props: PythonLambdaProps) {
    super(scope, id);

    this.function = new lambda.Function(this, id, {
      functionName: props.functionName,
      runtime: props.runtime || lambda.Runtime.PYTHON_3_9,
      handler: props.handler,
      code: lambda.Code.fromAsset(path.join(__dirname, props.entry)),
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

  public addPermission(id: string, permission: lambda.Permission) {
    this.function.addPermission(id, permission);
  }
}
