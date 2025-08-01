import axios from 'axios';

export interface AtlassianMcpChatOptions {
  apiKey?: string;
  endpoint?: string;
  // more options
}

export async function atlassianMcpChat(
  prompt: string,
  options: AtlassianMcpChatOptions = {},
) {
  const apiKey = options.apiKey || process.env.ATLASSIAN_MCP_API_KEY;
  const endpoint =
    options.endpoint ||
    process.env.ATLASSIAN_MCP_API_URL ||
    'https://api.atlassian.com/mcp/chat';

  const response = await axios.post(
    endpoint,
    { prompt },
    { headers: { Authorization: `Bearer ${apiKey}` } },
  );

  return response.data;
}
