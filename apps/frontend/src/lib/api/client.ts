import { ApiError, Job, JobListResponse, PublicConfig, ToolMetadata } from './types';

const API_BASE = '/api/v1';

export class ApiClientError extends Error {
  status: number;
  code: string;
  jobId?: string;

  constructor(status: number, payload: ApiError) {
    super(payload.message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = payload.code;
    this.jobId = payload.job_id;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const headers = new Headers(init?.headers);
  headers.set('Accept', 'application/json');
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiClientError(0, {
      code: 'NETWORK_ERROR',
      message: 'Không thể kết nối với máy chủ OfficeBox.',
    });
  }

  if (!response.ok) {
    let payload: ApiError = {
      code: `HTTP_${response.status}`,
      message: 'Yêu cầu không thể hoàn tất.',
    };
    try {
      const parsed = (await response.json()) as Partial<ApiError>;
      if (typeof parsed.code === 'string' && typeof parsed.message === 'string') {
        payload = { code: parsed.code, message: parsed.message, job_id: parsed.job_id };
      }
    } catch {
      // Keep the safe generic message for non-JSON responses.
    }
    throw new ApiClientError(response.status, payload);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiClient = {
  getHealth(signal?: AbortSignal) {
    return request<{ status: string; database: string; storage: string; version: string; processing_services?: Record<string, string> }>('/health', { signal });
  },
  getConfig(signal?: AbortSignal) {
    return request<PublicConfig>('/config', { signal });
  },
  getTools(signal?: AbortSignal) {
    return request<ToolMetadata[]>('/tools', { signal });
  },
  getJobs(page = 1, limit = 20, signal?: AbortSignal) {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    return request<JobListResponse>(`/jobs?${query}`, { signal });
  },
  getJob(id: string, signal?: AbortSignal) {
    return request<Job>(`/jobs/${encodeURIComponent(id)}`, { signal });
  },
  createJob(formData: FormData) {
    return request<{ job_id: string; status: string; created_at: string }>('/jobs', {
      method: 'POST',
      body: formData,
    });
  },
  deleteJob(id: string) {
    return request<void>(`/jobs/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
  getDownloadUrl(id: string) {
    return `${API_BASE}/jobs/${encodeURIComponent(id)}/download`;
  },
  getPreviewUrl(id: string) {
    return `${API_BASE}/jobs/${encodeURIComponent(id)}/preview`;
  },
};
