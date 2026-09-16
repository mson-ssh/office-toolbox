import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { Button } from './Button';

interface FileDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  maxSizeMb?: number;
  accept?: string;
  error?: string | null;
  onValidationError?: (message: string) => void;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  selectedFile,
  onFileSelect,
  maxSizeMb = 50,
  accept = '.pdf,application/pdf',
  error,
  onValidationError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSet(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSet(e.target.files[0]);
    }
  };

  const validateAndSet = (file: File) => {
    if (file.size > maxSizeMb * 1024 * 1024) {
      onValidationError?.(`Dung lượng tệp vượt quá giới hạn cho phép (${maxSizeMb} MB).`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size === 0) {
      onValidationError?.('Tệp PDF không được để trống.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      onValidationError?.('Vui lòng chỉ chọn tệp định dạng PDF.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    onFileSelect(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {!selectedFile ? (
        <div
          className={`dropzone ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Chọn tệp PDF để chuyển đổi"
        >
          <div className="dropzone-icon">
            <UploadCloud size={28} />
          </div>
          <div className="dropzone-title">Kéo thả tệp PDF vào đây hoặc nhấn để chọn tệp</div>
          <div className="dropzone-hint">
            Hỗ trợ tài liệu PDF tiêu chuẩn, dung lượng tối đa {maxSizeMb} MB
          </div>
        </div>
      ) : (
        <div className="selected-file-box">
          <div className="file-info-group">
            <div className="file-icon-box">
              <FileText size={24} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="file-meta-name" title={selectedFile.name}>
                {selectedFile.name}
              </div>
              <div className="file-meta-size">
                {formatFileSize(selectedFile.size)} · Đã sẵn sàng chuyển đổi
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onFileSelect(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
            }}
            icon={<X size={15} />}
          >
            Bỏ chọn
          </Button>
        </div>
      )}

      {error && (
        <div style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
};
