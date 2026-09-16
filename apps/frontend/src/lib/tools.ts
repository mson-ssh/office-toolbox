const names: Record<string, string> = {
  'pdf-to-image': 'PDF → Ảnh',
  'pdf-to-word': 'PDF → Word',
  'pdf-to-excel': 'PDF → Excel',
  'image-to-text': 'Ảnh → Văn bản',
  'ocr-pdf': 'OCR PDF',
  'images-to-pdf': 'Ảnh → PDF',
  'merge-pdf': 'Ghép PDF',
  'split-pdf': 'Tách PDF',
  'compress-pdf': 'Nén PDF',
};

export function toolName(toolId: string): string {
  return names[toolId] || toolId;
}

export function formatOptions(options: Record<string, unknown>): string {
  const entries = Object.entries(options);
  if (entries.length === 0) return 'Mặc định';
  return entries
    .map(([key, value]) => {
      if (typeof value === 'boolean') return `${key}: ${value ? 'Có' : 'Không'}`;
      return `${key}: ${String(value)}`;
    })
    .join(' · ');
}
