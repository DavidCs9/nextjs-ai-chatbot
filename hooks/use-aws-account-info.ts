import { useState, useEffect, useCallback } from 'react';
import { getAWSAccountInfo } from '@/lib/aws/actions';

interface AWSAccountInfo {
  success: boolean;
  accountId?: string;
  arn?: string;
  userId?: string;
  region?: string;
  error?: string;
  isCredentialError?: boolean;
}

export function useAWSAccountInfo() {
  const [accountInfo, setAccountInfo] = useState<AWSAccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAccountInfo = useCallback(async () => {
    try {
      const info = await getAWSAccountInfo();
      setAccountInfo(info);
    } catch (error) {
      setAccountInfo({
        success: false,
        error: 'Failed to fetch AWS account information',
        isCredentialError: true,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAccountInfo();
  }, [fetchAccountInfo]);

  useEffect(() => {
    fetchAccountInfo();
  }, [fetchAccountInfo]);

  return {
    accountInfo,
    isLoading,
    isRefreshing,
    refresh,
  };
}
