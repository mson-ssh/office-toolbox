export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

export interface ToolOptionDefinition {
  type: 'string' | 'integer' | 'boolean';
  enum?: Array<string | number>;
  default: string | number | boolean;
  description: string;
}

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  input_types: string[];
  input_extensions: string[];
  min_files: number;
  max_files: number;
  available: boolean;
  status_label?: string;
  workload?: 'LIGHT' | 'HEAVY';
  output_type?: string;
  options: Record<string, ToolOptionDefinition>;
}

export interface PublicConfig {
  max_upload_size_mb: number;
  max_files_per_job: number;
  max_pdf_pages: number;
  allowed_mime_types: string[];
  retention_minutes: number;
  max_light_jobs: number;
  version: string;
  app_name: string;
  mode: 'local' | 'nas';
}

export interface JobFileMetadata {
  id: string;
  role: 'input' | 'output';
  filename: string;
  mime_type: string;
  size_bytes: number;
  order_index?: number;
}

export interface Job {
  id: string;
  tool_id: string;
  status: JobStatus;
  original_filename: string;
  options: {
    format?: string;
    dpi?: number;
    [key: string]: unknown;
  };
  progress: number | null;
  progress_stage?: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  expires_at: string | null;
  error_code: string | null;
  error_message: string | null;
  result_files?: JobFileMetadata[];
  download_filename?: string;
}

export interface JobListResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  code: string;
  message: string;
  job_id?: string;
}
