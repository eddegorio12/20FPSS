import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SignInButton } from '@/components/SignInButton';

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    // @ts-ignore
    if (session.user.role === 'ADMIN') {
      redirect('/admin');
    } else {
      redirect('/teacher');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Teacher Scheduling System
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your schedules or the admin dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <SignInButton />
          </div>
        </div>
      </div>
    </div>
  );
}
