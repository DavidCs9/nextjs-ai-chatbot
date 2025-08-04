import { tool } from 'ai';
import { z } from 'zod';
import {
  STSClient,
  GetCallerIdentityCommand,
} from '@aws-sdk/client-sts';

interface AWSConfig {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

const createSTSClient = (config: AWSConfig = {}) => {
  const awsConfig = {
    region: config.region || process.env.AWS_DEFAULT_REGION || 'us-east-1',
    ...(config.accessKeyId && config.secretAccessKey && {
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        sessionToken: config.sessionToken,
      },
    }),
  };

  return new STSClient(awsConfig);
};

export const getAWSAccountInfo = tool({
  description: `Get AWS account information using STS GetCallerIdentity. 
    Returns the AWS account ID, user ARN, and user ID of the current credentials.`,
  inputSchema: z.object({
    region: z.string().optional().describe('AWS region to use (defaults to us-east-1)')
  }),
  execute: async ({ region }) => {
    try {
      const stsClient = createSTSClient({ region });
      const command = new GetCallerIdentityCommand({});
      const response = await stsClient.send(command);
      
      return {
        success: true,
        accountId: response.Account,
        arn: response.Arn,
        userId: response.UserId,
        region: region || process.env.AWS_DEFAULT_REGION || 'us-east-1',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Check for common credential-related errors
      const isCredentialError = errorMessage.includes('Unable to locate credentials') ||
                               errorMessage.includes('The security token included in the request is invalid') ||
                               errorMessage.includes('Token has expired') ||
                               errorMessage.includes('credentials');

      return {
        success: false,
        error: errorMessage,
        isCredentialError,
        region: region || process.env.AWS_DEFAULT_REGION || 'us-east-1',
      };
    }
  },
});
