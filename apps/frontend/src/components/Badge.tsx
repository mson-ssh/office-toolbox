import React from 'react';
import { JobStatus } from '../lib/api/types';
import { Clock, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface BadgeProps {
  status: JobStatus;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  switch (status) {
    case 'QUEUED':
      return (
        <span className="badge badge-queued">
          <Clock size={13} />
          Đang chờ xử lý
        </span>
      );
    case 'PROCESSING':
      return (
        <span className="badge badge-processing">
          <Loader2 size={13} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          Đang xử lý
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="badge badge-completed">
          <CheckCircle2 size={13} />
          Hoàn thành
        </span>
      );
    case 'FAILED':
      return (
        <span className="badge badge-failed">
          <XCircle size={13} />
          Thất bại
        </span>
      );
    case 'EXPIRED':
      return (
        <span className="badge badge-expired">
          <AlertCircle size={13} />
          Đã hết hạn
        </span>
      );
    default:
      return <span className="badge badge-expired">{status}</span>;
  }
};
