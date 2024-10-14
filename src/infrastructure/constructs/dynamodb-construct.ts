import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";

export interface DynamoDBTableProps {
  tableName: string;
  partitionKey: dynamodb.Attribute;
  sortKey?: dynamodb.Attribute;
  billingMode?: dynamodb.BillingMode;
  readCapacity?: number;
  writeCapacity?: number;
  removalPolicy?: RemovalPolicy;
  pointInTimeRecovery?: boolean;
}

export class DynamoDBTableConstruct extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: DynamoDBTableProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, id, {
      tableName: props.tableName,
      partitionKey: props.partitionKey,
      sortKey: props.sortKey,
      billingMode: props.billingMode,
      readCapacity: props.readCapacity,
      writeCapacity: props.writeCapacity,
      removalPolicy: props.removalPolicy,
      pointInTimeRecovery: props.pointInTimeRecovery,
    });
  }
}
