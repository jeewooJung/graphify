export type ScopeKind = 'WORKSPACE' | 'TEAM' | 'PROJECT';

export type ChatScope =
  | { kind: 'WORKSPACE' }
  | { kind: 'TEAM'; teamId: string }
  | { kind: 'PROJECT'; projectId: string };

export type ChatSessionSummary = {
  id: string;
  title: string;
  scope: ChatScope;
  lastMessageAt: string;
  createdBy: string;
};

export type ChatSession = ChatSessionSummary & {
  createdAt: string;
  updatedAt: string;
};

export type BaseMessage = {
  id: string;
  sessionId: string;
  createdAt: string;
};

export type UserMessage = BaseMessage & {
  role: 'user';
  content: string;
};

export type SystemMessage = BaseMessage & {
  role: 'system';
  variant: 'insufficient_evidence' | 'permission_warning' | 'info';
  content: string;
};

export type Citation = {
  id: string;
  documentId: string;
  chunkId: string;
  projectId: string;
  projectName: string;
  documentTitle: string;
  quoteText: string;
  pageNumber?: number;
  relevanceScore: number;
};

export type SuggestedQuestion = {
  id: string;
  text: string;
};

export type AssistantAnswer = BaseMessage & {
  role: 'assistant';
  content: string;
  modelName: string;
  confidence?: number;
  citations: Citation[];
  suggestedFollowUps: SuggestedQuestion[];
};

export type ConversationMessage = UserMessage | SystemMessage | AssistantAnswer;

export type CitationRef = {
  messageId: string;
  citationId: string;
};

export type CitationPreview = Citation & {
  sectionTitle?: string;
  surroundingText?: string;
};

export type CitationNavigation = {
  projectId: string;
  documentId: string;
  chunkId?: string;
};

export type ChatAnswerRequest = {
  scope: ChatScope;
  content: string;
  sessionId?: string;
};

export type ProjectOption = {
  id: string;
  name: string;
};

export type TeamOption = {
  id: string;
  name: string;
};

export type NavigationTarget =
  | { kind: 'document'; payload: CitationNavigation }
  | { kind: 'search'; payload: { query: string } }
  | { kind: 'graph'; payload: { nodeId: string } };
