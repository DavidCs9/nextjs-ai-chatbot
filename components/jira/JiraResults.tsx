import type { JiraIssue, JiraSearchResponse } from '../../lib/types';
import { JiraIssueCard } from './JiraIssueCard';

interface JiraResultsProps {
  data: JiraSearchResponse | JiraIssue;
  type: 'search' | 'single';
}

export function JiraResults({ data, type }: JiraResultsProps) {
  if (type === 'single') {
    const issue = data as JiraIssue;
    return (
      <div className="mt-4">
        <h4 className="font-medium text-sm text-gray-700 mb-3">
          Issue Details
        </h4>
        <JiraIssueCard issue={issue} showFullDetails={true} />
      </div>
    );
  }

  const searchData = data as JiraSearchResponse;

  if (searchData.issues.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No issues found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="font-medium text-sm text-gray-700 mb-3">
        Found {searchData.issues.length} issue
        {searchData.issues.length !== 1 ? 's' : ''}
        {searchData.total > searchData.issues.length && (
          <span className="text-gray-500">
            {' '}
            (showing first {searchData.issues.length} of {searchData.total})
          </span>
        )}
      </h4>
      <div className="space-y-2">
        {searchData.issues.map((issue) => (
          <JiraIssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
