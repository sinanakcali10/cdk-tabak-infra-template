import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { createTextualAnalysisStackResources } from "../config/textual-analysis-stack-resources";

interface TextualAnalysisStackProps extends cdk.StackProps {
  suffix: string;
}

export class TextualAnalysisStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TextualAnalysisStackProps) {
    super(scope, id, props);
    const textualAnalysisResources = createTextualAnalysisStackResources(
      this,
      props.suffix
    );
    Object.entries(textualAnalysisResources).forEach(([key, value]) => {
      new cdk.CfnOutput(this, `${key}Output`, {
        ...value.outputProps,
        exportName: `${key}-${props.suffix}`,
      });
    });
  }
}
