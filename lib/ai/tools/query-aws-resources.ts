import { tool } from 'ai';
import { z } from 'zod';
import {
  CloudControlClient,
  ListResourcesCommand,
  GetResourceCommand,
} from '@aws-sdk/client-cloudcontrol';
import {
  CloudFormationClient,
  DescribeStacksCommand,
  ListStacksCommand,
  DescribeStackResourcesCommand,
} from '@aws-sdk/client-cloudformation';
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import {
  S3Client,
  ListBucketsCommand,
  GetBucketLocationCommand,
} from '@aws-sdk/client-s3';

interface AWSConfig {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

const createAWSClients = (config: AWSConfig = {}) => {
  const awsConfig = {
    region: config.region || process.env.AWS_DEFAULT_REGION || 'us-east-1',
    ...(config.accessKeyId && config.secretAccessKey && {
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  };

  return {
    cloudControl: new CloudControlClient(awsConfig),
    cloudFormation: new CloudFormationClient(awsConfig),
    cloudWatchLogs: new CloudWatchLogsClient(awsConfig),
    s3: new S3Client(awsConfig),
  };
};

export const queryAWSResources = tool({
  description: `Query AWS resources and CloudFormation stacks using natural language. 
    This tool can list resources, get specific resource details, and describe CloudFormation stacks.
    Supports querying EC2 instances, S3 buckets, Lambda functions, RDS databases, and many other AWS services.`,
  inputSchema: z.object({
    action: z.enum(['list_resources', 'get_resource', 'list_stacks', 'describe_stack', 'describe_stack_resources', 'list_log_groups', 'list_s3_buckets']).describe(
      'The action to perform: list_resources, get_resource, list_stacks, describe_stack, describe_stack_resources, list_log_groups, or list_s3_buckets'
    ),
    resourceType: z.string().optional().describe(
      'AWS resource type (e.g., AWS::EC2::Instance, AWS::S3::Bucket, AWS::Lambda::Function)'
    ),
    resourceIdentifier: z.string().optional().describe(
      'Specific resource identifier for get_resource action'
    ),
    stackName: z.string().optional().describe(
      'CloudFormation stack name for describe_stack action'
    ),
    region: z.string().optional().describe('AWS region to query (defaults to us-east-1)')
  }),
  execute: async ({ action, resourceType, resourceIdentifier, stackName, region }) => {
    try {
      const { cloudControl, cloudFormation, cloudWatchLogs, s3 } = createAWSClients({ region });

      switch (action) {
        case 'list_resources': {
          if (!resourceType) {
            throw new Error('resourceType is required for list_resources action');
          }

          const command = new ListResourcesCommand({
            TypeName: resourceType,
            MaxResults: 50,
          });

          const response = await cloudControl.send(command);
          
          return {
            success: true,
            action: 'list_resources',
            resourceType,
            count: response.ResourceDescriptions?.length || 0,
            resources: response.ResourceDescriptions?.map(resource => ({
              identifier: resource.Identifier,
              properties: resource.Properties ? JSON.parse(resource.Properties) : null,
            })) || [],
          };
        }

        case 'get_resource': {
          if (!resourceType || !resourceIdentifier) {
            throw new Error('Both resourceType and resourceIdentifier are required for get_resource action');
          }

          const command = new GetResourceCommand({
            TypeName: resourceType,
            Identifier: resourceIdentifier,
          });

          const response = await cloudControl.send(command);
          
          return {
            success: true,
            action: 'get_resource',
            resourceType,
            identifier: resourceIdentifier,
            resource: {
              identifier: response.ResourceDescription?.Identifier,
              properties: response.ResourceDescription?.Properties ? 
                JSON.parse(response.ResourceDescription.Properties) : null,
            },
          };
        }

        case 'list_stacks': {
          const command = new ListStacksCommand({
            StackStatusFilter: [
              'CREATE_COMPLETE',
              'UPDATE_COMPLETE',
              'DELETE_FAILED',
              'CREATE_FAILED',
              'ROLLBACK_COMPLETE',
              'UPDATE_ROLLBACK_COMPLETE',
            ],
          });

          const response = await cloudFormation.send(command);
          
          return {
            success: true,
            action: 'list_stacks',
            count: response.StackSummaries?.length || 0,
            stacks: response.StackSummaries?.map(stack => ({
              stackName: stack.StackName,
              stackStatus: stack.StackStatus,
              creationTime: stack.CreationTime,
              lastUpdatedTime: stack.LastUpdatedTime,
              templateDescription: stack.TemplateDescription,
            })) || [],
          };
        }

        case 'describe_stack': {
          if (!stackName) {
            throw new Error('stackName is required for describe_stack action');
          }

          const command = new DescribeStacksCommand({
            StackName: stackName,
          });

          const response = await cloudFormation.send(command);
          const stack = response.Stacks?.[0];
          
          return {
            success: true,
            action: 'describe_stack',
            stackName,
            stack: stack ? {
              stackName: stack.StackName,
              stackStatus: stack.StackStatus,
              creationTime: stack.CreationTime,
              lastUpdatedTime: stack.LastUpdatedTime,
              description: stack.Description,
              parameters: stack.Parameters,
              outputs: stack.Outputs,
              tags: stack.Tags,
              capabilities: stack.Capabilities,
            } : null,
          };
        }

        case 'describe_stack_resources': {
          if (!stackName) {
            throw new Error('stackName is required for describe_stack_resources action');
          }

          const command = new DescribeStackResourcesCommand({
            StackName: stackName,
          });

          const response = await cloudFormation.send(command);
          
          return {
            success: true,
            action: 'describe_stack_resources',
            stackName,
            resources: response.StackResources?.map(resource => ({
              logicalResourceId: resource.LogicalResourceId,
              physicalResourceId: resource.PhysicalResourceId,
              resourceType: resource.ResourceType,
              resourceStatus: resource.ResourceStatus,
              resourceStatusReason: resource.ResourceStatusReason,
              timestamp: resource.Timestamp,
              description: resource.Description,
            })) || [],
            count: response.StackResources?.length || 0,
          };
        }

        case 'list_log_groups': {
          const command = new DescribeLogGroupsCommand({
            limit: 50,
          });

          const response = await cloudWatchLogs.send(command);
          
          return {
            success: true,
            action: 'list_log_groups',
            logGroups: response.logGroups?.map(logGroup => ({
              logGroupName: logGroup.logGroupName,
              creationTime: logGroup.creationTime,
              retentionInDays: logGroup.retentionInDays,
              storedBytes: logGroup.storedBytes,
              arn: logGroup.arn,
              metricFilterCount: logGroup.metricFilterCount,
            })) || [],
            count: response.logGroups?.length || 0,
          };
        }

        case 'list_s3_buckets': {
          const command = new ListBucketsCommand({});
          const response = await s3.send(command);
          
          // Get bucket locations (regions) for each bucket
          const bucketsWithRegion = await Promise.all(
            (response.Buckets || []).map(async (bucket) => {
              try {
                const locationCommand = new GetBucketLocationCommand({
                  Bucket: bucket.Name!,
                });
                const locationResponse = await s3.send(locationCommand);
                return {
                  bucketName: bucket.Name,
                  creationDate: bucket.CreationDate,
                  region: locationResponse.LocationConstraint || 'us-east-1',
                };
              } catch (error) {
                // If we can't get the location, return without it
                return {
                  bucketName: bucket.Name,
                  creationDate: bucket.CreationDate,
                  region: 'unknown',
                };
              }
            })
          );
          
          return {
            success: true,
            action: 'list_s3_buckets',
            buckets: bucketsWithRegion,
            count: bucketsWithRegion.length,
          };
        }

        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    } catch (error) {
      const errorResponse: Record<string, any> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        action,
      };
      
      if (resourceType) errorResponse.resourceType = resourceType;
      if (resourceIdentifier) errorResponse.resourceIdentifier = resourceIdentifier;
      if (stackName) errorResponse.stackName = stackName;
      
      return errorResponse;
    }
  },
});