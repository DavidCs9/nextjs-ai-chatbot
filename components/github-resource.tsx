import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ExternalLink,
  GitBranch,
  GitCommit,
  Users,
  Star,
  Eye,
  GitFork,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GitHubResourceProps {
  action: string;
  data: any;
}

export const GitHubResource = ({ action, data }: GitHubResourceProps) => {
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (data.error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Error executing GitHub action: {data.error}
          </p>
        </CardContent>
      </Card>
    );
  }

  switch (action) {
    case 'list_files':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📁 Files in {data.path}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.files?.map((file: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-2">
                    <span>{file.type === 'dir' ? '📁' : '📄'}</span>
                    <span className="font-mono text-sm">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {file.size && <span>{file.size} bytes</span>}
                    <Badge variant="outline">{file.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );

    case 'get_file_content':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📄 {data.path}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>Size: {data.size} bytes</span>
                <span>SHA: {data.sha?.substring(0, 8)}</span>
              </div>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto max-h-96">
                <code>{data.content}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      );

    case 'list_commits':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCommit className="size-5" />
              Recent Commits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.commits?.map((commit: any, index: number) => (
                <div key={index} className="border-l-2 border-muted pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{commit.message}</p>
                      <p className="text-xs text-muted-foreground">
                        by {commit.author?.name} • {formatDate(commit.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-1 rounded">
                        {commit.sha.substring(0, 8)}
                      </code>
                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );

    case 'get_repository_info':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 {data.repository.full_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {data.repository.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Star className="size-4" />
                  <span className="text-sm">
                    {data.repository.stargazers_count}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <GitFork className="size-4" />
                  <span className="text-sm">{data.repository.forks_count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="size-4" />
                  <span className="text-sm">
                    {data.repository.watchers_count}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4" />
                  <span className="text-sm">
                    {data.repository.open_issues_count} issues
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {data.repository.language && (
                  <Badge variant="secondary">{data.repository.language}</Badge>
                )}
                {data.repository.license && (
                  <Badge variant="outline">{data.repository.license}</Badge>
                )}
                <Badge variant="outline">
                  Default: {data.repository.default_branch}
                </Badge>
              </div>

              {data.repository.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {data.repository.topics.map((topic: string) => (
                    <Badge key={topic} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );

    case 'list_issues':
    case 'list_pull_requests': {
      const items = data.issues || data.pull_requests;
      const title = action === 'list_issues' ? 'Issues' : 'Pull Requests';

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {action === 'list_issues' ? '🐛' : '🔄'} {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items?.map((item: any, index: number) => (
                <div key={index} className="border rounded p-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">
                        #{item.number} {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        by {item.author} • {formatDate(item.created_at)}
                      </p>
                      {item.body && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {item.body.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.state === 'open' ? 'default' : 'secondary'
                        }
                      >
                        {item.state}
                      </Badge>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                  {item.labels?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.labels.map((label: string) => (
                        <Badge
                          key={label}
                          variant="outline"
                          className="text-xs"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    case 'list_branches':
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="size-5" />
              Branches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.branches?.map((branch: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="size-4" />
                    <span className="font-mono text-sm">{branch.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {branch.protected && (
                      <Badge variant="secondary" className="text-xs">
                        Protected
                      </Badge>
                    )}
                    <code className="text-xs bg-muted px-1 rounded">
                      {branch.commit.sha.substring(0, 8)}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );

    default:
      return (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Received GitHub response for action: {action}
            </p>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      );
  }
};
