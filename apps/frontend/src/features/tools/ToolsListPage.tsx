import React, { useEffect, useState } from 'react';
import { FileImage, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { ToolMetadata } from '../../lib/api/types';

interface ToolsListPageProps {
  onNavigate: (path: string) => void;
}

export const ToolsListPage: React.FC<ToolsListPageProps> = ({ onNavigate }) => {
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.getTools().then(setTools).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : 'Không thể tải danh sách công cụ.');
    });
  }, []);

  return (
    <div>
      {error && <div className="error-notice" role="alert">{error}</div>}
      <div className="page-header">
        <h1 className="page-title">Danh mục công cụ OfficeBox</h1>
        <p className="page-description">
          Bộ công cụ xử lý văn phòng nội bộ, thực thi an toàn trên máy chủ của bạn mà không gửi dữ liệu ra ngoài.
        </p>
      </div>

      <div className="tool-grid">
        {tools.map((tool) => {
          const isReady = tool.available;
          return (
            <div
              key={tool.id}
              className={`tool-card ${isReady ? 'available' : 'disabled'}`}
              onClick={() => {
                if (isReady) onNavigate(`/tools/${tool.id}`);
              }}
              onKeyDown={(event) => {
                if (isReady && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  onNavigate(`/tools/${tool.id}`);
                }
              }}
              role={isReady ? 'button' : undefined}
              tabIndex={isReady ? 0 : undefined}
            >
              <div className="tool-icon-wrapper">
                {tool.id === 'pdf-to-image' ? <FileImage size={26} /> : <Layers size={26} />}
              </div>
              <div className="tool-name">
                <span>{tool.name}</span>
                {isReady ? (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#15803d',
                      backgroundColor: '#f0fdf4',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <CheckCircle2 size={12} />
                    Sẵn sàng
                  </span>
                ) : (
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
                    {tool.status_label || 'Chưa hỗ trợ'}
                  </span>
                )}
              </div>
              <p className="tool-desc">{tool.description}</p>

              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                {isReady ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Từ {tool.min_files} đến {tool.max_files} tệp
                    </span>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'var(--primary-600)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      Bắt đầu <ArrowRight size={14} />
                    </span>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                    Tính năng đang được chuẩn bị theo lộ trình
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
