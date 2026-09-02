// frontend/lib/auth.js

const TOKEN_KEY = 'patient_token';
const PATIENT_KEY = 'patient_data';
const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_KEY = 'admin_data';

// يفك تشفير الجزء الأوسط (payload) من الـ JWT بدون مكتبة خارجية
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenValid(token) {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 > Date.now();
}

// ===== الزبون =====
export function savePatientSession(token, patient) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(PATIENT_KEY, JSON.stringify(patient));
}

export function getPatientToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getPatientData() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(PATIENT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearPatientSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PATIENT_KEY);
}

export function isPatientLoggedIn() {
  return isTokenValid(getPatientToken());
}

// ===== الأدمن =====
export function saveAdminSession(token, admin) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}

export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminData() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(ADMIN_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

export function isAdminLoggedIn() {
  return isTokenValid(getAdminToken());
}
