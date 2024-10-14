#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { RagStack } from "../src/infrastructure/stacks/rag-stack";
import { AdvancedAnalyticsStack } from "../src/infrastructure/stacks/advanced-analytics-stack";
import { TextualAnalysisStack } from "../src/infrastructure/stacks/textual-analysis-stack";
import { WebStack } from "../src/infrastructure/stacks/web-stack";
import { DataCollectionStack } from "../src/infrastructure/stacks/data-collection-stack";

const app = new cdk.App();

const env = {
  account: process.env.ACCOUNT_ID,
  region: process.env.PROJECT_REGION,
};

function createApp(suffix: string, env: cdk.Environment) {
  new RagStack(app, `RagStack-${suffix}`, { suffix, env });
  new AdvancedAnalyticsStack(app, `AdvancedAnalyticsStack-${suffix}`, {
    suffix,
    env,
  });
  new TextualAnalysisStack(app, `TextualAnalysisStack-${suffix}`, {
    suffix,
    env,
  });
  new WebStack(app, `WebStack-${suffix}`, { suffix, env });
  new DataCollectionStack(app, `DataCollectionStack-${suffix}`, {
    suffix,
    env,
  });
}

if (process.env.NODE_ENV === "dev") {
  createApp("dev", env);
} else if (process.env.NODE_ENV === "test") {
  createApp("test", env);
} else if (process.env.NODE_ENV === "prod") {
  createApp("prod", env);
} else {
  throw new Error(
    "Environment not found, check NODE_ENV environment variable is set correctly."
  );
}
