import { Construct } from "constructs";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export interface GraphqlApiProps
  extends Omit<appsync.GraphqlApiProps, "name" | "schema"> {
  apiName: string;
  schemaPath: string;
  mappingTemplatesPath?: string;
}

export class GraphqlApiConstruct extends Construct {
  public readonly api: appsync.GraphqlApi;
  public readonly sources: Map<string, appsync.DynamoDbDataSource>;

  constructor(scope: Construct, id: string, props: GraphqlApiProps) {
    super(scope, id);

    this.api = new appsync.GraphqlApi(this, "GraphqlApi", {
      name: props.apiName,
      schema: appsync.SchemaFile.fromAsset(props.schemaPath),
      ...props,
    });

    this.sources = new Map();
  }

  addDynamoDbDataSource(
    id: string,
    table: dynamodb.ITable,
    name?: string
  ): appsync.DynamoDbDataSource {
    const source = this.api.addDynamoDbDataSource(id, table, { name });
    this.sources.set(id, source);
    return source;
  }

  addScanResolver(
    id: string,
    sourceId: string,
    fieldName: string,
    typeName: string = "Query"
  ) {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Data source "${sourceId}" not found`);
    }

    source.createResolver(id, {
      typeName,
      fieldName,
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });
  }

  addCustomResolver(
    id: string,
    sourceId: string,
    fieldName: string,
    typeName: "Query" | "Mutation",
    requestTemplateFile: string,
    responseTemplateFile: string
  ) {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Data source "${sourceId}" not found`);
    }

    source.createResolver(id, {
      typeName,
      fieldName,
      requestMappingTemplate:
        appsync.MappingTemplate.fromFile(requestTemplateFile),
      responseMappingTemplate:
        appsync.MappingTemplate.fromFile(responseTemplateFile),
    });
  }
}
