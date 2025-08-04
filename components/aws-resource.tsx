import { useState, useMemo } from 'react';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  CheckCircleIcon,
  AlertCircleIcon,
  XCircleIcon,
  ClockIcon,
} from './icons';
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
  if (status.includes('COMPLETE'))
    return 'bg-green-100 text-green-800 border-green-200';
  if (status.includes('FAILED'))
    return 'bg-red-100 text-red-800 border-red-200';
  if (status.includes('PROGRESS') || status.includes('PENDING'))
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-orange-100 text-orange-800 border-orange-200';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

// Simple search icon component
const SearchIcon = ({
  size = 16,
  className,
}: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

// Navigation icons
const ChevronLeftIcon = ({
  size = 16,
  className,
}: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

const ChevronRightIcon = ({
  size = 16,
  className,
}: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

// Generic list component with search and pagination
interface ResourceListProps {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  searchFunction: (item: any, searchTerm: string) => boolean;
  title: string;
  count: number;
  emptyMessage?: string;
  itemsPerPage?: number;
}

const ResourceList = ({
  items,
  renderItem,
  searchFunction,
  title,
  count,
  emptyMessage = 'No items found',
  itemsPerPage = 3,
}: ResourceListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter((item) =>
      searchFunction(item, searchTerm.toLowerCase()),
    );
  }, [items, searchTerm, searchFunction]);

  // Reset to page 1 when search term changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span>{title}</span>
            <Badge variant="secondary">
              {searchTerm
                ? `${filteredItems.length} of ${count}`
                : `${count} found`}
            </Badge>
          </CardTitle>
        </div>
        {items.length > 0 && (
          <div className="relative">
            <SearchIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? `No items match "${searchTerm}"` : emptyMessage}
          </div>
        ) : (
          <>
            {/* Fixed height container for items */}
            <div className="min-h-[300px]">
              <div className="space-y-3">
                {currentItems.map((item, index) =>
                  renderItem(item, startIndex + index),
                )}
              </div>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages} ({filteredItems.length}{' '}
                  total)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="size-8 p-0"
                  >
                    <ChevronLeftIcon size={14} />
                  </Button>
                  <span className="text-sm min-w-[60px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="size-8 p-0"
                  >
                    <ChevronRightIcon size={14} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

const ResourceCard = ({
  resource,
  resourceType,
}: { resource: any; resourceType?: string }) => (
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
        {Object.entries(resource.properties || {})
          .slice(0, 5)
          .map(([key, value]: [string, any]) => (
            <div key={key} className="flex justify-between text-xs">
              <span className="text-muted-foreground font-medium">{key}:</span>
              <span
                className="text-right max-w-48 truncate"
                title={String(value)}
              >
                {typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value)}
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
              <span className="font-medium text-muted-foreground">
                Last Updated:
              </span>
              <p>{formatDate(stack.lastUpdatedTime)}</p>
            </div>
          )}
        </div>

        {stack.parameters && stack.parameters.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Parameters</h4>
            <div className="space-y-1">
              {stack.parameters.map((param: any) => (
                <div
                  key={param.ParameterKey}
                  className="flex justify-between text-xs"
                >
                  <span className="text-muted-foreground">
                    {param.ParameterKey}:
                  </span>
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
                    <span className="text-muted-foreground font-medium">
                      {output.OutputKey}:
                    </span>
                    <span
                      className="font-mono max-w-48 truncate"
                      title={output.OutputValue}
                    >
                      {output.OutputValue}
                    </span>
                  </div>
                  {output.Description && (
                    <p className="text-xs text-muted-foreground">
                      {output.Description}
                    </p>
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
      <ResourceList
        items={data.resources}
        title="AWS Resources"
        count={data.count}
        searchFunction={(resource, searchTerm) => {
          const identifier = (resource.identifier || '').toLowerCase();
          const resourceTypeName = data.resourceType
            ? data.resourceType.split('::').pop()?.toLowerCase() || ''
            : '';
          const propertiesText = resource.properties
            ? Object.entries(resource.properties)
                .map(([key, value]) => `${key} ${String(value)}`)
                .join(' ')
                .toLowerCase()
            : '';

          return (
            identifier.includes(searchTerm) ||
            resourceTypeName.includes(searchTerm) ||
            propertiesText.includes(searchTerm)
          );
        }}
        renderItem={(resource, index) => (
          <ResourceCard
            key={resource.identifier || index}
            resource={resource}
            resourceType={data.resourceType}
          />
        )}
      />
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
          <ResourceCard
            resource={data.resource}
            resourceType={data.resourceType}
          />
        </CardContent>
      </Card>
    );
  }

  if (action === 'list_stacks' && data.stacks) {
    return (
      <ResourceList
        items={data.stacks}
        title="CloudFormation Stacks"
        count={data.count}
        searchFunction={(stack, searchTerm) => {
          const stackName = (stack.stackName || '').toLowerCase();
          const stackStatus = (stack.stackStatus || '').toLowerCase();
          const templateDescription = (
            stack.templateDescription || ''
          ).toLowerCase();

          return (
            stackName.includes(searchTerm) ||
            stackStatus.includes(searchTerm) ||
            templateDescription.includes(searchTerm)
          );
        }}
        renderItem={(stack, index) => (
          <Card
            key={stack.stackName || index}
            className="border-l-4 border-l-blue-500"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{stack.stackName}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(stack.stackStatus)}
                  <Badge
                    className={cn('text-xs', getStatusColor(stack.stackStatus))}
                  >
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
        )}
      />
    );
  }

  if (action === 'describe_stack' && data.stack) {
    return <StackCard stack={data.stack} />;
  }

  if (action === 'describe_stack_resources' && data.resources) {
    return (
      <ResourceList
        items={data.resources}
        title={`Stack Resources - ${data.stackName}`}
        count={data.count}
        searchFunction={(resource, searchTerm) => {
          const logicalId = (resource.logicalResourceId || '').toLowerCase();
          const physicalId = (resource.physicalResourceId || '').toLowerCase();
          const resourceType = (resource.resourceType || '').toLowerCase();
          const resourceStatus = (resource.resourceStatus || '').toLowerCase();
          const statusReason = (
            resource.resourceStatusReason || ''
          ).toLowerCase();

          return (
            logicalId.includes(searchTerm) ||
            physicalId.includes(searchTerm) ||
            resourceType.includes(searchTerm) ||
            resourceStatus.includes(searchTerm) ||
            statusReason.includes(searchTerm)
          );
        }}
        renderItem={(resource, index) => (
          <Card
            key={resource.logicalResourceId || index}
            className="border-l-4 border-l-indigo-500"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {resource.logicalResourceId}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(resource.resourceStatus)}
                  <Badge
                    className={cn(
                      'text-xs',
                      getStatusColor(resource.resourceStatus),
                    )}
                  >
                    {resource.resourceStatus}
                  </Badge>
                </div>
              </div>
              <CardDescription>{resource.resourceType}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">
                    Physical ID:
                  </span>
                  <span
                    className="font-mono max-w-48 truncate"
                    title={resource.physicalResourceId}
                  >
                    {resource.physicalResourceId}
                  </span>
                </div>
                {resource.timestamp && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">
                      Last Updated:
                    </span>
                    <span>{formatDate(resource.timestamp)}</span>
                  </div>
                )}
                {resource.resourceStatusReason && (
                  <div className="mt-2">
                    <span className="text-muted-foreground font-medium">
                      Status Reason:
                    </span>
                    <p className="text-xs mt-1">
                      {resource.resourceStatusReason}
                    </p>
                  </div>
                )}
                {resource.description && (
                  <div className="mt-2">
                    <span className="text-muted-foreground font-medium">
                      Description:
                    </span>
                    <p className="text-xs mt-1">{resource.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      />
    );
  }

  if (action === 'list_log_groups' && data.logGroups) {
    return (
      <ResourceList
        items={data.logGroups}
        title="CloudWatch Log Groups"
        count={data.count}
        searchFunction={(logGroup, searchTerm) => {
          const logGroupName = (logGroup.logGroupName || '').toLowerCase();
          const arn = (logGroup.arn || '').toLowerCase();

          return logGroupName.includes(searchTerm) || arn.includes(searchTerm);
        }}
        renderItem={(logGroup, index) => (
          <Card
            key={logGroup.logGroupName || index}
            className="border-l-4 border-l-orange-500"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {logGroup.logGroupName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                {logGroup.creationTime && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">
                      Created:
                    </span>
                    <span>{formatDate(logGroup.creationTime)}</span>
                  </div>
                )}
                {logGroup.retentionInDays && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">
                      Retention:
                    </span>
                    <span>{logGroup.retentionInDays} days</span>
                  </div>
                )}
                {logGroup.storedBytes && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">
                      Stored:
                    </span>
                    <span>
                      {(logGroup.storedBytes / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
                {logGroup.metricFilterCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground font-medium">
                      Metric Filters:
                    </span>
                    <span>{logGroup.metricFilterCount}</span>
                  </div>
                )}
                {logGroup.arn && (
                  <div className="mt-2">
                    <span className="text-muted-foreground font-medium">
                      ARN:
                    </span>
                    <p className="text-xs mt-1 font-mono break-all">
                      {logGroup.arn}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      />
    );
  }

  if (action === 'list_s3_buckets' && data.buckets) {
    return (
      <ResourceList
        items={data.buckets}
        title="S3 Buckets"
        count={data.count}
        searchFunction={(bucket, searchTerm) => {
          const bucketName = (bucket.bucketName || '').toLowerCase();
          const region = (bucket.region || '').toLowerCase();

          return bucketName.includes(searchTerm) || region.includes(searchTerm);
        }}
        renderItem={(bucket, index) => (
          <Card
            key={bucket.bucketName || index}
            className="border-l-4 border-l-green-500"
          >
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
                    <span className="text-muted-foreground font-medium">
                      Created:
                    </span>
                    <span>{formatDate(bucket.creationDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">
                    Region:
                  </span>
                  <span>{bucket.region}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      />
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
