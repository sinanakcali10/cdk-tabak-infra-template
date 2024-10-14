import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { createRagStackResources } from "../config/rag-stack-resources";

interface RagStackProps extends cdk.StackProps {
  suffix: string;
}

export class RagStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: RagStackProps) {
    super(scope, id, props);
    const ragResources = createRagStackResources(this, props.suffix);
    Object.entries(ragResources).forEach(([key, value]) => {
      new cdk.CfnOutput(this, `${key}Output`, {
        ...value.outputProps,
        exportName: `${key}-${props.suffix}`,
      });
    });
  }
}
