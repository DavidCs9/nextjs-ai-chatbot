'use server';

import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

interface AWSAccountInfo {
  success: boolean;
  accountId?: string;
  arn?: string;
  userId?: string;
  region?: string;
  error?: string;
  isCredentialError?: boolean;
}

const createSTSClient = () => {
  const awsConfig = {
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  };

  return new STSClient(awsConfig);
};

export async function getAWSAccountInfo(): Promise<AWSAccountInfo> {
  try {
    const stsClient = createSTSClient();
    const command = new GetCallerIdentityCommand({});
    const response = await stsClient.send(command);

    return {
      success: true,
      accountId: response.Account,
      arn: response.Arn,
      userId: response.UserId,
      region: process.env.AWS_DEFAULT_REGION || 'eu-west-1',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    // Check for common credential-related errors
    const isCredentialError =
      errorMessage.includes('Unable to locate credentials') ||
      errorMessage.includes(
        'The security token included in the request is invalid',
      ) ||
      errorMessage.includes('Token has expired') ||
      errorMessage.includes('credentials') ||
      errorMessage.includes('ExpiredToken');

    return {
      success: false,
      error: errorMessage,
      isCredentialError,
      region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    };
  }
}
