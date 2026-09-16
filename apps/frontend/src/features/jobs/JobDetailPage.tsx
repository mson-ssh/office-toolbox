import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Download,
  Trash2,
  RefreshCw,
  FileCheck,
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  Clock,
  Plus,
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { Job } from '../../lib/api/types';
import { StatusBadge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { ProgressBar } from '../../components/ProgressBar';
import { ConfirmDeleteDialog } from '../../components/ConfirmDeleteDialog';
import { formatOptions, toolName } from '../../lib/tools';
import { ResultPreview } from './ResultPreview';

interface JobDetailPageProps {
  jobId: string;
  onNavigate: (path: string) => void;
}

export const JobDetailPage: React.FC<JobDetailPageProps> = ({ jobId, onNavigate }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const fetchJob = async (silent = false, signal?: AbortSignal) => {
    if (!silent) setLoading(true);
    try {
      const data = await apiClient.getJob(jobId, signal);
      setJob(data);
      setError(null);
      setConnectionError(null);
      return data;
    } catch (err: unknown) {
      if (!silent && !(err instanceof DOMException && err.name === 'AbortError')) {
        setError(err instanceof Error ? err.message : 'Không thể tải thông tin công việc.');
      } else if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setConnectionError('Tạm thời mất kết nối với máy chủ. OfficeBox sẽ thử lại.');
      }
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function startPolling() {
      const initial = await fetchJob(false, controller.signal);
      if (!initial || !isMounted) return;

      const poll = async (current: Job) => {
        if (!isMounted || !['QUEUED', 'PROCESSING'].includes(current.status)) return;
        pollTimerRef.current = window.setTimeout(async () => {
          const updated = await fetchJob(true, controller.signal);
          if (isMounted) await poll(updated || current);
        }, document.hidden ? 10000 : 3000);
      };

      if (initial.status === 'QUEUED' || initial.status === 'PROCESSING') {
        await poll(initial);
      }
    }

    startPolling();

    return () => {
      isMounted = false;
      controller.abort();
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [jobId]);

  const handleDelete = async () => {
    if (!job) return;
    setDeleting(true);
    try {
      await apiClient.deleteJob(job.id);
      onNavigate('/jobs');
    } catch (reason: unknown) {
      setConnectionError(reason instanceof Error ? reason.message : 'Không thể xóa công việc.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—';
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

  const handleDownload = () => {
    if (!job) return;
    const link = document.createElement('a');
    link.href = apiClient.getDownloadUrl(job.id);
    link.setAttribute('download', job.download_filename || `${job.original_filename}_output.zip`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <div>Đang tải chi tiết công việc...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto', padding: '36px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
          {error || 'Không tìm thấy công việc'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
          Công việc này có thể đã hết thời hạn lưu trữ hoặc đã bị xóa khỏi hệ thống.
        </p>
        <Button variant="primary" onClick={() => onNavigate('/jobs')}>
          Quay lại danh sách công việc
        </Button>
      </div>
    );
  }

  const isCompleted = job.status === 'COMPLETED';
  const isFailed = job.status === 'FAILED';
  const isExpired = job.status === 'EXPIRED';
  const isActive = job.status === 'QUEUED' || job.status === 'PROCESSING';

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {connectionError && <div className="error-notice" role="alert" style={{ marginBottom: '16px' }}>{connectionError}</div>}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => onNavigate('/jobs')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          Quay lại danh sách công việc
        </button>
      </div>

      {/* Main Status Header Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {job.original_filename}
                </h1>
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                Mã công việc: <code>{job.id}</code>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge status={job.status} />
              {isActive && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RefreshCw size={14} />}
                  onClick={() => fetchJob(false)}
                >
                  Làm mới
                </Button>
              )}
            </div>
          </div>

          {/* Active Progress */}
          {isActive && (
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                marginBottom: '20px',
              }}
            >
              <ProgressBar progress={job.progress} stage={job.progress_stage} />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)', marginTop: '8px' }}>
                Trang sẽ tự động cập nhật trạng thái theo thời gian thực (3 giây / lần).
              </div>
            </div>
          )}

          {/* Success Banner */}
          {isCompleted && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileCheck size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#15803d', fontSize: '1rem' }}>
                    Xử lý hoàn tất thành công!
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#166534' }}>
                    Tệp kết quả đã sẵn sàng để tải về máy của bạn.
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                icon={<Download size={18} />}
                onClick={handleDownload}
                style={{ backgroundColor: '#16a34a' }}
              >
                Tải xuống kết quả
              </Button>
            </div>
          )}

          {isCompleted && <ResultPreview job={job} />}

          {/* Failure Banner */}
          {isFailed && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#dc2626', marginBottom: '8px' }}>
                <AlertCircle size={22} />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                  Xử lý thất bại ({job.error_code || 'ERROR'})
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#991b1b', margin: 0 }}>
                {job.error_message || 'Tệp tài liệu không đọc được hoặc vượt quá giới hạn tài nguyên của máy chủ.'}
              </p>
            </div>
          )}

          {/* Expired Banner */}
          {isExpired && (
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                marginBottom: '24px',
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
              }}
            >
              Tệp kết quả của công việc này đã hết hạn lưu trữ hoặc đã được dọn sạch khỏi bộ nhớ.
            </div>
          )}

          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-subtle)', marginBottom: '4px' }}>
                <Layers size={15} />
                <span>Công cụ thực thi</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                {toolName(job.tool_id)}
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-subtle)', marginBottom: '4px' }}>
                <FileText size={15} />
                <span>Tùy chọn xử lý</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                {formatOptions(job.options)}
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-subtle)', marginBottom: '4px' }}>
                <Calendar size={15} />
                <span>Thời gian khởi tạo</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                {formatDate(job.created_at)}
              </div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-subtle)', marginBottom: '4px' }}>
                <Clock size={15} />
                <span>Hạn lưu trữ</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                {job.expires_at ? formatDate(job.expires_at) : 'Được xác định khi xử lý xong'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="card-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {(isCompleted || isFailed || isExpired) && (
              <Button
                variant="outline"
                size="sm"
                style={{ color: '#dc2626' }}
                icon={<Trash2 size={15} />}
                onClick={() => setShowDeleteModal(true)}
              >
                Xóa công việc này
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="secondary"
              icon={<Plus size={16} />}
              onClick={() => onNavigate(`/tools/${job.tool_id}`)}
            >
              Chuyển đổi tệp khác
            </Button>

            {isCompleted && (
              <Button
                variant="primary"
                icon={<Download size={16} />}
                onClick={handleDownload}
              >
                Tải xuống
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDeleteDialog
        isOpen={showDeleteModal}
        title="Xóa công việc và kết quả"
        message={`Bạn có chắc muốn xóa tệp kết quả của "${job.original_filename}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa vĩnh viễn"
        cancelLabel="Hủy"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
