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
} from '@aws-sdk/client-cloudformation';

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
  };
};

export const queryAWSResources = tool({
  description: `Query AWS resources and CloudFormation stacks using natural language. 
    This tool can list resources, get specific resource details, and describe CloudFormation stacks.
    Supports querying EC2 instances, S3 buckets, Lambda functions, RDS databases, and many other AWS services.`,
  inputSchema: z.object({
    action: z.enum(['list_resources', 'get_resource', 'list_stacks', 'describe_stack']).describe(
      'The action to perform: list_resources, get_resource, list_stacks, or describe_stack'
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
      const { cloudControl, cloudFormation } = createAWSClients({ region });

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