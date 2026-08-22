'use client';

import { useState, useRef } from 'react';
import { api } from '@/lib/api';

export default function OtpInput({ onVerified }) {
  const [step, setStep] = useState('phone'); // phone | code
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputsRef = useRef([]);

  async function handleSendOtp(e) {
    e.preventDefault();
    setError(null);

    if (!/^\+?[0-9]{8,15}$/.test(phone)) {
      setError('رقم الهاتف غير صحيح');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/send-otp', { phone });
      setStep('code');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(index, value) {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleCodeKeyDown(index, e) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError(null);

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('أدخلي رمز التحقق كاملاً');
      return;
    }

    setLoading(true);
    try {
      const result = await api.post('/api/auth/verify-otp', {
        phone,
        code: fullCode,
        name: name || undefined,
      });
      onVerified(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (step === 'phone') {
    return (
      <form onSubmit={handleSendOtp} className="space-y-4 max-w-sm mr-auto">
        <div>
          <label className="block text-sm text-gray-600 mb-1">الاسم</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-right focus:outline-none focus:ring-2 focus:ring-rose"
            placeholder="اسمك"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">رقم الهاتف</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-right focus:outline-none focus:ring-2 focus:ring-rose"
            placeholder="09xxxxxxxx"
            dir="ltr"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-rose text-white rounded-lg py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'جارِ الإرسال...' : 'إرسال رمز التحقق'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4 max-w-sm mr-auto">
      <p className="text-sm text-gray-600">تم إرسال رمز التحقق إلى {phone}</p>
      <div className="flex gap-2 justify-center" dir="ltr">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(i, e.target.value)}
            onKeyDown={(e) => handleCodeKeyDown(i, e)}
            className="w-11 h-12 text-center text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose"
          />
        ))}
      </div>
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-rose text-white rounded-lg py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? 'جارِ التحقق...' : 'تأكيد'}
      </button>
      <button
        type="button"
        onClick={() => setStep('phone')}
        className="w-full text-sm text-gray-500 hover:text-rose"
      >
        تغيير رقم الهاتف
      </button>
    </form>
  );
}