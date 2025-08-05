import type { JiraIssue } from '@/types/jira';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface JiraIssueCardProps {
  issue: JiraIssue;
  showFullDetails?: boolean;
}

export function JiraIssueCard({
  issue,
  showFullDetails = false,
}: JiraIssueCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              {issue.key}
            </Badge>
            <Badge
              variant={issue.status.name === 'Done' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {issue.status.name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {issue.priority.name}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <img
              src={issue.issuetype.iconUrl}
              alt={issue.issuetype.name}
              className="w-4 h-4"
            />
            <span>{issue.issuetype.name}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold text-sm mb-2">{issue.summary}</h3>

        {showFullDetails && issue.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {issue.description.replace(/\n/g, ' ').substring(0, 200)}
            {issue.description.length > 200 ? '...' : ''}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>
              <strong>Assignee:</strong>{' '}
              {issue.assignee?.displayName || 'Unassigned'}
            </span>
            <span>
              <strong>Reporter:</strong> {issue.reporter.displayName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>Updated: {formatDate(issue.updated)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
