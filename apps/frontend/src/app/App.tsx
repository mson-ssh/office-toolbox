import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/AppShell';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ToolsListPage } from '../features/tools/ToolsListPage';
import { ToolPage } from '../features/tools/ToolPage';
import { JobsListPage } from '../features/jobs/JobsListPage';
import { JobDetailPage } from '../features/jobs/JobDetailPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { EmptyState } from '../components/EmptyState';
import { AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#/, '');
    return hash || '/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setCurrentPath(hash || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (currentPath === '/') {
      return <DashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/tools') {
      return <ToolsListPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/tools/')) {
      const toolId = currentPath.slice('/tools/'.length);
      return <ToolPage toolId={toolId} onNavigate={navigate} />;
    }
    if (currentPath === '/jobs') {
      return <JobsListPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/jobs/')) {
      const jobId = currentPath.replace('/jobs/', '');
      return <JobDetailPage jobId={jobId} onNavigate={navigate} />;
    }
    if (currentPath === '/settings') {
      return <SettingsPage />;
    }

    // 404 Route
    return (
      <EmptyState
        icon={<AlertCircle size={48} color="#dc2626" />}
        title="Trang không tìm thấy (404)"
        description="Đường dẫn bạn yêu cầu không tồn tại trong hệ thống OfficeBox."
        actionLabel="Quay lại trang chủ"
        onAction={() => navigate('/')}
      />
    );
  };

  return (
    <AppShell currentPath={currentPath} onNavigate={navigate}>
      {renderContent()}
    </AppShell>
  );
};
