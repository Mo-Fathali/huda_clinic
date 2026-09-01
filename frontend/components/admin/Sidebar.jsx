'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAdminSession, getAdminData } from '@/lib/auth';

const LINKS = [
  { href: '/admin', label: 'نظرة عامة', exact: true },
  { href: '/admin/appointments', label: 'الحجوزات' },
  { href: '/admin/patients', label: 'الحالات' },
  { href: '/admin/invoices', label: 'الفواتير' },
{ href: '/admin/suppliers', label: 'المزودين' },
{ href: '/admin/finance', label: 'الملخص المالي' },
  { href: '/admin/services', label: 'الخدمات' },
  { href: '/admin/availability', label: 'الدوام' },
  { href: '/admin/profile', label: 'بيانات العيادة' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const admin = getAdminData();

  function handleLogout() {
    clearAdminSession();
    router.push('/admin/login');
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-l border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h2 className="font-bold text-ink">لوحة التحكم</h2>
        {admin?.name && <p className="text-sm text-gray-500 mt-1">{admin.name}</p>}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {LINKS.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-4 py-2 text-sm transition ${
                isActive ? 'bg-rose text-white' : 'text-ink hover:bg-soft'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-sm text-gray-500 hover:text-red-600 text-right"
        >
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}