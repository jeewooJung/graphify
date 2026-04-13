export type DocumentStatus =
  | 'UPLOADED'
  | 'QUEUED'
  | 'PARSING'
  | 'INDEXING'
  | 'READY'
  | 'FAILED';

export type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type UploadOutcome = 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

export type DocumentSummary = {
  id: string;
  title: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  status: DocumentStatus;
  progressPct?: number;
  jobStatus?: JobStatus;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  summary?: string;
};

export type DocumentChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  pageNumber?: number;
  sectionTitle?: string;
};

export type DocumentDetail = DocumentSummary & {
  updatedAt: string;
  storagePath?: string;
  sourceType: 'UPLOAD' | 'IMPORT' | 'URL';
  chunkCount: number;
  lastAnalysisLog?: string;
};

export type DocumentFilterState = {
  statuses: DocumentStatus[];
  docTypes: string[];
  tags: string[];
  uploadedFrom?: string;
  uploadedTo?: string;
  query?: string;
};

export type ProjectSummary = {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived';
};

export type ProjectDetail = ProjectSummary & {
  ownerName: string;
  teamId?: string;
  teamName?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectMetrics = {
  documentCount: number;
  lastUploadAt?: string;
  runningJobCount: number;
  memberCount: number;
};

export type FileCandidate = {
  id: string;
  file: File;
  sizeBytes: number;
  mimeType: string;
};

export type DocumentMetadataInput = {
  title?: string;
  tags: string[];
  docType?: string;
};

export type UploadValidation = {
  fileId: string;
  severity: 'error' | 'warn';
  code: 'unsupported_type' | 'too_large' | 'duplicate_filename' | 'permission';
  message: string;
};

export type UploadProgress = {
  fileId: string;
  loadedBytes: number;
  totalBytes: number;
  state: 'PENDING' | 'UPLOADING' | 'SERVER_PROCESSING' | UploadOutcome;
};

export type UploadResult = {
  succeeded: Array<{ fileId: string; documentId: string; jobId: string }>;
  failed: Array<{ fileId: string; reason: string }>;
  cancelled: Array<{ fileId: string }>;
};
