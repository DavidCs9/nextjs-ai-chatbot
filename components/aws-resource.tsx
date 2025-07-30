import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircleIcon, AlertCircleIcon, XCircleIcon, ClockIcon } from './icons';
import { cn } from '@/lib/utils';

interface AWSResourceProps {
  data?: Record<string, any>;
  isLoading?: boolean;
}

const getStatusIcon = (status: string) => {
  if (status.includes('COMPLETE')) {
    return <CheckCircleIcon className="size-4 text-green-500" />;
  }
  if (status.includes('FAILED')) {
    return <XCircleIcon className="size-4 text-red-500" />;
  }
  if (status.includes('PROGRESS') || status.includes('PENDING')) {
    return <ClockIcon className="size-4 text-yellow-500" />;
  }
  return <AlertCircleIcon className="size-4 text-orange-500" />;
};

const getStatusColor = (status: string) => {
  if (status.includes('COMPLETE')) return 'bg-green-100 text-green-800 border-green-200';
  if (status.includes('FAILED')) return 'bg-red-100 text-red-800 border-red-200';
  if (status.includes('PROGRESS') || status.includes('PENDING')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-orange-100 text-orange-800 border-orange-200';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const ResourceCard = ({ resource, resourceType }: { resource: any; resourceType?: string }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">
          {resource.identifier}
        </CardTitle>
        {resourceType && (
          <Badge variant="secondary" className="text-xs">
            {resourceType.split('::').pop()}
          </Badge>
        )}
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        {Object.entries(resource.properties || {}).slice(0, 5).map(([key, value]: [string, any]) => (
          <div key={key} className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium">{key}:</span>
            <span className="text-right max-w-48 truncate" title={String(value)}>
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const StackCard = ({ stack }: { stack: any }) => (
  <Card className="mb-4">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">{stack.stackName}</CardTitle>
        <div className="flex items-center gap-2">
          {getStatusIcon(stack.stackStatus)}
          <Badge className={cn('text-xs', getStatusColor(stack.stackStatus))}>
            {stack.stackStatus}
          </Badge>
        </div>
      </div>
      {stack.description && (
        <CardDescription>{stack.description}</CardDescription>
      )}
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Created:</span>
            <p>{formatDate(stack.creationTime)}</p>
          </div>
          {stack.lastUpdatedTime && (
            <div>
              <span className="font-medium text-muted-foreground">Last Updated:</span>
              <p>{formatDate(stack.lastUpdatedTime)}</p>
            </div>
          )}
        </div>

        {stack.parameters && stack.parameters.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Parameters</h4>
            <div className="space-y-1">
              {stack.parameters.map((param: any) => (
                <div key={param.ParameterKey} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{param.ParameterKey}:</span>
                  <span className="font-mono">{param.ParameterValue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stack.outputs && stack.outputs.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Outputs</h4>
            <div className="space-y-2">
              {stack.outputs.map((output: any) => (
                <div key={output.OutputKey} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">{output.OutputKey}:</span>
                    <span className="font-mono max-w-48 truncate" title={output.OutputValue}>
                      {output.OutputValue}
                    </span>
                  </div>
                  {output.Description && (
                    <p className="text-xs text-muted-foreground">{output.Description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {stack.capabilities && stack.capabilities.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Capabilities</h4>
            <div className="flex flex-wrap gap-1">
              {stack.capabilities.map((capability: string) => (
                <Badge key={capability} variant="outline" className="text-xs">
                  {capability}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export const AWSResource = ({ data, isLoading }: AWSResourceProps) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-muted rounded w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded" />
            <div className="h-3 bg-muted rounded w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  if (!data.success) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <XCircleIcon className="size-5 text-red-500" />
            <CardTitle className="text-red-700">AWS Query Error</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">{data.error}</p>
        </CardContent>
      </Card>
    );
  }

  const { action } = data;

  if (action === 'list_resources' && data.resources) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AWS Resources</span>
            <Badge variant="secondary">{data.count} found</Badge>
          </CardTitle>
          {data.resourceType && (
            <CardDescription>Type: {data.resourceType}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.resources.map((resource: any, index: number) => (
              <ResourceCard 
                key={resource.identifier || index} 
                resource={resource} 
                resourceType={data.resourceType}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (action === 'get_resource' && data.resource) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resource Details</CardTitle>
          {data.resourceType && (
            <CardDescription>Type: {data.resourceType}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <ResourceCard resource={data.resource} resourceType={data.resourceType} />
        </CardContent>
      </Card>
    );
  }

  if (action === 'list_stacks' && data.stacks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>CloudFormation Stacks</span>
            <Badge variant="secondary">{data.count} found</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.stacks.map((stack: any, index: number) => (
              <Card key={stack.stackName || index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{stack.stackName}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(stack.stackStatus)}
                      <Badge className={cn('text-xs', getStatusColor(stack.stackStatus))}>
                        {stack.stackStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    <div>Created: {formatDate(stack.creationTime)}</div>
                    {stack.lastUpdatedTime && (
                      <div>Updated: {formatDate(stack.lastUpdatedTime)}</div>
                    )}
                    {stack.templateDescription && (
                      <div className="mt-1">{stack.templateDescription}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (action === 'describe_stack' && data.stack) {
    return <StackCard stack={data.stack} />;
  }

  if (action === 'describe_stack_resources' && data.resources) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Stack Resources</span>
            <Badge variant="secondary">{data.count} resources</Badge>
          </CardTitle>
          <CardDescription>Resources in stack: {data.stackName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.resources.map((resource: any) => (
              <Card key={resource.logicalResourceId} className="border-l-4 border-l-indigo-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{resource.logicalResourceId}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(resource.resourceStatus)}
                      <Badge className={cn('text-xs', getStatusColor(resource.resourceStatus))}>
                        {resource.resourceStatus}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{resource.resourceType}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Physical ID:</span>
                      <span className="font-mono max-w-48 truncate" title={resource.physicalResourceId}>
                        {resource.physicalResourceId}
                      </span>
                    </div>
                    {resource.timestamp && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Last Updated:</span>
                        <span>{formatDate(resource.timestamp)}</span>
                      </div>
                    )}
                    {resource.resourceStatusReason && (
                      <div className="mt-2">
                        <span className="text-muted-foreground font-medium">Status Reason:</span>
                        <p className="text-xs mt-1">{resource.resourceStatusReason}</p>
                      </div>
                    )}
                    {resource.description && (
                      <div className="mt-2">
                        <span className="text-muted-foreground font-medium">Description:</span>
                        <p className="text-xs mt-1">{resource.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (action === 'list_log_groups' && data.logGroups) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>CloudWatch Log Groups</span>
            <Badge variant="secondary">{data.count} found</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.logGroups.map((logGroup: any) => (
              <Card key={logGroup.logGroupName} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{logGroup.logGroupName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    {logGroup.creationTime && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Created:</span>
                        <span>{formatDate(logGroup.creationTime)}</span>
                      </div>
                    )}
                    {logGroup.retentionInDays && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Retention:</span>
                        <span>{logGroup.retentionInDays} days</span>
                      </div>
                    )}
                    {logGroup.storedBytes && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Stored:</span>
                        <span>{(logGroup.storedBytes / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    )}
                    {logGroup.metricFilterCount !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Metric Filters:</span>
                        <span>{logGroup.metricFilterCount}</span>
                      </div>
                    )}
                    {logGroup.arn && (
                      <div className="mt-2">
                        <span className="text-muted-foreground font-medium">ARN:</span>
                        <p className="text-xs mt-1 font-mono break-all">{logGroup.arn}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (action === 'list_s3_buckets' && data.buckets) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>S3 Buckets</span>
            <Badge variant="secondary">{data.count} found</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.buckets.map((bucket: any) => (
              <Card key={bucket.bucketName} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{bucket.bucketName}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {bucket.region}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    {bucket.creationDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Created:</span>
                        <span>{formatDate(bucket.creationDate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Region:</span>
                      <span>{bucket.region}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">
          Received AWS response for action: {action}
        </p>
      </CardContent>
    </Card>
  );
};