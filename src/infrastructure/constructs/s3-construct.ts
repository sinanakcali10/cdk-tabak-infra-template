import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";

export interface S3EventNotification {
  events: s3.EventType[];
  filters?: s3.NotificationKeyFilter[];
  destination: s3.IBucketNotificationDestination;
}

export interface S3BucketProps {
  bucketName?: string;
  versioned?: boolean;
  encryption?: s3.BucketEncryption;
  publicReadAccess?: boolean;
  cors?: s3.CorsRule[];
  lifecycleRules?: s3.LifecycleRule[];
  removalPolicy?: RemovalPolicy;
  autoDeleteObjects?: boolean;
  eventNotifications?: S3EventNotification[];
}

export class S3BucketConstruct extends Construct {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: S3BucketProps) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, id, {
      bucketName: props.bucketName,
      versioned: props.versioned,
      encryption: props.encryption,
      publicReadAccess: props.publicReadAccess,
      cors: props.cors,
      lifecycleRules: props.lifecycleRules,
      removalPolicy: props.removalPolicy,
      autoDeleteObjects: props.autoDeleteObjects,
    });

    if (props.eventNotifications) {
      this.addEventNotifications(props.eventNotifications);
    }
  }

  private addEventNotifications(notifications: S3EventNotification[]) {
    notifications.forEach((notification, index) => {
      this.bucket.addEventNotification(
        notification.events[0],
        notification.destination,
        ...(notification.filters || [])
      );

      if (notification.events.length > 1) {
        for (let i = 1; i < notification.events.length; i++) {
          this.bucket.addEventNotification(
            notification.events[i],
            notification.destination,
            ...(notification.filters || [])
          );
        }
      }
    });
  }
}
