import React, { useEffect, useState } from 'react';
import { Check, Copy, Eye, FileArchive } from 'lucide-react';
import { Job } from '../../lib/api/types';
import { apiClient } from '../../lib/api/client';

interface ResultPreviewProps {
  job: Job;
}

const PREVIEWABLE_IMAGES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const ResultPreview: React.FC<ResultPreviewProps> = ({ job }) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const result = job.result_files?.[0];
  const previewUrl = apiClient.getPreviewUrl(job.id);
  const mimeType = result?.mime_type.split(';', 1)[0].trim().toLowerCase() || '';
  const isImage = PREVIEWABLE_IMAGES.has(mimeType);
  const isPdf = mimeType === 'application/pdf';
  const isText = mimeType === 'text/plain';
  const supported = isImage || isPdf || isText;

  useEffect(() => {
    if (!isText) {
      setTextContent(null);
      setTextError(null);
      return;
    }
    const controller = new AbortController();
    fetch(previewUrl, { signal: controller.signal, headers: { Accept: 'text/plain' } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Không thể tải nội dung OCR để xem trước.');
        return response.text();
      })
      .then((text) => {
        setTextContent(text);
        setTextError(null);
      })
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === 'AbortError')) {
          setTextError(reason instanceof Error ? reason.message : 'Không thể tải nội dung OCR để xem trước.');
        }
      });
    return () => controller.abort();
  }, [isText, previewUrl]);

  if (!result) return null;

  const copyText = async () => {
    if (textContent === null) return;
    try {
      await navigator.clipboard.writeText(textContent);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = textContent;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="result-preview" aria-labelledby="result-preview-title">
      <div className="result-preview-header">
        <div>
          <h2 id="result-preview-title">
            <Eye size={18} aria-hidden="true" />
            Xem trước kết quả
          </h2>
          <p>{result.filename}</p>
        </div>
        {supported && (
          <a href={previewUrl} target="_blank" rel="noreferrer" className="preview-open-link">
            Mở toàn màn hình
          </a>
        )}
      </div>

      {isImage && (
        <div className="result-preview-canvas image-preview">
          <img src={previewUrl} alt={`Bản xem trước ${result.filename}`} loading="lazy" />
        </div>
      )}

      {isPdf && (
        <iframe
          className="result-preview-frame"
          src={previewUrl}
          title={`Bản xem trước ${result.filename}`}
        />
      )}

      {isText && (
        <div className="ocr-text-result">
          <div className="ocr-text-toolbar">
            <span>Nội dung nhận dạng</span>
            <button type="button" className="preview-copy-button" onClick={copyText} disabled={textContent === null}>
              {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              {copied ? 'Đã sao chép' : 'Sao chép văn bản'}
            </button>
          </div>
          {textError ? (
            <div className="ocr-text-error" role="alert">{textError}</div>
          ) : textContent === null ? (
            <div className="ocr-text-loading">Đang tải nội dung OCR...</div>
          ) : (
            <pre tabIndex={0}>{textContent || 'Không nhận dạng được nội dung chữ trong ảnh.'}</pre>
          )}
        </div>
      )}

      {!supported && (
        <div className="preview-unavailable" role="status">
          <FileArchive size={32} aria-hidden="true" />
          <div>
            <strong>Định dạng này chưa thể xem trực tiếp</strong>
            <p>Vui lòng dùng nút tải xuống để mở tệp {result.filename} trên máy.</p>
          </div>
        </div>
      )}
    </section>
  );
};
