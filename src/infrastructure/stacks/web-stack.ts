import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { createWebStackResources } from "../config/web-stack-resources";

interface WebStackProps extends cdk.StackProps {
  suffix: string;
}

export class WebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);
    const webResources = createWebStackResources(this, props.suffix);
    Object.entries(webResources).forEach(([key, value]) => {
      new cdk.CfnOutput(this, `${key}Output`, {
        ...value.outputProps,
        exportName: `${key}-${props.suffix}`,
      });
    });
  }
}
