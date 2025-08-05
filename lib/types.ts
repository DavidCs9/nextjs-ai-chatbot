import { z } from 'zod';
import type { getWeather } from './ai/tools/get-weather';
import type { createDocument } from './ai/tools/create-document';
import type { updateDocument } from './ai/tools/update-document';
import type { requestSuggestions } from './ai/tools/request-suggestions';
import type { queryAWSResources } from './ai/tools/query-aws-resources';
import type { queryGitHubResources } from './ai/tools/query-github-resources';
import type { InferUITool, UIMessage } from 'ai';

import type { ArtifactKind } from '@/components/artifact';
import type { Suggestion } from './db/schema';

export type DataPart = { type: 'append-message'; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;
type queryAWSResourcesTool = InferUITool<typeof queryAWSResources>;
type queryGitHubResourcesTool = InferUITool<typeof queryGitHubResources>;

export type ChatTools = {
  getWeather: weatherTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
  queryAWSResources: queryAWSResourcesTool;
  queryGitHubResources: queryGitHubResourcesTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}

// JIRA specific types
export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  description: string;
  status: {
    name: string;
    colorName: string;
  };
  priority: {
    name: string;
  };
  assignee: {
    displayName: string;
    emailAddress: string;
  } | null;
  reporter: {
    displayName: string;
  };
  created: string;
  updated: string;
  issuetype: {
    name: string;
    iconUrl: string;
  };
}

export interface JiraSearchResponse {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
}
