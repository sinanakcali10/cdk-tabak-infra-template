import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export interface ApiGatewayProps {
  restApiName: string;
  description?: string;
  deployOptions?: apigateway.StageOptions;
  enableCors?: boolean;
  corsOptions?: apigateway.CorsOptions;
  cognitoUserPool?: cognito.IUserPool;
  cognitoUserPoolClients?: cognito.IUserPoolClient[];
}

export class ApiGatewayConstruct extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly authorizer?: apigateway.CognitoUserPoolsAuthorizer;

  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id);

    this.api = new apigateway.RestApi(this, "RestApi", {
      restApiName: props.restApiName,
      description: props.description,
      deployOptions: props.deployOptions,
      defaultCorsPreflightOptions: props.enableCors
        ? props.corsOptions || {
            allowOrigins: apigateway.Cors.ALL_ORIGINS,
            allowMethods: apigateway.Cors.ALL_METHODS,
          }
        : undefined,
    });

    if (props.cognitoUserPool && props.cognitoUserPoolClients) {
      this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(
        this,
        "CognitoAuthorizer",
        {
          cognitoUserPools: [props.cognitoUserPool],
        }
      );
    }
  }

  public addResource(path: string): apigateway.Resource {
    return this.api.root.addResource(path);
  }

  public addMethod(
    resource: apigateway.Resource,
    httpMethod: string,
    integration: apigateway.Integration | lambda.IFunction,
    useAuthorizer: boolean = false,
    authorizationScopes?: string[]
  ) {
    let methodOptions: apigateway.MethodOptions = {};

    if (useAuthorizer && this.authorizer) {
      methodOptions = {
        authorizer: this.authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
        authorizationScopes: authorizationScopes,
      };
    }

    let resolvedIntegration: apigateway.Integration;

    if (integration instanceof lambda.Function) {
      resolvedIntegration = new apigateway.LambdaIntegration(integration);
    } else if ("bind" in integration) {
      resolvedIntegration = integration;
    } else {
      throw new Error("Invalid integration type");
    }

    resource.addMethod(httpMethod, resolvedIntegration, methodOptions);
  }

  public addLambdaIntegration(
    resource: apigateway.Resource,
    httpMethod: string,
    lambdaFunction: lambda.IFunction,
    useAuthorizer: boolean = false,
    authorizationScopes?: string[]
  ) {
    this.addMethod(
      resource,
      httpMethod,
      lambdaFunction,
      useAuthorizer,
      authorizationScopes
    );
  }
}
