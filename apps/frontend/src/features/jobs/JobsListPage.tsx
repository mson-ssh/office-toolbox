import React, { useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  Download,
  Trash2,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { Job } from '../../lib/api/types';
import { StatusBadge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDeleteDialog } from '../../components/ConfirmDeleteDialog';
import { formatOptions, toolName } from '../../lib/tools';

interface JobsListPageProps {
  onNavigate: (path: string) => void;
}

export const JobsListPage: React.FC<JobsListPageProps> = ({ onNavigate }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getJobs(page, pageSize);
      setJobs(data.jobs);
      setTotal(data.total);
      setError(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Không thể tải danh sách công việc.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  const handleDelete = async () => {
    if (!jobToDelete) return;
    setDeleting(true);
    try {
      await apiClient.deleteJob(jobToDelete.id);
      setJobs(prev => prev.filter(j => j.id !== jobToDelete.id));
      setJobToDelete(null);
      setError(null);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Không thể xóa công việc.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = job.original_filename.toLowerCase().includes(q);
      const matchId = job.id.toLowerCase().includes(q);
      if (!matchName && !matchId) return false;
    }

    // Status filter
    if (statusFilter === 'ACTIVE') {
      return job.status === 'QUEUED' || job.status === 'PROCESSING';
    }
    if (statusFilter === 'COMPLETED') {
      return job.status === 'COMPLETED';
    }
    if (statusFilter === 'FAILED') {
      return job.status === 'FAILED' || job.status === 'EXPIRED';
    }
    return true;
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return (
        d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) +
        ' ' +
        d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      );
    } catch {
      return isoString;
    }
  };

  return (
    <div>
      {error && <div className="error-notice" role="alert">{error}</div>}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Lịch sử công việc</h1>
          <p className="page-description">
            Theo dõi trạng thái, tải kết quả và quản lý các tác vụ xử lý tài liệu của bạn.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" icon={<RefreshCw size={16} />} onClick={fetchJobs} loading={loading}>
            Làm mới
          </Button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => onNavigate('/tools')}>
            Tạo công việc mới
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: '20px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(
            [
              { key: 'ALL', label: 'Tất cả' },
              { key: 'ACTIVE', label: 'Đang xử lý' },
              { key: 'COMPLETED', label: 'Hoàn thành' },
              { key: 'FAILED', label: 'Thất bại / Hết hạn' },
            ] as const
          ).map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: '1px solid',
                borderColor: statusFilter === tab.key ? 'var(--primary-600)' : 'var(--border-light)',
                backgroundColor: statusFilter === tab.key ? 'var(--primary-50)' : 'white',
                color: statusFilter === tab.key ? 'var(--primary-700)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }}
          />
          <input
            type="text"
            placeholder="Tìm theo tên tệp hoặc mã job..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '0.875rem',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="card">
        {filteredJobs.length === 0 ? (
          <EmptyState
            title="Không tìm thấy công việc nào"
            description={
              searchQuery || statusFilter !== 'ALL'
                ? 'Không có công việc nào khớp với bộ lọc hiện tại của bạn.'
                : 'Bạn chưa tạo công việc xử lý tài liệu nào.'
            }
            actionLabel={jobs.length === 0 ? 'Chọn công cụ xử lý' : undefined}
            onAction={() => onNavigate('/tools')}
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tệp gốc</th>
                  <th>Công cụ</th>
                  <th>Tùy chọn</th>
                  <th>Thời gian khởi tạo</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => {
                  const isCompleted = job.status === 'COMPLETED';
                  const canDelete = job.status === 'COMPLETED' || job.status === 'FAILED' || job.status === 'EXPIRED';

                  return (
                    <tr key={job.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {job.original_filename}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          ID: {job.id}
                        </div>
                      </td>
                      <td>{toolName(job.tool_id)}</td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {formatOptions(job.options)}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                        {formatDate(job.created_at)}
                      </td>
                      <td>
                        <StatusBadge status={job.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<ExternalLink size={14} />}
                            onClick={() => onNavigate(`/jobs/${job.id}`)}
                          >
                            Xem
                          </Button>

                          {isCompleted && (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<Download size={14} />}
                              onClick={() => {
                                // Download is served by the OfficeBox backend.
                                const link = document.createElement('a');
                                link.href = apiClient.getDownloadUrl(job.id);
                                link.setAttribute('download', job.download_filename || 'result.zip');
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              Tải
                            </Button>
                          )}

                          {canDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              style={{ color: '#dc2626', borderColor: 'var(--border-light)' }}
                              icon={<Trash2 size={14} />}
                              onClick={() => setJobToDelete(job)}
                              aria-label={`Xóa công việc ${job.original_filename}`}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > pageSize && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
          <Button variant="outline" disabled={page === 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Trang trước
          </Button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Trang {page} / {Math.ceil(total / pageSize)}
          </span>
          <Button variant="outline" disabled={page * pageSize >= total || loading} onClick={() => setPage((value) => value + 1)}>
            Trang sau
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={Boolean(jobToDelete)}
        title="Xác nhận xóa kết quả công việc"
        message={`Bạn có chắc chắn muốn xóa tệp kết quả của "${jobToDelete?.original_filename}"? Thao tác này sẽ xóa vĩnh viễn tệp trên hệ thống.`}
        confirmLabel="Xóa ngay"
        cancelLabel="Hủy"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setJobToDelete(null)}
      />
    </div>
  );
};
