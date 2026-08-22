'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/auth';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setChecked(true);
      return;
    }
    if (!isAdminLoggedIn()) {
      router.replace('/admin/login');
      return;
    }
    setChecked(true);
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return children;
  }

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        جارِ التحقق...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-soft" dir="rtl">
      <Sidebar />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}