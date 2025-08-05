'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  AlertTriangleIcon,
  BugIcon,
  PlayIcon,
  FileTextIcon,
  Calendar,
  Tag,
  User,
  ArrowRightIcon,
  FolderIcon,
  GitBranchIcon,
  BookOpenIcon,
  MessageSquareIcon,
  LinkIcon,
  InfoIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  KeyIcon,
  DatabaseIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JiraResourceProps {
  action: string;
  data: any;
  isLoading?: boolean;
}

// Helper function to get action category
const getActionCategory = (action: string) => {
  if (action.includes('Confluence') || action.includes('confluence')) {
    return 'confluence';
  }
  if (action.includes('Jira') || action.includes('jira')) {
    return 'jira';
  }
  if (action.includes('atlassian') || action.includes('Atlassian')) {
    return 'atlassian';
  }
  return 'unknown';
};

// Status icons for JIRA issues
const getStatusIcon = (status: string, statusCategory?: string) => {
  const normalizedStatus = status.toLowerCase();
  const category = statusCategory?.toLowerCase();

  if (
    category === 'done' ||
    normalizedStatus.includes('done') ||
    normalizedStatus.includes('closed') ||
    normalizedStatus.includes('resolved')
  ) {
    return <CheckCircleIcon className="size-4 text-green-500" />;
  }
  if (
    category === 'indeterminate' ||
    normalizedStatus.includes('progress') ||
    normalizedStatus.includes('review') ||
    normalizedStatus.includes('development')
  ) {
    return <PlayIcon className="size-4 text-blue-500" />;
  }
  if (
    normalizedStatus.includes('blocked') ||
    normalizedStatus.includes('impediment')
  ) {
    return <XCircleIcon className="size-4 text-red-500" />;
  }
  return <ClockIcon className="size-4 text-yellow-500" />;
};

// Priority icons for JIRA issues
const getPriorityIcon = (priority: string) => {
  const normalizedPriority = priority.toLowerCase();

  if (
    normalizedPriority.includes('highest') ||
    normalizedPriority.includes('critical')
  ) {
    return <ArrowUpIcon className="size-3 text-red-600" />;
  }
  if (normalizedPriority.includes('high')) {
    return <ArrowUpIcon className="size-3 text-orange-500" />;
  }
  if (normalizedPriority.includes('low')) {
    return <ArrowDownIcon className="size-3 text-green-500" />;
  }
  if (
    normalizedPriority.includes('lowest') ||
    normalizedPriority.includes('trivial')
  ) {
    return <ArrowDownIcon className="size-3 text-gray-500" />;
  }
  return <AlertCircleIcon className="size-3 text-blue-500" />; // medium/normal
};

// Issue type icons
const getIssueTypeIcon = (issueType: string) => {
  const normalizedType = issueType.toLowerCase();

  if (normalizedType.includes('bug') || normalizedType.includes('defect')) {
    return <BugIcon className="size-4 text-red-500" />;
  }
  if (normalizedType.includes('story') || normalizedType.includes('feature')) {
    return <FileTextIcon className="size-4 text-green-500" />;
  }
  if (normalizedType.includes('task')) {
    return <CheckCircleIcon className="size-4 text-blue-500" />;
  }
  if (normalizedType.includes('epic')) {
    return <FolderIcon className="size-4 text-purple-500" />;
  }
  if (
    normalizedType.includes('subtask') ||
    normalizedType.includes('sub-task')
  ) {
    return <GitBranchIcon className="size-4 text-gray-500" />;
  }
  return <AlertCircleIcon className="size-4 text-gray-500" />;
};

// Status color coding
const getStatusColor = (status: string, statusCategory?: string) => {
  const category = statusCategory?.toLowerCase();

  if (category === 'done') {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (category === 'indeterminate') {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (category === 'new' || category === 'to do') {
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
};

// Priority color coding
const getPriorityColor = (priority: string) => {
  const normalizedPriority = priority.toLowerCase();

  if (
    normalizedPriority.includes('highest') ||
    normalizedPriority.includes('critical')
  ) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (normalizedPriority.includes('high')) {
    return 'bg-orange-100 text-orange-800 border-orange-200';
  }
  if (normalizedPriority.includes('low')) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (
    normalizedPriority.includes('lowest') ||
    normalizedPriority.includes('trivial')
  ) {
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
  return 'bg-blue-100 text-blue-800 border-blue-200'; // medium/normal
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
};

const formatJiraDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

// Search icon component
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
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="size-5 text-blue-600" />
              {title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredItems.length} of {count} items
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={goToPrevPage}
              >
                <ChevronLeftIcon size={14} />
              </Button>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={goToNextPage}
              >
                <ChevronRightIcon size={14} />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {currentItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircleIcon className="size-12 mx-auto mb-4 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentItems.map((item, index) => renderItem(item, index))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Issue card component
const IssueCard = ({ issue }: { issue: any }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getIssueTypeIcon(
            issue.issueType?.name || issue.fields?.issuetype?.name || 'unknown',
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm truncate">{issue.key}</h3>
              <Badge variant="outline" className="text-xs">
                {issue.issueType?.name ||
                  issue.fields?.issuetype?.name ||
                  'Unknown'}
              </Badge>
            </div>
            <p className="text-sm text-foreground line-clamp-2">
              {issue.summary || issue.fields?.summary || 'No summary'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {getPriorityIcon(
            issue.priority?.name || issue.fields?.priority?.name || 'medium',
          )}
          <Badge
            variant="outline"
            className={`text-xs ${getPriorityColor(issue.priority?.name || issue.fields?.priority?.name || 'medium')}`}
          >
            {issue.priority?.name || issue.fields?.priority?.name || 'Medium'}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(
              issue.status?.name || issue.fields?.status?.name || 'unknown',
              issue.status?.statusCategory?.key ||
                issue.fields?.status?.statusCategory?.key,
            )}
            <Badge
              className={`text-xs ${getStatusColor(
                issue.status?.name || issue.fields?.status?.name || 'unknown',
                issue.status?.statusCategory?.key ||
                  issue.fields?.status?.statusCategory?.key,
              )}`}
            >
              {issue.status?.name || issue.fields?.status?.name || 'Unknown'}
            </Badge>
          </div>
          {(issue.assignee || issue.fields?.assignee) && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="size-3" />
              <span>
                {issue.assignee?.displayName ||
                  issue.fields?.assignee?.displayName ||
                  issue.assignee?.name ||
                  issue.fields?.assignee?.name ||
                  'Unassigned'}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span>
              Created: {formatDate(issue.created || issue.fields?.created)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span>
              Updated: {formatDate(issue.updated || issue.fields?.updated)}
            </span>
          </div>
        </div>

        {(issue.project || issue.fields?.project) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FolderIcon className="size-3" />
            <span>
              {issue.project?.name || issue.fields?.project?.name}(
              {issue.project?.key || issue.fields?.project?.key})
            </span>
          </div>
        )}

        {issue.description && (
          <div className="border-t pt-2">
            <p className="text-xs text-muted-foreground line-clamp-3">
              {issue.description}
            </p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Project card component
const ProjectCard = ({ project }: { project: any }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <FolderIcon className="size-5 text-blue-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm">{project.name}</h3>
              <Badge variant="outline" className="text-xs">
                {project.key}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || 'No description'}
            </p>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="size-3" />
            <span>
              Lead:{' '}
              {project.lead?.displayName || project.lead?.name || 'Unassigned'}
            </span>
          </div>
          {project.projectTypeKey && (
            <Badge variant="secondary" className="text-xs">
              {project.projectTypeKey}
            </Badge>
          )}
        </div>
        {project.url && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowRightIcon className="size-3" />
            <span className="truncate">{project.url}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Confluence Space card component
const ConfluenceSpaceCard = ({ space }: { space: any }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <BookOpenIcon className="size-5 text-indigo-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm">{space.name}</h3>
              <Badge variant="outline" className="text-xs">
                {space.key}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {space.description?.plain?.value ||
                space.description ||
                'No description'}
            </p>
          </div>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>Type: {space.type || 'Unknown'}</span>
          </div>
          {space.status && (
            <Badge variant="secondary" className="text-xs">
              {space.status}
            </Badge>
          )}
        </div>
        {space._links?.webui && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ExternalLinkIcon className="size-3" />
            <span className="truncate">{space._links.webui}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Confluence Page card component
const ConfluencePageCard = ({ page }: { page: any }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <FileTextIcon className="size-5 text-indigo-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm">{page.title}</h3>
              <Badge variant="outline" className="text-xs">
                {page.type || 'page'}
              </Badge>
            </div>
            {page.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {page.excerpt}
              </p>
            )}
          </div>
        </div>
        {page.status && (
          <Badge variant="secondary" className="text-xs">
            {page.status}
          </Badge>
        )}
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          {page.version && (
            <div className="flex items-center gap-1">
              <span>Version: {page.version.number}</span>
            </div>
          )}
          {page.createdDate && (
            <div className="flex items-center gap-1">
              <Calendar className="size-3" />
              <span>Created: {formatDate(page.createdDate)}</span>
            </div>
          )}
        </div>
        {page.space && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpenIcon className="size-3" />
            <span>
              Space: {page.space.name} ({page.space.key})
            </span>
          </div>
        )}
        {page._links?.webui && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ExternalLinkIcon className="size-3" />
            <span className="truncate">{page._links.webui}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Comment card component
const CommentCard = ({ comment }: { comment: any }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <MessageSquareIcon className="size-4 text-blue-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">
                {comment.author?.displayName ||
                  comment.author?.name ||
                  'Unknown'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.createdDate || comment.created)}
              </span>
            </div>
            <div className="text-sm text-foreground">
              {comment.body?.storage?.value || comment.body || 'No content'}
            </div>
          </div>
        </div>
      </div>
    </CardHeader>
  </Card>
);

// User Info card component
const UserInfoCard = ({ user }: { user: any }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start gap-3">
        <User className="size-5 text-green-500 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm">
              {user.displayName || user.name || 'Unknown User'}
            </h3>
            {user.active !== undefined && (
              <Badge
                variant={user.active ? 'default' : 'secondary'}
                className="text-xs"
              >
                {user.active ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {user.emailAddress || 'No email'}
          </p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        {user.accountId && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <KeyIcon className="size-3" />
            <span>Account ID: {user.accountId}</span>
          </div>
        )}
        {user.accountType && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Type: {user.accountType}</span>
          </div>
        )}
        {user.timeZone && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Timezone: {user.timeZone}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Transition card component for JIRA workflows
const TransitionCard = ({ transition }: { transition: any }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start gap-3">
        <RefreshCwIcon className="size-4 text-orange-500 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm">{transition.name}</h3>
            <Badge variant="outline" className="text-xs">
              ID: {transition.id}
            </Badge>
          </div>
          {transition.to && (
            <p className="text-sm text-muted-foreground">
              → {transition.to.name}
            </p>
          )}
        </div>
      </div>
    </CardHeader>
    {transition.fields && Object.keys(transition.fields).length > 0 && (
      <CardContent className="pt-0">
        <div className="text-xs text-muted-foreground">
          <span>
            Required fields: {Object.keys(transition.fields).join(', ')}
          </span>
        </div>
      </CardContent>
    )}
  </Card>
);

// Remote link card component
const RemoteLinkCard = ({ link }: { link: any }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start gap-3">
        <LinkIcon className="size-4 text-purple-500 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm">
              {link.object?.title || link.title || 'Remote Link'}
            </h3>
            {link.relationship && (
              <Badge variant="outline" className="text-xs">
                {link.relationship}
              </Badge>
            )}
          </div>
          {link.object?.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {link.object.summary}
            </p>
          )}
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        {link.object?.url && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ExternalLinkIcon className="size-3" />
            <span className="truncate">{link.object.url}</span>
          </div>
        )}
        {link.object?.status && (
          <Badge variant="secondary" className="text-xs">
            {link.object.status.resolved
              ? 'Resolved'
              : link.object.status.title}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
);

// Issue Type Metadata card component
const IssueTypeMetadataCard = ({ issueType }: { issueType: any }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start gap-3">
        {getIssueTypeIcon(issueType.name)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm">{issueType.name}</h3>
            <Badge variant="outline" className="text-xs">
              {issueType.id}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {issueType.description || 'No description'}
          </p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge
            variant={issueType.subtask ? 'secondary' : 'default'}
            className="text-xs"
          >
            {issueType.subtask ? 'Subtask' : 'Standard'}
          </Badge>
          {issueType.hierarchyLevel !== undefined && (
            <Badge variant="outline" className="text-xs">
              Level {issueType.hierarchyLevel}
            </Badge>
          )}
        </div>
        {issueType.scope && (
          <div className="text-xs text-muted-foreground">
            Scope: {issueType.scope.type} - {issueType.scope.project?.name}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Accessible Resource card component
const AccessibleResourceCard = ({ resource }: { resource: any }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start gap-3">
        <DatabaseIcon className="size-5 text-cyan-500 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-sm">{resource.name}</h3>
            <Badge variant="outline" className="text-xs">
              {resource.id}
            </Badge>
          </div>
          {resource.url && (
            <p className="text-sm text-muted-foreground">{resource.url}</p>
          )}
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        {resource.scopes && (
          <div className="flex flex-wrap gap-1">
            {resource.scopes.map((scope: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {scope}
              </Badge>
            ))}
          </div>
        )}
        {resource.avatarUrl && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Has avatar</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export const JiraResource = ({
  action,
  data,
  isLoading,
}: JiraResourceProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Tag className="size-4 animate-pulse text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Loading Atlassian data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  if (!data.success && data.error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangleIcon className="size-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              Atlassian Error
            </span>
          </div>
          <p className="text-sm text-destructive">
            {data.error || 'An error occurred while fetching Atlassian data'}
          </p>
          {data.details && (
            <p className="text-xs text-muted-foreground mt-2">{data.details}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Handle different Atlassian actions
  switch (action) {
    // JIRA Issue actions
    case 'searchJiraIssuesUsingJql':
    case 'search_issues':
    case 'get_issues':
    case 'list_issues':
      if (data.issues) {
        return (
          <ResourceList
            items={data.issues}
            title="JIRA Issues"
            count={data.total || data.issues.length}
            searchFunction={(issue, searchTerm) => {
              const searchableText = [
                issue.key,
                issue.summary || issue.fields?.summary,
                issue.description,
                issue.status?.name || issue.fields?.status?.name,
                issue.assignee?.displayName ||
                  issue.fields?.assignee?.displayName,
                issue.project?.name || issue.fields?.project?.name,
                issue.issueType?.name || issue.fields?.issuetype?.name,
              ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

              return searchableText.includes(searchTerm);
            }}
            renderItem={(issue, index) => (
              <IssueCard key={issue.id || issue.key || index} issue={issue} />
            )}
            emptyMessage="No issues found"
          />
        );
      }
      break;

    case 'getJiraIssue':
    case 'get_issue':
    case 'show_issue':
      if (data.issue || data.fields) {
        const issue = data.issue || data;
        return <IssueCard issue={issue} />;
      }
      break;

    case 'editJiraIssue':
    case 'createJiraIssue':
      if (data.issue || data.key) {
        const issue = data.issue || data;
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="size-5 text-green-500" />
                {action === 'createJiraIssue'
                  ? 'Issue Created'
                  : 'Issue Updated'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <IssueCard issue={issue} />
            </CardContent>
          </Card>
        );
      }
      break;

    case 'getTransitionsForJiraIssue':
      if (data.transitions) {
        return (
          <ResourceList
            items={data.transitions}
            title="Available Transitions"
            count={data.transitions.length}
            searchFunction={(transition, searchTerm) =>
              transition.name.toLowerCase().includes(searchTerm)
            }
            renderItem={(transition, index) => (
              <TransitionCard
                key={transition.id || index}
                transition={transition}
              />
            )}
            emptyMessage="No transitions available"
          />
        );
      }
      break;

    case 'transitionJiraIssue':
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="size-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                Issue transition completed successfully
              </span>
            </div>
            {data.message && <p className="text-sm mt-2">{data.message}</p>}
          </CardContent>
        </Card>
      );

    case 'addCommentToJiraIssue':
      if (data.comment) {
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareIcon className="size-5 text-blue-500" />
                Comment Added
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommentCard comment={data.comment} />
            </CardContent>
          </Card>
        );
      }
      break;

    case 'getJiraIssueRemoteIssueLinks':
      if (data.remoteLinks || data.links) {
        const links = data.remoteLinks || data.links;
        return (
          <ResourceList
            items={links}
            title="Remote Issue Links"
            count={links.length}
            searchFunction={(link, searchTerm) =>
              (link.object?.title || link.title || '')
                .toLowerCase()
                .includes(searchTerm)
            }
            renderItem={(link, index) => (
              <RemoteLinkCard key={link.id || index} link={link} />
            )}
            emptyMessage="No remote links found"
          />
        );
      }
      break;

    // JIRA Project actions
    case 'getVisibleJiraProjects':
    case 'list_projects':
    case 'get_projects':
      if (data.projects) {
        return (
          <ResourceList
            items={data.projects}
            title="JIRA Projects"
            count={data.total || data.projects.length}
            searchFunction={(project, searchTerm) => {
              const searchableText = [
                project.key,
                project.name,
                project.description,
                project.lead?.displayName,
                project.projectTypeKey,
              ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

              return searchableText.includes(searchTerm);
            }}
            renderItem={(project, index) => (
              <ProjectCard
                key={project.id || project.key || index}
                project={project}
              />
            )}
            emptyMessage="No projects found"
          />
        );
      }
      break;

    case 'get_project':
      if (data.project) {
        return <ProjectCard project={data.project} />;
      }
      break;

    case 'getJiraProjectIssueTypesMetadata':
      if (data.issueTypes) {
        return (
          <ResourceList
            items={data.issueTypes}
            title="Issue Types"
            count={data.issueTypes.length}
            searchFunction={(issueType, searchTerm) =>
              issueType.name.toLowerCase().includes(searchTerm)
            }
            renderItem={(issueType, index) => (
              <IssueTypeMetadataCard
                key={issueType.id || index}
                issueType={issueType}
              />
            )}
            emptyMessage="No issue types found"
          />
        );
      }
      break;

    // User and account actions
    case 'atlassianUserInfo':
      if (data.user || data.accountId) {
        const user = data.user || data;
        return <UserInfoCard user={user} />;
      }
      break;

    case 'lookupJiraAccountId':
      if (data.accountId || data.user) {
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5 text-green-500" />
                Account Lookup Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <KeyIcon className="size-4" />
                  <span className="font-mono text-sm">
                    {data.accountId || data.user?.accountId}
                  </span>
                </div>
                {data.displayName && (
                  <div className="flex items-center gap-2">
                    <User className="size-4" />
                    <span className="text-sm">{data.displayName}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      }
      break;

    case 'getAccessibleAtlassianResources':
      if (data.resources) {
        return (
          <ResourceList
            items={data.resources}
            title="Accessible Resources"
            count={data.resources.length}
            searchFunction={(resource, searchTerm) =>
              resource.name.toLowerCase().includes(searchTerm)
            }
            renderItem={(resource, index) => (
              <AccessibleResourceCard
                key={resource.id || index}
                resource={resource}
              />
            )}
            emptyMessage="No accessible resources found"
          />
        );
      }
      break;

    // Confluence Space actions
    case 'getConfluenceSpaces':
      if (data.spaces || data.results) {
        const spaces = data.spaces || data.results;
        return (
          <ResourceList
            items={spaces}
            title="Confluence Spaces"
            count={data.size || spaces.length}
            searchFunction={(space, searchTerm) =>
              space.name.toLowerCase().includes(searchTerm) ||
              space.key.toLowerCase().includes(searchTerm)
            }
            renderItem={(space, index) => (
              <ConfluenceSpaceCard key={space.id || index} space={space} />
            )}
            emptyMessage="No spaces found"
          />
        );
      }
      break;

    // Confluence Page actions
    case 'getConfluencePage':
      if (data.page || data.title) {
        const page = data.page || data;
        return <ConfluencePageCard page={page} />;
      }
      break;

    case 'getPagesInConfluenceSpace':
    case 'getConfluencePageAncestors':
    case 'getConfluencePageDescendants':
      if (data.pages || data.results) {
        const pages = data.pages || data.results;
        return (
          <ResourceList
            items={pages}
            title="Confluence Pages"
            count={data.size || pages.length}
            searchFunction={(page, searchTerm) =>
              page.title.toLowerCase().includes(searchTerm)
            }
            renderItem={(page, index) => (
              <ConfluencePageCard key={page.id || index} page={page} />
            )}
            emptyMessage="No pages found"
          />
        );
      }
      break;

    case 'createConfluencePage':
    case 'updateConfluencePage':
      if (data.page || data.title) {
        const page = data.page || data;
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="size-5 text-green-500" />
                {action === 'createConfluencePage'
                  ? 'Page Created'
                  : 'Page Updated'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ConfluencePageCard page={page} />
            </CardContent>
          </Card>
        );
      }
      break;

    case 'searchConfluenceUsingCql':
      if (data.results) {
        return (
          <ResourceList
            items={data.results}
            title="Search Results"
            count={data.totalSize || data.results.length}
            searchFunction={(result, searchTerm) =>
              (result.title || result.name || '')
                .toLowerCase()
                .includes(searchTerm)
            }
            renderItem={(result, index) => {
              // Handle different result types
              if (result.type === 'page') {
                return (
                  <ConfluencePageCard key={result.id || index} page={result} />
                );
              } else if (result.type === 'space') {
                return (
                  <ConfluenceSpaceCard
                    key={result.id || index}
                    space={result}
                  />
                );
              } else {
                // Generic result card
                return (
                  <Card key={result.id || index} className="mb-3">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <InfoIcon className="size-4 text-gray-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm">
                            {result.title || result.name || 'Unknown'}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Type: {result.type}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              }
            }}
            emptyMessage="No search results found"
          />
        );
      }
      break;

    // Confluence Comment actions
    case 'getConfluencePageFooterComments':
    case 'getConfluencePageInlineComments':
      if (data.comments || data.results) {
        const comments = data.comments || data.results;
        return (
          <ResourceList
            items={comments}
            title="Comments"
            count={data.size || comments.length}
            searchFunction={(comment, searchTerm) =>
              (comment.body?.storage?.value || comment.body || '')
                .toLowerCase()
                .includes(searchTerm)
            }
            renderItem={(comment, index) => (
              <CommentCard key={comment.id || index} comment={comment} />
            )}
            emptyMessage="No comments found"
          />
        );
      }
      break;

    case 'createConfluenceFooterComment':
    case 'createConfluenceInlineComment':
      if (data.comment) {
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareIcon className="size-5 text-blue-500" />
                Comment Added
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommentCard comment={data.comment} />
            </CardContent>
          </Card>
        );
      }
      break;

    default:
      // Generic fallback for unknown actions
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="size-5 text-blue-600" />
              Atlassian Response
            </CardTitle>
            <p className="text-sm text-muted-foreground">Action: {action}</p>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto max-h-96">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      );
  }

  // If no specific handler matched, show a generic success message
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="size-4 text-green-500" />
          <span className="text-sm text-muted-foreground">
            Atlassian operation completed successfully
          </span>
        </div>
        {data.message && <p className="text-sm mt-2">{data.message}</p>}
      </CardContent>
    </Card>
  );
};
