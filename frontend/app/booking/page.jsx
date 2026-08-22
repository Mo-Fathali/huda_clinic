'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, withAuth } from '@/lib/api';
import { savePatientSession } from '@/lib/auth';
import ServiceSelector from '@/components/booking/ServiceSelector';
import SlotPicker from '@/components/booking/SlotPicker';
import OtpInput from '@/components/booking/OtpInput';

const STEPS = ['الخدمة', 'الموعد', 'التأكيد'];

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    api
      .get('/api/services')
      .then((data) => {
        setServices(data);
        const preselectId = searchParams.get('service');
        if (preselectId) {
          const preselected = data.find((s) => s.id === preselectId);
          if (preselected) setSelectedService(preselected);
        }
      })
      .catch(() => setServices([]));
  }, [searchParams]);

  async function handleOtpVerified(result) {
    savePatientSession(result.token, result.patient);
    setSubmitting(true);
    setSubmitError(null);
    try {
      const appointment = await api.post(
        '/api/appointments',
        { serviceId: selectedService.id, date: selectedDate, startTime: selectedTime },
        withAuth(result.token)
      );
      setConfirmedAppointment(appointment);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedAppointment) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-rose/10 text-rose flex items-center justify-center mx-auto mb-4 text-2xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-ink">تم تأكيد حجزك</h1>
          <p className="text-gray-600 mt-2">
            {confirmedAppointment.service.name} — {confirmedAppointment.startTime}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {new Date(confirmedAppointment.date).toLocaleDateString('ar')}
          </p>
          <button
            type="button"
            onClick={() => router.push('/my-appointments')}
            className="mt-6 inline-block bg-rose text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            عرض مواعيدي
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  i <= step ? 'bg-rose text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i + 1}
              </div>
              <span className={i <= step ? 'text-ink' : 'text-gray-400'}>{label}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold text-ink mb-6 text-right">اختاري الخدمة</h2>
            <ServiceSelector
              services={services}
              selectedId={selectedService?.id}
              onSelect={(service) => {
                setSelectedService(service);
                setStep(1);
              }}
            />
          </div>
        )}

        {step === 1 && selectedService && (
          <div>
            <button type="button" onClick={() => setStep(0)} className="text-sm text-gray-500 hover:text-rose mb-4">
              ← رجوع لاختيار الخدمة
            </button>
            <h2 className="text-xl font-bold text-ink mb-6 text-right">اختاري الموعد</h2>
            <SlotPicker
              serviceId={selectedService.id}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSelectDate={setSelectedDate}
              onSelectTime={setSelectedTime}
            />
            <button
              type="button"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(2)}
              className="w-full mt-8 bg-rose text-white rounded-lg py-3 font-semibold hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              متابعة
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-rose mb-4">
              ← رجوع لاختيار الموعد
            </button>
            <h2 className="text-xl font-bold text-ink mb-6 text-right">تأكيد الحجز</h2>
            <div className="bg-soft rounded-xl p-4 mb-6 text-right text-sm text-gray-700">
              <p>{selectedService.name} — {selectedService.duration} دقيقة</p>
              <p className="mt-1">{selectedDate} — {selectedTime}</p>
            </div>
            <OtpInput onVerified={handleOtpVerified} />
            {submitting && <p className="text-gray-500 mt-4 text-center">جارِ تأكيد الحجز...</p>}
            {submitError && <p className="text-red-600 mt-4 text-center">{submitError}</p>}
          </div>
        )}
      </div>
    </main>
  );
}