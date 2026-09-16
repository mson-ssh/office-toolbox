import React, { useEffect, useState } from 'react';
import { FileImage, Info, ArrowRight, Check } from 'lucide-react';
import { FileDropzone } from '../../components/FileDropzone';
import { Button } from '../../components/Button';
import { apiClient } from '../../lib/api/client';

interface PdfToImagePageProps {
  onNavigate: (path: string) => void;
}

export const PdfToImagePage: React.FC<PdfToImagePageProps> = ({ onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [dpi, setDpi] = useState<number>(150);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [maxSizeMb, setMaxSizeMb] = useState(100);

  useEffect(() => {
    const controller = new AbortController();
    apiClient.getConfig(controller.signal)
      .then((config) => setMaxSizeMb(config.max_upload_size_mb))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Vui lòng chọn một tệp PDF trước khi chuyển đổi.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('files', selectedFile);
      formData.append('tool_id', 'pdf-to-image');
      formData.append(
        'options',
        JSON.stringify({
          format,
          dpi,
        })
      );

      const res = await apiClient.createJob(formData);
      onNavigate(`/jobs/${res.job_id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi tạo công việc chuyển đổi.';
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  const formatOptions = [
    {
      value: 'png',
      label: 'PNG',
      desc: 'Ảnh độ nét cao, không nén suy hao, tối ưu cho tài liệu chữ và biểu đồ',
    },
    {
      value: 'jpeg',
      label: 'JPEG',
      desc: 'Dung lượng tệp nhỏ gọn, phù hợp lưu trữ và gửi email nhanh',
    },
    {
      value: 'webp',
      label: 'WEBP',
      desc: 'Định dạng hiện đại tối ưu web, cân bằng dung lượng và chất lượng',
    },
  ];

  const dpiOptions = [
    { value: 150, label: '150 DPI', sub: 'Tiêu chuẩn màn hình' },
    { value: 200, label: '200 DPI', sub: 'Sắc nét cao cấp' },
    { value: 300, label: '300 DPI', sub: 'Chất lượng in ấn' },
  ];

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-50)',
              color: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileImage size={24} />
          </div>
          <h1 className="page-title" style={{ margin: 0 }}>
            PDF → Ảnh
          </h1>
        </div>
        <p className="page-description">
          Chuyển đổi từng trang của tài liệu PDF thành các tệp ảnh chất lượng cao. Toàn bộ quá trình diễn ra cục bộ trong máy chủ.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">1. Chọn tệp PDF cần chuyển đổi</h3>
          </div>
          <div className="card-body">
            <FileDropzone
              selectedFile={selectedFile}
              maxSizeMb={maxSizeMb}
              onFileSelect={(file) => {
                setSelectedFile(file);
                if (file) setErrorMessage(null);
              }}
              error={errorMessage}
              onValidationError={setErrorMessage}
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">2. Tùy chọn chuyển đổi</h3>
          </div>
          <div className="card-body">
            {/* Format Selection */}
            <div className="form-group">
              <label className="form-label">Định dạng ảnh kết xuất:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {formatOptions.map((opt) => {
                  const isSelected = format === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setFormat(opt.value as 'png' | 'jpeg' | 'webp')}
                      aria-pressed={isSelected}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-lg)',
                        border: isSelected ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
                        background: isSelected ? 'var(--primary-50)' : 'white',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        position: 'relative',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: isSelected ? 'var(--primary-700)' : 'var(--text-main)' }}>
                          {opt.label}
                        </span>
                        {isSelected && (
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DPI Selection */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Độ phân giải kết xuất (DPI):</label>
              <div className="radio-pills">
                {dpiOptions.map((opt) => {
                  const isSelected = dpi === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`radio-pill-label ${isSelected ? 'selected' : ''}`}
                      onClick={() => setDpi(opt.value)}
                    >
                      <input
                        type="radio"
                        name="dpi"
                        value={opt.value}
                        checked={isSelected}
                        onChange={() => setDpi(opt.value)}
                        className="visually-hidden"
                      />
                      <span>{opt.label}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.75 }}>({opt.sub})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Packaging Notice */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
              }}
            >
              <Info size={18} color="var(--primary-600)" style={{ flexShrink: 0 }} />
              <div>
                Tài liệu có một trang sẽ xuất trực tiếp tệp ảnh. Nếu tài liệu có nhiều trang, toàn bộ ảnh sẽ được tự động đóng gói thành một tệp ZIP duy nhất.
              </div>
            </div>
          </div>

          <div className="card-footer">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={!selectedFile || loading}
              loading={loading}
              icon={<ArrowRight size={18} />}
            >
              Chuyển thành ảnh
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
