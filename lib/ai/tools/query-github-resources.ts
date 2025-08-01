import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';

interface GitHubConfig {
  token?: string;
  owner?: string;
  repo?: string;
}

const createGitHubClient = (config: GitHubConfig = {}) => {
  const token = config.token || process.env.GITHUB_TOKEN;
  const owner = config.owner || process.env.GITHUB_OWNER;
  const repo = config.repo || process.env.GITHUB_REPO;

  if (!token) {
    throw new Error('GitHub token is required');
  }

  const octokit = new Octokit({
    auth: token,
  });

  return { octokit, owner, repo };
};

export const queryGitHubResources = tool({
  description: 'Query GitHub repositories and resources',
  inputSchema: z.object({
    action: z.enum([
      'get_repository_info',
      'list_files',
      'get_file_content',
      'list_commits',
      'list_issues',
      'list_pull_requests',
      'list_branches',
      'get_commit',
      'search_code',
      'get_readme',
    ]),
    owner: z
      .string()
      .optional()
      .describe('GitHub repository owner (username or organization)'),
    repo: z.string().optional().describe('GitHub repository name'),
    path: z.string().optional().describe('File or directory path'),
    sha: z.string().optional().describe('Commit SHA'),
    limit: z
      .number()
      .optional()
      .default(30)
      .describe('Number of items to return'),
    state: z.enum(['open', 'closed', 'all']).optional().default('open'),
    query: z.string().optional().describe('Search query for code search'),
    branch: z
      .string()
      .optional()
      .describe('Branch name (defaults to default branch)'),
  }),

  execute: async ({
    action,
    owner: ownerParam,
    repo: repoParam,
    path,
    sha,
    limit,
    state,
    query,
    branch,
  }) => {
    try {
      const { octokit, owner: envOwner, repo: envRepo } = createGitHubClient();
      const owner = ownerParam || envOwner;
      const repo = repoParam || envRepo;

      if (!owner || !repo) {
        throw new Error(
          'GitHub owner and repository must be provided either as parameters or configured in environment variables',
        );
      }

      switch (action) {
        case 'list_files': {
          const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: path || '',
            ref: branch,
          });

          if (Array.isArray(response.data)) {
            return {
              action,
              path: path || 'root',
              files: response.data.map((item) => ({
                name: item.name,
                path: item.path,
                type: item.type,
                size: item.size,
                download_url: item.download_url,
              })),
            };
          } else {
            if (response.data.type === 'file' && 'content' in response.data) {
              return {
                action,
                path,
                file: {
                  name: response.data.name,
                  path: response.data.path,
                  type: response.data.type,
                  size: response.data.size,
                  content: response.data.content,
                },
              };
            } else {
              return {
                action,
                path,
                file: {
                  name: response.data.name,
                  path: response.data.path,
                  type: response.data.type,
                  size: response.data.size,
                  content: undefined,
                },
                message: 'Content not available for this type of resource.',
              };
            }
          }
        }

        case 'get_file_content': {
          if (!path) {
            throw new Error('Path is required for get_file_content action');
          }

          const response = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref: branch,
          });

          if ('content' in response.data) {
            const content = Buffer.from(
              response.data.content,
              'base64',
            ).toString('utf8');
            return {
              action,
              path,
              content,
              size: response.data.size,
              sha: response.data.sha,
            };
          } else {
            throw new Error('File not found or is a directory');
          }
        }

        case 'list_commits': {
          const response = await octokit.rest.repos.listCommits({
            owner,
            repo,
            per_page: Math.min(limit ?? 30, 100),
            sha: branch,
          });

          return {
            action,
            commits: response.data.map((commit) => ({
              sha: commit.sha,
              message: commit.commit.message,
              author: commit.commit.author,
              date: commit.commit.author?.date,
              url: commit.html_url,
            })),
          };
        }

        case 'get_commit': {
          if (!sha) {
            throw new Error('SHA is required for get_commit action');
          }

          const response = await octokit.rest.repos.getCommit({
            owner,
            repo,
            ref: sha,
          });

          return {
            action,
            commit: {
              sha: response.data.sha,
              message: response.data.commit.message,
              author: response.data.commit.author,
              stats: response.data.stats,
              files: response.data.files?.map((file) => ({
                filename: file.filename,
                status: file.status,
                additions: file.additions,
                deletions: file.deletions,
                changes: file.changes,
              })),
            },
          };
        }

        case 'list_issues': {
          const response = await octokit.rest.issues.listForRepo({
            owner,
            repo,
            state,
            per_page: Math.min(limit ?? 30, 100),
          });

          return {
            action,
            issues: response.data.map((issue) => ({
              number: issue.number,
              title: issue.title,
              body: issue.body,
              state: issue.state,
              author: issue.user?.login,
              created_at: issue.created_at,
              updated_at: issue.updated_at,
              labels: issue.labels.map((label) =>
                typeof label === 'string' ? label : label.name,
              ),
              url: issue.html_url,
            })),
          };
        }

        case 'list_pull_requests': {
          const response = await octokit.rest.pulls.list({
            owner,
            repo,
            state,
            per_page: Math.min(limit ?? 30, 100),
          });

          return {
            action,
            pull_requests: response.data.map((pr) => ({
              number: pr.number,
              title: pr.title,
              body: pr.body,
              state: pr.state,
              author: pr.user?.login,
              created_at: pr.created_at,
              updated_at: pr.updated_at,
              head: pr.head.ref,
              base: pr.base.ref,
              url: pr.html_url,
            })),
          };
        }

        case 'get_repository_info': {
          const response = await octokit.rest.repos.get({
            owner,
            repo,
          });

          return {
            action,
            repository: {
              name: response.data.name,
              full_name: response.data.full_name,
              description: response.data.description,
              private: response.data.private,
              fork: response.data.fork,
              created_at: response.data.created_at,
              updated_at: response.data.updated_at,
              language: response.data.language,
              size: response.data.size,
              stargazers_count: response.data.stargazers_count,
              watchers_count: response.data.watchers_count,
              forks_count: response.data.forks_count,
              open_issues_count: response.data.open_issues_count,
              default_branch: response.data.default_branch,
              topics: response.data.topics,
              license: response.data.license?.name,
              url: response.data.html_url,
            },
          };
        }

        case 'search_code': {
          if (!query) {
            throw new Error('Query is required for search_code action');
          }

          const response = await octokit.rest.search.code({
            q: `${query} repo:${owner}/${repo}`,
            per_page: Math.min(limit ?? 30, 100),
          });

          return {
            action,
            query,
            results: response.data.items.map((item) => ({
              name: item.name,
              path: item.path,
              sha: item.sha,
              url: item.html_url,
              repository: item.repository.full_name,
            })),
            total_count: response.data.total_count,
          };
        }

        case 'list_branches': {
          const response = await octokit.rest.repos.listBranches({
            owner,
            repo,
            per_page: Math.min(limit ?? 30, 100),
          });

          return {
            action,
            branches: response.data.map((branch) => ({
              name: branch.name,
              commit: {
                sha: branch.commit.sha,
                url: branch.commit.url,
              },
              protected: branch.protected,
            })),
          };
        }

        case 'get_readme': {
          try {
            const response = await octokit.rest.repos.getReadme({
              owner,
              repo,
              ref: branch,
            });

            const content = Buffer.from(
              response.data.content,
              'base64',
            ).toString('utf8');
            return {
              action,
              readme: {
                name: response.data.name,
                path: response.data.path,
                content,
                size: response.data.size,
                download_url: response.data.download_url,
              },
            };
          } catch (error: any) {
            if (error.status === 404) {
              return {
                action,
                message: 'README not found in repository',
              };
            }
            throw error;
          }
        }

        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    } catch (error: any) {
      return {
        action,
        error: error.message,
        details: error.response?.data || error.stack,
      };
    }
  },
});
