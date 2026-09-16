import React from 'react';

interface ProgressBarProps {
  progress: number | null;
  stage?: string | null;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, stage }) => {
  const percentage = Math.min(100, Math.max(0, progress ?? 0));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>{stage || 'Đang xử lý...'}</span>
        <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{percentage}%</span>
      </div>
      <div
        className="progress-bar-bg"
        role="progressbar"
        aria-label={stage || 'Tiến độ xử lý'}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};
