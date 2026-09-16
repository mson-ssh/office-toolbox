import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  HardDrive,
  Clock,
  Cpu,
  Server,
  FileCheck2,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '../../lib/api/client';
import { PublicConfig } from '../../lib/api/types';

export const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [health, setHealth] = useState<string>('Đang kiểm tra...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiClient.getConfig(controller.signal).then(setConfig).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : 'Không thể tải cấu hình.');
    });
    apiClient.getHealth(controller.signal)
      .then((h) => setHealth(h.status === 'healthy' ? 'Hoạt động' : 'Không sẵn sàng'))
      .catch(() => setHealth('Không thể kết nối'));
    return () => controller.abort();
  }, []);

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Cài đặt & Thông số hệ thống</h1>
        <p className="page-description">
          Thông số giới hạn vận hành và cam kết bảo mật xử lý nội bộ của OfficeBox.
        </p>
      </div>

      {/* Security Statement Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(to right, #eff6ff, #f8fafc)',
          borderColor: '#bfdbfe',
          marginBottom: '24px',
        }}
      >
        <div className="card-body" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-600)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Xử lý tài liệu tại máy chủ nội bộ
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              OfficeBox xử lý tệp bằng backend và engine cục bộ. Cấu hình triển khai không sử dụng dịch vụ chuyển đổi tài liệu bên ngoài.
            </p>
          </div>
        </div>
      </div>

      {error && <div className="error-notice" role="alert">{error}</div>}

      {/* System Limits Grid */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">Giới hạn tài nguyên (Chỉ đọc)</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-600)', marginBottom: '8px' }}>
                <HardDrive size={20} />
                <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                  Dung lượng tải lên tối đa
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {config ? `${config.max_upload_size_mb} MB` : '—'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                Tổng dung lượng đầu vào tối đa cho mỗi công việc
              </div>
            </div>

            <div style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#9333ea', marginBottom: '8px' }}>
                <Clock size={20} />
                <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                  Thời hạn lưu trữ tệp (Retention)
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {config ? `${config.retention_minutes} Phút` : '—'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                Tệp kết quả sẽ tự động được dọn sạch để giải phóng bộ nhớ
              </div>
            </div>

            <div style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', marginBottom: '8px' }}>
                <Cpu size={20} />
                <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                  Số luồng xử lý đồng thời
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                {config ? `${config.max_light_jobs} Worker` : '—'}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                Hàng đợi tách biệt cho tác vụ nhẹ (LIGHT queue)
              </div>
            </div>

            <div style={{ padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0284c7', marginBottom: '8px' }}>
                <Server size={20} />
                <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                  Môi trường & Cổng
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Local :1280
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-subtle)' }}>
                Host port cố định theo quy chuẩn hệ thống
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture & Engine Info */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Thành phần & Công nghệ tích hợp</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck2 size={18} color="var(--primary-600)" />
                <span style={{ fontWeight: 600 }}>Engine PDF và ảnh</span>
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>PyMuPDF · Stirling-PDF</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck2 size={18} color="var(--primary-600)" />
                <span style={{ fontWeight: 600 }}>Engine OCR</span>
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tesseract · OCRmyPDF</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={18} color="var(--primary-600)" />
                <span style={{ fontWeight: 600 }}>Cơ chế bảo mật</span>
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Subprocess cô lập, chống Path Traversal</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#16a34a" />
                <span style={{ fontWeight: 600 }}>Trạng thái API Health</span>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: health === 'Hoạt động' ? '#16a34a' : '#b91c1c' }}>
                {health}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
