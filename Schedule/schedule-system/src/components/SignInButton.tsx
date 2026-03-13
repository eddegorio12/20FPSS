'use client';

import { signIn } from 'next-auth/react';
import { LogIn } from 'lucide-react';

export function SignInButton() {
  return (
    <div className="space-y-4 w-full">
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <LogIn className="w-5 h-5 mr-2" />
        Sign in with Google
      </button>

      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => signIn('credentials', { username: 'admin@test.com', password: 'admin', callbackUrl: '/' })}
          className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Sign in as Dev Admin
        </button>
      )}
    </div>
  );
}
