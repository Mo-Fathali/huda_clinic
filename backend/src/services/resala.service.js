const BASE_URL = process.env.RESALA_BASE_URL || 'https://dev.resala.ly/api/v1';
const API_TOKEN = process.env.RESALA_API_TOKEN;

class ResalaError extends Error {
  constructor(message, { status, type, details } = {}) {
    super(message);
    this.name = 'ResalaError';
    this.status = status;
    this.type = type; // 'auth' | 'permission' | 'validation' | 'credit' | 'network' | 'unknown'
    this.details = details;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseErrorResponse(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    // رد بدون JSON
  }

  if (res.status === 401) {
    return new ResalaError('توكن Resala غير صحيح أو مفقود — تحقق من RESALA_API_TOKEN', {
      status: 401, type: 'auth', details: body,
    });
  }
  if (res.status === 403) {
    return new ResalaError('الحساب لا يملك صلاحية الوصول لهذا المسار', {
      status: 403, type: 'permission', details: body,
    });
  }
  if (res.status === 422) {
    const messages = body && typeof body === 'object' ? Object.values(body).flat().join(' | ') : 'بيانات غير صحيحة';
    return new ResalaError(`خطأ في التحقق من البيانات: ${messages}`, {
      status: 422, type: 'validation', details: body,
    });
  }
  if (res.status === 400 && body?.message && /credit|رصيد|balance/i.test(body.message)) {
    return new ResalaError('رصيد المحفظة غير كافٍ لإرسال الرسالة', {
      status: 400, type: 'credit', details: body,
    });
  }

  return new ResalaError(body?.message || `فشل الطلب برمز ${res.status}`, {
    status: res.status, type: 'unknown', details: body,
  });
}

async function request(method, path, { body, query, retryable = false } = {}) {
  if (!API_TOKEN) {
    throw new ResalaError('RESALA_API_TOKEN غير موجود في متغيرات البيئة', { type: 'auth' });
  }

  const url = new URL(`${BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    });
  }

  const maxAttempts = retryable ? 3 : 1; // محاولة أولى + إعادتين كحد أقصى، وبس لطلبات GET
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const err = await parseErrorResponse(res);
        // لا نعيد المحاولة أبدًا على أخطاء واضحة من السيرفر (auth/validation/credit)
        throw err;
      }

      return res.status === 204 ? null : res.json();
    } catch (error) {
      lastError = error;

      const isNetworkError = !(error instanceof ResalaError);
      if (retryable && isNetworkError && attempt < maxAttempts) {
        await sleep(500 * 2 ** (attempt - 1)); // 500ms ثم 1000ms
        continue;
      }
      throw error instanceof ResalaError
        ? error
        : new ResalaError(`فشل الاتصال بـ Resala: ${error.message}`, { type: 'network' });
    }
  }

  throw lastError;
}

// ===== 1) إرسال رمز تحقق (OTP) =====
// ملحوظة: مفيش endpoint للتحقق عند Resala — هما بيرجعولك الرمز وإنت المسؤول عن تخزينه ومقارنته
exports.sendPin = async (phone, { len, serviceName, autofill, test = false } = {}) => {
  const query = {};
  if (test) query.test = '';
  if (len) query.len = len;
  if (serviceName) query.service_name = serviceName;
  if (autofill) query.autofill = autofill;

  return request('POST', '/pins', { body: { phone }, query, retryable: false });
};

// ===== 2) إرسال رسالة من قالب معتمد =====
exports.sendTemplate = async (templateId, records) => {
  return request('POST', '/messages/send-template', {
    query: { sms_template_id: templateId },
    body: { records },
    retryable: false,
  });
};

// ===== 3) سجل التسليم / حالة الرسائل =====
exports.getSentView = async ({ filters = 'source:pin|message', page = 1, paginate = 10, sorts = '-created_at' } = {}) => {
  return request('GET', '/sent-view', {
    query: { filters, page, paginate, sorts },
    retryable: true, // GET فقط يُسمح بإعادة المحاولة
  });
};

exports.ResalaError = ResalaError;