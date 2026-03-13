'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-sm text-gray-600 hover:text-red-600 border border-gray-300 hover:border-red-400 px-3 py-1 rounded transition"
    >
      Sign out
    </button>
  );
}
