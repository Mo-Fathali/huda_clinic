// frontend/lib/api.js

import { clearAdminSession, clearPatientSession } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // بعض الردود (زي 204) ما فيهاش body
  }

  if (res.status === 401) {
    // التوكن غير صالح/منتهي — نمسح الجلسة المناسبة ونحوّل للوجن
    if (path.startsWith('/api/admin')) {
      clearAdminSession();
      if (typeof window !== 'undefined') window.location.href = '/admin/login';
    } else {
      clearPatientSession();
    }
  }

  if (!res.ok) {
    throw new Error(data?.error || 'حدث خطأ غير متوقع');
  }

  return data;
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export function withAuth(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}
