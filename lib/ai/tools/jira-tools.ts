import { experimental_createMCPClient as createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import type { experimental_MCPClient } from 'ai';
// Initialize MCP client with proper error handling
let mcpClient: experimental_MCPClient | null = null;

async function initializeMCPClient() {
  if (mcpClient) {
    return mcpClient;
  }

  try {
    mcpClient = await createMCPClient({
      transport: new StdioMCPTransport({
        command: 'npx',
        args: ['-y', 'mcp-remote@latest', 'https://mcp.atlassian.com/v1/sse'],
        env: {
          ...process.env,
          NODE_TLS_REJECT_UNAUTHORIZED: '0',
        },
      }),
    });

    console.log('✅ Atlassian MCP client initialized successfully');
    return mcpClient;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      '❌ Failed to initialize Atlassian MCP client:',
      errorMessage,
    );

    // Check if it's likely a connection issue to localhost (proxy not running)
    const isLocalhost =
      process.env.ATLASSIAN_MCP_SERVER_URL?.includes('localhost') ||
      !process.env.ATLASSIAN_MCP_SERVER_URL;

    if (
      isLocalhost &&
      (errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('Failed to fetch'))
    ) {
      console.error('');
      console.error(
        '🚫 Cannot connect to MCP proxy. The proxy is likely not running.',
      );
      console.error('');
      console.error(
        '📋 To fix this, start the MCP proxy in a separate terminal:',
      );
      console.error('   pnpm run jira:proxy');
      console.error('   OR manually:');
      console.error('   npx -y mcp-remote https://mcp.atlassian.com/v1/sse');
      console.error('');
      console.error('🔐 Then complete the OAuth flow:');
      console.error('   1. A browser window will open automatically');
      console.error('   2. Log in with your Atlassian credentials');
      console.error('   3. Approve the requested permissions');
      console.error('   4. Keep the proxy terminal running while developing');
      console.error('');
    } else if (
      errorMessage.includes('401') ||
      errorMessage.includes('Unauthorized')
    ) {
      console.error('');
      console.error('🔐 Authentication failed. Please ensure:');
      console.error('   1. The MCP proxy is running with OAuth completed');
      console.error('   2. Your Atlassian account has appropriate permissions');
      console.error('   3. Re-run the proxy if authentication expired');
      console.error('');
    } else {
      console.error('');
      console.error('💡 Troubleshooting steps:');
      console.error('   1. Check network connectivity');
      console.error('   2. Verify the MCP server URL in environment variables');
      console.error('   3. Check the proxy logs for errors');
      console.error('');
    }

    // Return a fallback object with empty tools to prevent crashes
    return {
      tools: () => ({}),
    };
  }
}

// Export a function that returns tools with proper error handling
export async function getJiraTools() {
  try {
    const client = await initializeMCPClient();
    const jiraTools = client.tools();

    return jiraTools;
  } catch (error) {
    throw new Error('Failed to get Jira tools');
  }
}

// Export only the function-based approach to avoid top-level await issues
export const jiraTools = {}; // Deprecated: Use getJiraTools() instead
