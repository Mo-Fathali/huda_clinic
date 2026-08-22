'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api, withAuth } from '@/lib/api';
import { getAdminToken } from '@/lib/auth';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  function load() {
    setLoading(true);
    const token = getAdminToken();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (filter !== 'all') params.set('filter', filter);

    api
      .get(`/api/admin/patients?${params.toString()}`, withAuth(token))
      .then(setPatients)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300); // debounce أثناء الكتابة
    return () => clearTimeout(timeout);
  }, [search, filter]);

  async function handleExport() {
    const token = getAdminToken();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/patients/export`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('تعذّر تصدير الملف');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'patients.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    const token = getAdminToken();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/patients/import`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل الاستيراد');

      setImportResult(data);
      load();
    } catch (err) {
      setImportResult({ error: err.message });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-ink">سجلات الحالات</h1>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="bg-white border border-gray-300 text-ink text-sm px-4 py-2 rounded-lg hover:bg-soft transition"
          >
            تصدير Excel
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-rose text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {importing ? 'جارِ الاستيراد...' : 'استيراد من Excel'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {importResult && (
        <div
          className={`rounded-lg px-4 py-3 mb-4 text-sm ${
            importResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}
        >
          {importResult.error ? (
            importResult.error
          ) : (
            <>
              تم الاستيراد: {importResult.created} سجل جديد، {importResult.updated} سجل محدّث من أصل{' '}
              {importResult.totalRows}.
              {importResult.errors?.length > 0 && (
                <ul className="mt-2 list-disc list-inside">
                  {importResult.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}

      <div className="flex gap-3 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">كل الحالات</option>
          <option value="active">غير محظورات</option>
          <option value="blacklisted">محظورات</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5">
        {loading && <p className="text-gray-500 text-center py-6">جارِ التحميل...</p>}
        {error && <p className="text-red-600 text-center py-6">{error}</p>}
        {!loading && !error && patients.length === 0 && (
          <p className="text-gray-500 text-center py-6">لا توجد نتائج</p>
        )}

        {!loading && !error && patients.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-500">
                  <th className="py-3 px-3">الاسم</th>
                  <th className="py-3 px-3">الهاتف</th>
                  <th className="py-3 px-3">عدد الحجوزات</th>
                  <th className="py-3 px-3">السجل المرضي</th>
                  <th className="py-3 px-3">الحالة</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 text-sm">
                    <td className="py-3 px-3 font-medium text-ink">{p.name || '—'}</td>
                    <td className="py-3 px-3 text-gray-600" dir="ltr">{p.phone}</td>
                    <td className="py-3 px-3 text-gray-600">{p._count?.appointments ?? 0}</td>
                    <td className="py-3 px-3">
                      {p.medicalRecord ? (
                        <span className="text-green-600 text-xs">موجود</span>
                      ) : (
                        <span className="text-gray-400 text-xs">غير موجود</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {p.isBlacklisted ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">محظورة</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">نشطة</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <Link href={`/admin/patients/${p.id}`} className="text-rose hover:underline text-xs">
                        عرض التفاصيل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        ملف الاستيراد يجب أن يحتوي على عمود "الهاتف" على الأقل — الأرقام الموجودة يتم تحديثها، والجديدة تُضاف.
      </p>
    </div>
  );
}