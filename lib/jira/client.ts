import type { JiraIssue, JiraSearchResponse } from '../types';

export class JiraClient {
  private baseUrl: string;
  private email: string;
  private apiToken: string;

  constructor() {
    this.baseUrl = process.env.JIRA_BASE_URL!;
    this.email = process.env.JIRA_EMAIL!;
    this.apiToken = process.env.JIRA_API_TOKEN!;
  }

  private get authHeader() {
    return `Basic ${Buffer.from(`${this.email}:${this.apiToken}`).toString('base64')}`;
  }

  private async request(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/rest/api/3${endpoint}`, {
      headers: {
        Authorization: this.authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Jira API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  async searchIssues(
    query: string,
    maxResults = 10,
  ): Promise<JiraSearchResponse> {
    // Convert natural language to basic JQL
    const jql = this.buildJQL(query);

    const endpoint = `/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=id,key,summary,description,status,priority,assignee,reporter,created,updated,issuetype`;

    return this.request(endpoint);
  }

  async getIssue(issueKey: string): Promise<JiraIssue> {
    const endpoint = `/issue/${issueKey}?fields=id,key,summary,description,status,priority,assignee,reporter,created,updated,issuetype`;
    return this.request(endpoint);
  }

  private buildJQL(query: string): string {
    // Simple query parsing - convert natural language to basic JQL
    const lowerQuery = query.toLowerCase();

    // Check if it's already an issue key (PROJ-123 format)
    if (/^[A-Z]+-\d+$/.test(query.toUpperCase())) {
      return `key = "${query.toUpperCase()}"`;
    }

    // Build text search JQL
    let jql = `text ~ "${query}"`;

    // Add common filters based on keywords
    if (lowerQuery.includes('bug')) {
      jql += ' AND issuetype = Bug';
    }
    if (lowerQuery.includes('open') || lowerQuery.includes('active')) {
      jql += ' AND status != Done';
    }
    if (lowerQuery.includes('my') || lowerQuery.includes('assigned to me')) {
      jql += ' AND assignee = currentUser()';
    }

    // Order by updated date
    jql += ' ORDER BY updated DESC';

    return jql;
  }
}
