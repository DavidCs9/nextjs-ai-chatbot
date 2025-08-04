'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { AlertTriangleIcon, CloudIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAWSAccountInfo } from '@/hooks/use-aws-account-info';

export function AWSAccountInfo() {
  const { accountInfo, isLoading, isRefreshing, refresh } = useAWSAccountInfo();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <CloudIcon className="size-4 animate-pulse text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!accountInfo?.success) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="size-4 text-destructive" />
            <Badge variant="destructive" className="text-xs">
              AWS Error
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={isRefreshing}
              className="size-6 p-0"
            >
              <RefreshCwIcon
                className={`size-3 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium text-destructive">
              AWS Connection Failed
            </p>
            {accountInfo?.isCredentialError ? (
              <div className="space-y-1">
                <p className="text-sm">Credential issue detected</p>
                <p className="text-xs text-muted-foreground">
                  Check your AWS credentials or token expiry
                </p>
              </div>
            ) : (
              <p className="text-sm">{accountInfo?.error || 'Unknown error'}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Region: {accountInfo?.region || 'us-east-1'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Format account ID for display (show first 4 and last 4 digits)
  const formatAccountId = (accountId: string) => {
    if (accountId.length === 12) {
      return `${accountId.slice(0, 4)}****${accountId.slice(-4)}`;
    }
    return accountId;
  };

  // Extract account alias or role name from ARN
  const extractRoleInfo = (arn?: string) => {
    if (!arn) return null;

    // For assumed roles: arn:aws:sts::123456789012:assumed-role/RoleName/SessionName
    const assumedRoleMatch = arn.match(/assumed-role\/([^\/]+)/);
    if (assumedRoleMatch) {
      return { type: 'Role', name: assumedRoleMatch[1] };
    }

    // For IAM users: arn:aws:iam::123456789012:user/UserName
    const userMatch = arn.match(/user\/(.+)$/);
    if (userMatch) {
      return { type: 'User', name: userMatch[1] };
    }

    // For root: arn:aws:iam::123456789012:root
    if (arn.includes(':root')) {
      return { type: 'Root', name: 'Root User' };
    }

    return null;
  };

  const roleInfo = extractRoleInfo(accountInfo.arn);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <CloudIcon className="size-4 text-emerald-600" />
          <Badge variant="secondary" className="text-xs font-mono">
            {accountInfo.accountId
              ? formatAccountId(accountInfo.accountId)
              : 'Unknown'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isRefreshing}
            className="size-6 p-0"
          >
            <RefreshCwIcon
              className={`size-3 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CloudIcon className="size-4 text-emerald-600" />
            <span className="font-medium">AWS Account Connected</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
              <span className="text-muted-foreground">Account ID:</span>
              <span className="font-mono">{accountInfo.accountId}</span>

              <span className="text-muted-foreground">Region:</span>
              <span>{accountInfo.region}</span>

              {roleInfo && (
                <>
                  <span className="text-muted-foreground">
                    {roleInfo.type}:
                  </span>
                  <span className="font-medium truncate" title={roleInfo.name}>
                    {roleInfo.name.length > 30
                      ? `${roleInfo.name.slice(0, 30)}...`
                      : roleInfo.name}
                  </span>
                </>
              )}

              {accountInfo.userId && (
                <>
                  <span className="text-muted-foreground">User ID:</span>
                  <span
                    className="font-mono text-xs truncate"
                    title={accountInfo.userId}
                  >
                    {accountInfo.userId.length > 30
                      ? `${accountInfo.userId.slice(0, 30)}...`
                      : accountInfo.userId}
                  </span>
                </>
              )}
            </div>
          </div>

          {accountInfo.arn && (
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground mb-1">ARN:</p>
              <p className="text-xs font-mono break-all bg-muted/50 p-2 rounded text-foreground/80">
                {accountInfo.arn}
              </p>
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
