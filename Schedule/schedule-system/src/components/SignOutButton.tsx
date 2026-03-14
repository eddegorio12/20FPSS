'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      style={{
        width: '100%',
        padding: '8px 12px',
        fontSize: '13px',
        fontWeight: 500,
        color: '#5f6368',
        background: '#f8f9fa',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
      }}
      className="sign-out-btn"
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#fce8e6';
        e.currentTarget.style.color = '#c5221f';
        e.currentTarget.style.borderColor = '#f1c4c0';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#f8f9fa';
        e.currentTarget.style.color = '#5f6368';
        e.currentTarget.style.borderColor = '#e0e0e0';
      }}
    >
      <span style={{ fontSize: '14px' }}>↪</span>
      Sign Out
    </button>
  );
}
