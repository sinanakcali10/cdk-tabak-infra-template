import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as sfn_tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as path from "path";

export interface FargateJobProps {
  vpc: ec2.IVpc;
  cluster: ecs.ICluster;
  dockerAssetPath: string;
  suffix?: string;
  cpu?: number;
  memoryLimitMiB?: number;
  containerName?: string;
  logStreamPrefix?: string;
  buckets?: s3.IBucket[];
  tables?: dynamodb.ITable[];
  platform?: ecr_assets.Platform;
  environmentVariables?: { [key: string]: string };
  command?: string[];
}

export class FargateJobConstruct extends Construct {
  public readonly asset: ecr_assets.DockerImageAsset;
  public readonly taskDefinition: ecs.FargateTaskDefinition;
  public readonly container: ecs.ContainerDefinition;
  public readonly runTask: sfn_tasks.EcsRunTask;

  constructor(scope: Construct, id: string, props: FargateJobProps) {
    super(scope, id);

    const suffix = props.suffix ? `-${props.suffix}` : "";

    this.asset = new ecr_assets.DockerImageAsset(
      scope,
      `${id}-asset${suffix}`,
      {
        directory: path.join(__dirname, props.dockerAssetPath),
        platform: props.platform || ecr_assets.Platform.LINUX_AMD64,
      }
    );

    this.taskDefinition = new ecs.FargateTaskDefinition(
      scope,
      `${id}-taskdef${suffix}`,
      {
        memoryLimitMiB: props.memoryLimitMiB || 512,
        cpu: props.cpu || 256,
      }
    );

    this.container = this.taskDefinition.addContainer(
      `${id}-container${suffix}`,
      {
        image: ecs.ContainerImage.fromDockerImageAsset(this.asset),
        logging: ecs.LogDrivers.awsLogs({
          streamPrefix: props.logStreamPrefix || `fargate-${id}-logs${suffix}`,
        }),
        environment: props.environmentVariables,
        command: props.command,
      }
    );

    this.runTask = new sfn_tasks.EcsRunTask(scope, `${id}-runner${suffix}`, {
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      cluster: props.cluster,
      taskDefinition: this.taskDefinition,
      launchTarget: new sfn_tasks.EcsFargateLaunchTarget(),
      containerOverrides: [
        {
          containerDefinition: this.container,
          environment: props.environmentVariables
            ? Object.entries(props.environmentVariables).map(
                ([name, value]) => ({ name, value })
              )
            : undefined,
          command: props.command,
        },
      ],
    });

    props.buckets?.forEach((bucket) =>
      bucket.grantReadWrite(this.taskDefinition.taskRole)
    );
    props.tables?.forEach((table) =>
      table.grantReadWriteData(this.taskDefinition.taskRole)
    );
  }
}
