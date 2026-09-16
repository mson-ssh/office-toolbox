import React, { useEffect, useState } from 'react';
import {
  FileImage,
  Layers,
  Clock,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ListOrdered,
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { Job, PublicConfig, ToolMetadata } from '../../lib/api/types';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { formatOptions, toolName } from '../../lib/tools';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobTotal, setJobTotal] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [toolsData, jobsData, configData] = await Promise.all([
          apiClient.getTools(),
          apiClient.getJobs(1, 5),
          apiClient.getConfig(),
        ]);
        setTools(toolsData);
        setRecentJobs(jobsData.jobs);
        setJobTotal(jobsData.total);
        setConfig(configData);
      } catch (reason: unknown) {
        setError(reason instanceof Error ? reason.message : 'Không thể tải dữ liệu OfficeBox.');
      }
    }
    loadData();
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' +
             d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {error && <div className="error-notice" role="alert">{error}</div>}
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 36px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            <Sparkles size={15} />
            <span>Phiên bản Local</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '12px' }}>
            OfficeBox — Private Office Tools
          </h1>
          <p style={{ fontSize: '1rem', color: '#e0e7ff', lineHeight: 1.6, marginBottom: '24px' }}>
            Chuyển đổi, OCR và xử lý tài liệu bằng các engine vận hành trực tiếp trên máy chủ OfficeBox.
          </p>
          <Button
            variant="secondary"
            size="lg"
            icon={<ArrowRight size={18} />}
            onClick={() => onNavigate('/tools')}
            style={{ fontWeight: 600, color: '#1e3a8a', backgroundColor: '#ffffff' }}
          >
            Chọn công cụ xử lý
          </Button>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileImage size={20} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Công cụ sẵn sàng</div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{tools.filter((tool) => tool.available).length} công cụ</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Công việc đã tạo</div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {jobTotal}
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Giới hạn tệp</div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{config ? `Tối đa ${config.max_upload_size_mb} MB` : '—'}</div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Thời hạn kết quả</div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{config ? `${config.retention_minutes} phút` : '—'}</div>
        </div>
      </div>

      {/* Available Tools Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Công cụ văn phòng
          </h2>
          <Button variant="outline" size="sm" onClick={() => onNavigate('/tools')}>
            Xem tất cả
          </Button>
        </div>

        <div className="tool-grid">
          {tools.map((t) => (
            <div
              key={t.id}
              className={`tool-card ${t.available ? 'available' : 'disabled'}`}
              onClick={() => {
                if (t.available) onNavigate(`/tools/${t.id}`);
              }}
              onKeyDown={(event) => {
                if (t.available && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  onNavigate(`/tools/${t.id}`);
                }
              }}
              role={t.available ? 'button' : undefined}
              tabIndex={t.available ? 0 : undefined}
              style={{ cursor: t.available ? 'pointer' : 'default' }}
            >
              <div className="tool-icon-wrapper">
                {t.id === 'pdf-to-image' ? <FileImage size={24} /> : <Layers size={24} />}
              </div>
              <div className="tool-name">
                <span>{t.name}</span>
                {t.status_label && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--text-subtle)',
                      backgroundColor: 'var(--bg-subtle)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {t.status_label}
                  </span>
                )}
              </div>
              <div className="tool-desc">{t.description}</div>
              {t.available ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-600)', fontSize: '0.875rem', fontWeight: 600 }}>
                  <span>Sử dụng ngay</span>
                  <ArrowRight size={15} />
                </div>
              ) : (
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>
                  Chờ mở rộng theo lộ trình
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Jobs Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ListOrdered size={20} color="var(--primary-600)" />
            <h3 className="card-title">Công việc gần đây</h3>
          </div>
          {recentJobs.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => onNavigate('/jobs')}>
              Xem tất cả ({recentJobs.length})
            </Button>
          )}
        </div>

        {recentJobs.length === 0 ? (
          <EmptyState
            title="Chưa có công việc nào"
            description="Hãy chọn một công cụ để bắt đầu xử lý tài liệu trên máy chủ nội bộ."
            actionLabel="Chọn công cụ"
            onAction={() => onNavigate('/tools')}
          />
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tệp tài liệu</th>
                  <th>Công cụ</th>
                  <th>Định dạng</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((j) => (
                  <tr key={j.id}>
                    <td style={{ fontWeight: 600 }}>{j.original_filename}</td>
                    <td>{toolName(j.tool_id)}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {formatOptions(j.options)}
                    </td>
                    <td style={{ color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>
                      {formatDate(j.created_at)}
                    </td>
                    <td>
                      <StatusBadge status={j.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate(`/jobs/${j.id}`)}
                      >
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
