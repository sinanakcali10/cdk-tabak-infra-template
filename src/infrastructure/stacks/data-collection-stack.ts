import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { createDataCollectionStackResources } from "../config/data-collection-stack-resources";

interface DataCollectionStackProps extends cdk.StackProps {
  suffix: string;
}

export class DataCollectionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DataCollectionStackProps) {
    super(scope, id, props);
    const dataCollectionResources = createDataCollectionStackResources(
      this,
      props.suffix
    );
    Object.entries(dataCollectionResources).forEach(([key, value]) => {
      new cdk.CfnOutput(this, `${key}Output`, {
        ...value.outputProps,
        exportName: `${key}-${props.suffix}`,
      });
    });
  }
}
