export const jiraTools = [
  {
    name: 'search_jira_issues',
    description:
      'Search for Jira issues using natural language. Use this when users ask about finding tickets, bugs, or specific topics.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search query - can be natural language like "login bugs" or "payment issues"',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_jira_issue',
    description:
      'Get detailed information about a specific Jira issue by its key (e.g., PROJ-123)',
    parameters: {
      type: 'object',
      properties: {
        issueKey: {
          type: 'string',
          description: 'Jira issue key in format like PROJ-123',
        },
      },
      required: ['issueKey'],
    },
  },
];

export async function executeJiraTool(toolName: string, parameters: any) {
  const response = await fetch('/api/jira', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: toolName === 'search_jira_issues' ? 'search' : 'getIssue',
      query: parameters.query,
      issueKey: parameters.issueKey,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to execute Jira operation');
  }

  return response.json();
}
