'use client';

import {} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Tag,
  User,
  FolderIcon,
  GitBranchIcon,
  KeyIcon,
  DatabaseIcon,
} from 'lucide-react';

interface JiraResourceProps {
  action: string;
  data: any;
  isLoading?: boolean;
}

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

type Issue = {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuetype: {
      id: string;
      name: string;
      iconUrl: string;
    };
    created: string;
    priority: {
      id: string;
      name: string;
      iconUrl: string;
    };
    status: {
      id: string;
      name: string;
      iconUrl: string;
      statusCategory: {
        id: number;
        key: string;
        colorName: string;
        name: string;
      };
    };
  };
};
// Issue card component
const IssueCard = ({ issue }: { issue: Issue }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {getIssueTypeIcon(issue.fields?.issuetype?.name || 'unknown')}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm truncate">{issue.key}</h3>
              <Badge variant="outline" className="text-xs">
                {issue.fields?.issuetype?.name || 'Unknown'}
              </Badge>
            </div>
            <p className="text-sm text-foreground line-clamp-2">
              {issue.fields?.summary || 'No summary'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {getPriorityIcon(issue.fields?.priority?.name || 'medium')}
          <Badge
            variant="outline"
            className={`text-xs ${getPriorityColor(issue.fields?.priority?.name || 'medium')}`}
          >
            {issue.fields?.priority?.name || 'Medium'}
          </Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(
              issue.fields?.status?.name || 'unknown',
              issue.fields?.status?.statusCategory?.key,
            )}
            <Badge
              className={`text-xs ${getStatusColor(
                issue.fields?.status?.name || 'unknown',
                issue.fields?.status?.statusCategory?.key,
              )}`}
            >
              {issue.fields?.status?.name || 'Unknown'}
            </Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);
interface AvatarUrls {
  '48x48': string;
  '24x24': string;
  '16x16': string;
  '32x32': string;
}

interface JiraIssueType {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  avatarId: number;
  hierarchyLevel: number;
}

interface JiraProject {
  expand: string;
  self: string;
  id: string;
  key: string;
  issueTypes: JiraIssueType[];
  name: string;
  avatarUrls: AvatarUrls;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  properties: Record<string, unknown>;
  entityId: string;
  uuid: string;
}

interface JiraProjectSearchResponse {
  self: string;
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: JiraProject[];
}
// Project card component
const ProjectCard = ({ project }: { project: JiraProjectSearchResponse }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <FolderIcon className="size-5 text-blue-500 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-sm">{project.values[0].name}</h3>
              <Badge variant="outline" className="text-xs">
                {project.values[0].key}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </CardHeader>
  </Card>
);

type UserInfo = {
  account_id: string;
  email: string;
  name: string;
  picture: string;
  account_status: string;
  characteristics: {
    not_mentionable: boolean;
  };
  last_updated: string;
  nickname: string;
  locale: string;
  extended_profile: {
    phone_numbers: any[];
    team_type?: string;
  };
  account_type: string;
  email_verified: boolean;
};
// User Info card component
const UserInfoCard = ({ user }: { user: UserInfo }) => (
  <Card className="mb-3">
    <CardHeader className="pb-3">
      <div className="flex items-start gap-3">
        <User className="size-5 text-green-500 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-medium text-md">
              Successful fetch user information:
            </h2>
            <h3 className="font-medium text-sm">
              {user.name || 'Unknown User'}
            </h3>
            {user.account_status !== undefined && (
              <Badge
                variant={
                  user.account_status === 'active' ? 'default' : 'secondary'
                }
                className="text-xs"
              >
                {user.account_status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {user.email || 'No email'}
          </p>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        {user.account_id && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <KeyIcon className="size-3" />
            <span>Account ID: {user.account_id}</span>
          </div>
        )}
        {user.account_type && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Type: {user.account_type}</span>
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

  console.log({ action, data });

  // Handle different Atlassian actions
  switch (action) {
    case 'getAccessibleAtlassianResources':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              <DatabaseIcon className="size-5 text-cyan-500" />
              Successful fetch of Atlassian resources
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data.content.length} resources found
            </p>
          </CardHeader>
        </Card>
      );

    case 'atlassianUserInfo': {
      const rawData = data.content[0].text;
      const userInfo = JSON.parse(rawData);

      return <UserInfoCard user={userInfo} />;
    }

    case 'searchJiraIssuesUsingJql': {
      const rawData = data.content[0].text;
      const parsedData = JSON.parse(rawData);
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              <DatabaseIcon className="size-5 text-cyan-500" />
              Successful JQL search
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {data.content.length} resources found
            </p>
          </CardHeader>
          <CardContent>
            {parsedData.issues.map((issue: any, index: number) => (
              <IssueCard key={index} issue={issue} />
            ))}
          </CardContent>
        </Card>
      );
    }

    case 'getVisibleJiraProjects': {
      const rawData = data.content;
      const parsedData = rawData.map((item: any) => {
        return JSON.parse(item.text);
      });
      console.log('Parsed Jira Projects:', parsedData);
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              <FolderIcon className="size-5 text-blue-500" />
              Visible Jira Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {parsedData.map(
              (project: JiraProjectSearchResponse, index: number) => (
                <ProjectCard key={index} project={project} />
              ),
            )}
          </CardContent>
        </Card>
      );
    }

    case 'createJiraIssue': {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              <CheckCircleIcon className="size-5 text-green-500" />
              Issue Created Successfully
            </CardTitle>
          </CardHeader>
        </Card>
      );
    }
    case 'addCommentToJiraIssue': {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              <CheckCircleIcon className="size-5 text-green-500" />
              Comment Added Successfully
            </CardTitle>
          </CardHeader>
        </Card>
      );
    }

    case 'getTransitionsForJiraIssue': {
      const rawData = data.content[0].text;
      const parsedData = JSON.parse(rawData);
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              <DatabaseIcon className="size-5 text-cyan-500" />
              Successful fetch of Jira issue transitions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {parsedData.transitions.map((transition: any, index: number) => (
              <div
                key={index}
                className="border-b border-muted py-2 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{transition.name}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      );
    }

    case 'transitionJiraIssue': {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              <CheckCircleIcon className="size-5 text-green-500" />
              Issue Transitioned Successfully
            </CardTitle>
          </CardHeader>
        </Card>
      );
    }

    case 'getJiraIssue': {
      const rawData = data.content[0].text;
      const parsedData = JSON.parse(rawData);

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-md">
              <DatabaseIcon className="size-5 text-cyan-500" />
              Successful fetch of Jira issue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IssueCard issue={parsedData} />
          </CardContent>
        </Card>
      );
    }
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
