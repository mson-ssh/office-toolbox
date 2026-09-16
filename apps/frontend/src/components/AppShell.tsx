import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wrench,
  FileImage,
  ListOrdered,
  Settings,
  Menu,
  X,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { Button } from './Button';

interface AppShellProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ currentPath, onNavigate, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Trang chủ', path: '/', icon: <LayoutDashboard size={18} /> },
    { label: 'Tất cả công cụ', path: '/tools', icon: <Wrench size={18} /> },
    { label: 'Công việc', path: '/jobs', icon: <ListOrdered size={18} /> },
    { label: 'Cài đặt hệ thống', path: '/settings', icon: <Settings size={18} /> },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileOpen(false);
  };

  const getBreadcrumb = () => {
    if (currentPath === '/') return 'Bảng điều khiển';
    if (currentPath === '/tools') return 'Danh sách công cụ';
    if (currentPath.startsWith('/tools/')) return 'Công cụ xử lý tài liệu';
    if (currentPath.startsWith('/jobs/')) return 'Chi tiết công việc';
    if (currentPath === '/jobs') return 'Quản lý công việc';
    if (currentPath === '/settings') return 'Cài đặt & Giới hạn';
    return 'OfficeBox';
  };

  return (
    <div className="app-container">
      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 35,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <a
            href="#/"
            className="brand-wrapper"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/');
            }}
          >
            <div className="brand-icon">
              <FileImage size={20} />
            </div>
            <div>
              <div className="brand-title">OfficeBox</div>
              <div className="brand-tagline">Private Office Tools</div>
            </div>
          </a>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.path);

            return (
              <a
                key={item.path}
                href={`#${item.path}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.path);
                }}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="environment-badge">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="env-dot" />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Local 1280</span>
            </div>
            <span style={{ color: 'var(--text-subtle)' }}>9 công cụ</span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Mở danh mục"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="page-breadcrumb">{getBreadcrumb()}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-light)',
              }}
            >
              <ShieldCheck size={16} color="var(--primary-600)" />
              <span>Bảo mật cục bộ</span>
            </div>

            {currentPath !== '/tools' && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={16} />}
                onClick={() => handleNav('/tools')}
              >
                Tạo công việc mới
              </Button>
            )}
          </div>
        </header>

        <main className="content-wrapper">{children}</main>
      </div>
    </div>
  );
};
