import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@/components/SignOutButton';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/schedules', label: 'Schedules', icon: '📋' },
  { href: '/admin/calendar', label: 'Calendar', icon: '📅' },
  { href: '/admin/taxonomy', label: 'Sections & Topics', icon: '🏷️' },
  { href: '/admin/teachers', label: 'Teachers', icon: '👩‍🏫' },
  { href: '/admin/logs', label: 'Sync Logs', icon: '🔄' },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // @ts-ignore
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const initials = (session?.user?.name || 'A').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: '#ffffff',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #f0f0f0',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4285f4, #1a73e8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(26,115,232,0.3)',
              flexShrink: 0,
            }}>
              SS
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#202124', letterSpacing: '-0.01em' }}>
                Schedule System
              </div>
              <div style={{ fontSize: '11px', color: '#5f6368', fontWeight: 400 }}>
                Admin Portal
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '8px 12px', flexShrink: 0 }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '12px 12px 8px', userSelect: 'none' }}>
            Menu
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                color: '#3c4043',
                textDecoration: 'none',
                fontSize: '13.5px',
                fontWeight: 500,
                transition: 'background 0.15s, color 0.15s',
                marginBottom: '2px',
              }}
              className="admin-nav-link"
            >
              <span style={{ fontSize: '16px', width: '22px', textAlign: 'center' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User Profile + Sign Out — always visible */}
        <div style={{
          borderTop: '1px solid #f0f0f0',
          padding: '12px 16px 48px',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #34a853, #0d652d)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session?.user?.name || 'Admin'}
              </div>
              <div style={{ fontSize: '11px', color: '#5f6368', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session?.user?.email || ''}
              </div>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '24px',
        minHeight: '100vh',
      }}>
        {children}
      </main>

      {/* Nav hover style */}
      <style>{`
        .admin-nav-link:hover {
          background: #f1f3f4 !important;
          color: #1a73e8 !important;
        }
      `}</style>
    </div>
  );
}
