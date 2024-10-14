import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { createAdvancedAnalyticsStackResources } from "../config/advanced-analytics-stack-resources";

interface AdvancedAnalyticsStackProps extends cdk.StackProps {
  suffix: string;
}

export class AdvancedAnalyticsStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: AdvancedAnalyticsStackProps
  ) {
    super(scope, id, props);
    const advancedAnalyticsResources = createAdvancedAnalyticsStackResources(
      this,
      props.suffix
    );
    Object.entries(advancedAnalyticsResources).forEach(([key, value]) => {
      new cdk.CfnOutput(this, `${key}Output`, {
        ...value.outputProps,
        exportName: `${key}-${props.suffix}`,
      });
    });
  }
}
