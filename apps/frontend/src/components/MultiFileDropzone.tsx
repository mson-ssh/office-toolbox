import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ClipboardPaste, FileText, Trash2, UploadCloud } from 'lucide-react';
import { Button } from './Button';

interface MultiFileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept: string;
  extensions: string[];
  minFiles: number;
  maxFiles: number;
  maxSizeMb: number;
  onValidationError: (message: string | null) => void;
  enablePaste?: boolean;
}

function fileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const clipboardExtension: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/tiff': 'tiff',
  'image/webp': 'webp',
};

export const MultiFileDropzone: React.FC<MultiFileDropzoneProps> = ({ files, onFilesChange, accept, extensions, minFiles, maxFiles, maxSizeMb, onValidationError, enablePaste = false }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);
  const [draggingOver, setDraggingOver] = useState(false);
  const [pasteMessage, setPasteMessage] = useState<string | null>(null);

  const addFiles = (incoming: File[]) => {
    const allowed = new Set(extensions.map((value) => value.toLowerCase()));
    const candidates = maxFiles === 1 ? incoming.slice(0, 1) : [...files, ...incoming];
    if (candidates.length > maxFiles) {
      onValidationError(`Công cụ này nhận tối đa ${maxFiles} tệp.`);
      return false;
    }
    if (candidates.some((file) => file.size === 0)) {
      onValidationError('Không chấp nhận tệp rỗng.');
      return false;
    }
    if (candidates.some((file) => !allowed.has(`.${file.name.split('.').pop()?.toLowerCase()}`))) {
      onValidationError(`Chỉ chấp nhận: ${extensions.join(', ')}.`);
      return false;
    }
    const total = candidates.reduce((sum, file) => sum + file.size, 0);
    if (total > maxSizeMb * 1024 * 1024) {
      onValidationError(`Tổng dung lượng vượt quá ${maxSizeMb} MB.`);
      return false;
    }
    onValidationError(null);
    onFilesChange(candidates);
    if (inputRef.current) inputRef.current.value = '';
    return true;
  };

  useEffect(() => {
    if (!enablePaste) return;

    const handlePaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return;

      const pastedImages = Array.from(event.clipboardData?.items || [])
        .filter((item) => item.kind === 'file' && item.type in clipboardExtension)
        .map((item, index) => {
          const source = item.getAsFile();
          if (!source) return null;
          const extension = clipboardExtension[source.type] || 'png';
          const hasExtension = /\.[a-z0-9]+$/i.test(source.name);
          return hasExtension
            ? source
            : new File([source], `clipboard-${Date.now()}-${index + 1}.${extension}`, {
                type: source.type,
                lastModified: Date.now(),
              });
        })
        .filter((file): file is File => file !== null);

      if (pastedImages.length === 0) return;
      event.preventDefault();
      if (addFiles(pastedImages)) {
        setPasteMessage('Đã dán ảnh từ clipboard.');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  });

  const move = (from: number, to: number) => {
    if (to < 0 || to >= files.length || from === to) return;
    const next = [...files];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onFilesChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input ref={inputRef} type="file" accept={accept} multiple={maxFiles > 1} className="visually-hidden" onChange={(event) => addFiles(Array.from(event.target.files || []))} />
      <div
        className={`dropzone ${draggingOver ? 'active' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Chọn tệp đầu vào"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => { event.preventDefault(); setDraggingOver(true); }}
        onDragLeave={() => setDraggingOver(false)}
        onDrop={(event) => { event.preventDefault(); setDraggingOver(false); addFiles(Array.from(event.dataTransfer.files)); }}
      >
        <div className="dropzone-icon"><UploadCloud size={28} /></div>
        <div className="dropzone-title">Kéo thả tệp vào đây hoặc nhấn để chọn</div>
        <div className="dropzone-hint">{minFiles === maxFiles ? `Yêu cầu ${minFiles} tệp` : `Từ ${minFiles} đến ${maxFiles} tệp`} · Tổng tối đa {maxSizeMb} MB</div>
        {enablePaste && (
          <div className="dropzone-paste-hint">
            <ClipboardPaste size={15} aria-hidden="true" />
            Hoặc nhấn Ctrl+V / ⌘V để dán ảnh từ clipboard
          </div>
        )}
      </div>

      {pasteMessage && <div className="paste-success" role="status">{pasteMessage}</div>}

      {files.map((file, index) => (
        <div
          className="selected-file-box"
          key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
          draggable={files.length > 1}
          onDragStart={() => { dragIndex.current = index; }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => { event.preventDefault(); if (dragIndex.current !== null) move(dragIndex.current, index); dragIndex.current = null; }}
        >
          <div className="file-info-group">
            <div className="file-icon-box"><FileText size={22} /></div>
            <div style={{ minWidth: 0 }}>
              <div className="file-meta-name" title={file.name}>{index + 1}. {file.name}</div>
              <div className="file-meta-size">{fileSize(file.size)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {files.length > 1 && <>
              <Button variant="outline" size="sm" icon={<ArrowUp size={14} />} aria-label={`Đưa ${file.name} lên`} disabled={index === 0} onClick={() => move(index, index - 1)} />
              <Button variant="outline" size="sm" icon={<ArrowDown size={14} />} aria-label={`Đưa ${file.name} xuống`} disabled={index === files.length - 1} onClick={() => move(index, index + 1)} />
            </>}
            <Button variant="outline" size="sm" icon={<Trash2 size={14} />} aria-label={`Bỏ ${file.name}`} onClick={() => onFilesChange(files.filter((_, fileIndex) => fileIndex !== index))} />
          </div>
        </div>
      ))}
    </div>
  );
};
