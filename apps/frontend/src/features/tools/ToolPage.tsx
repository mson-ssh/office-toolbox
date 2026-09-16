import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, Info, Wrench } from 'lucide-react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { MultiFileDropzone } from '../../components/MultiFileDropzone';
import { apiClient } from '../../lib/api/client';
import { ToolMetadata } from '../../lib/api/types';

interface ToolPageProps {
  toolId: string;
  onNavigate: (path: string) => void;
}

const optionLabels: Record<string, string> = {
  format: 'Định dạng ảnh', dpi: 'Độ phân giải', pages: 'Trang cần xử lý',
  language: 'Ngôn ngữ OCR', page_segmentation: 'Kiểu bố cục',
  deskew: 'Chỉnh nghiêng trang', rotate_pages: 'Tự xoay trang',
  page_size: 'Kích thước trang', level: 'Mức nén',
};

const valueLabels: Record<string, string> = {
  png: 'PNG', jpeg: 'JPEG', webp: 'WEBP', '150': '150 DPI', '200': '200 DPI', '300': '300 DPI',
  'vie+eng': 'Tiếng Việt + Tiếng Anh', vie: 'Tiếng Việt', eng: 'Tiếng Anh',
  '3': 'Tự động', '6': 'Một khối văn bản', '11': 'Văn bản rời rạc',
  image: 'Theo kích thước ảnh', a4: 'Khổ A4', low: 'Thấp · ưu tiên chất lượng',
  balanced: 'Cân bằng', maximum: 'Tối đa · dung lượng nhỏ hơn',
};

const actionLabels: Record<string, string> = {
  'pdf-to-image': 'Chuyển thành ảnh', 'pdf-to-word': 'Chuyển thành Word', 'pdf-to-excel': 'Trích xuất Excel',
  'image-to-text': 'Nhận dạng văn bản', 'ocr-pdf': 'Tạo PDF tìm kiếm được', 'images-to-pdf': 'Tạo PDF',
  'merge-pdf': 'Ghép PDF', 'split-pdf': 'Tách PDF', 'compress-pdf': 'Nén PDF',
};

export const ToolPage: React.FC<ToolPageProps> = ({ toolId, onNavigate }) => {
  const [tool, setTool] = useState<ToolMetadata | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, string | number | boolean>>({});
  const [maxSizeMb, setMaxSizeMb] = useState(100);
  const [loading, setLoading] = useState(false);
  const [loadingTool, setLoadingTool] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingTool(true);
    setFiles([]);
    setError(null);
    Promise.all([apiClient.getTools(controller.signal), apiClient.getConfig(controller.signal)])
      .then(([tools, config]) => {
        const selected = tools.find((item) => item.id === toolId) || null;
        setTool(selected);
        setMaxSizeMb(config.max_upload_size_mb);
        setOptions(Object.fromEntries(Object.entries(selected?.options || {}).map(([name, schema]) => [name, schema.default])));
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Không thể tải cấu hình công cụ.'))
      .finally(() => setLoadingTool(false));
    return () => controller.abort();
  }, [toolId]);

  const accept = useMemo(() => tool ? [...tool.input_extensions, ...tool.input_types].join(',') : '', [tool]);
  const validCount = Boolean(tool && files.length >= tool.min_files && files.length <= tool.max_files);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tool || !validCount) {
      setError(`Vui lòng chọn từ ${tool?.min_files || 1} đến ${tool?.max_files || 1} tệp.`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body = new FormData();
      files.forEach((file) => body.append('files', file));
      body.append('tool_id', tool.id);
      body.append('options', JSON.stringify(options));
      const created = await apiClient.createJob(body);
      onNavigate(`/jobs/${created.job_id}`);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Không thể tạo công việc.');
      setLoading(false);
    }
  };

  if (loadingTool) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải công cụ...</div>;
  if (!tool) return <EmptyState icon={<AlertCircle size={46} color="#dc2626" />} title="Công cụ không tồn tại" description={error || 'OfficeBox không tìm thấy công cụ này.'} actionLabel="Xem tất cả công cụ" onAction={() => onNavigate('/tools')} />;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div className="tool-icon-wrapper" style={{ margin: 0 }}><Wrench size={23} /></div>
          <h1 className="page-title" style={{ margin: 0 }}>{tool.name}</h1>
        </div>
        <p className="page-description">{tool.description}</p>
      </div>

      <form onSubmit={submit}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header"><h2 className="card-title">1. Chọn tệp đầu vào</h2></div>
          <div className="card-body">
            <MultiFileDropzone files={files} onFilesChange={setFiles} accept={accept} extensions={tool.input_extensions} minFiles={tool.min_files} maxFiles={tool.max_files} maxSizeMb={maxSizeMb} onValidationError={setError} enablePaste={tool.id === 'image-to-text'} />
            {tool.max_files > 1 && <div style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Kéo từng dòng hoặc dùng nút lên/xuống để sắp xếp. OfficeBox giữ nguyên thứ tự này khi xử lý.</div>}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header"><h2 className="card-title">2. Tùy chọn xử lý</h2></div>
          <div className="card-body">
            {Object.keys(tool.options).length === 0 && <div style={{ color: 'var(--text-muted)' }}>Công cụ này dùng cấu hình an toàn mặc định.</div>}
            {Object.entries(tool.options).map(([name, schema]) => (
              <div className="form-group" key={name}>
                {schema.type === 'boolean' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={Boolean(options[name])} onChange={(event) => setOptions((current) => ({ ...current, [name]: event.target.checked }))} />
                    <span><strong>{optionLabels[name] || name}</strong><br /><small style={{ color: 'var(--text-muted)' }}>{schema.description}</small></span>
                  </label>
                ) : schema.enum ? (
                  <>
                    <label className="form-label" htmlFor={`option-${name}`}>{optionLabels[name] || name}</label>
                    <select id={`option-${name}`} className="form-control" value={String(options[name] ?? schema.default)} onChange={(event) => {
                      const next = schema.type === 'integer' ? Number(event.target.value) : event.target.value;
                      setOptions((current) => ({ ...current, [name]: next }));
                    }}>
                      {schema.enum.map((value) => <option key={String(value)} value={String(value)}>{valueLabels[String(value)] || String(value)}</option>)}
                    </select>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '5px' }}>{schema.description}</div>
                  </>
                ) : (
                  <>
                    <label className="form-label" htmlFor={`option-${name}`}>{optionLabels[name] || name}</label>
                    <input id={`option-${name}`} className="form-control" type="text" value={String(options[name] ?? schema.default)} onChange={(event) => setOptions((current) => ({ ...current, [name]: event.target.value }))} placeholder={name === 'pages' ? '1-3,5,8-10' : undefined} />
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '5px' }}>{schema.description}</div>
                  </>
                )}
              </div>
            ))}
            {(toolId === 'pdf-to-word' || toolId === 'pdf-to-excel') && <div className="info-notice"><Info size={18} /><span>Chất lượng phụ thuộc cấu trúc PDF. Tệp scan nên chạy OCR PDF trước để có lớp chữ.</span></div>}
            {toolId === 'compress-pdf' && <div className="info-notice"><Info size={18} /><span>Mức nén cao có thể làm giảm chất lượng ảnh. Dung lượng thực tế phụ thuộc nội dung PDF.</span></div>}
            {error && <div className="error-notice" role="alert" style={{ marginTop: '16px' }}>{error}</div>}
          </div>
          <div className="card-footer">
            <Button type="submit" size="lg" loading={loading} disabled={!validCount || loading} icon={<ArrowRight size={18} />}>{actionLabels[tool.id] || 'Bắt đầu xử lý'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
};
