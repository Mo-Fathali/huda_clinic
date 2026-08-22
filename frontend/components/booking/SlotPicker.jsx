'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

function getNextDays(count) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

const WEEKDAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

export default function SlotPicker({ serviceId, selectedDate, selectedTime, onSelectDate, onSelectTime }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const days = getNextDays(14);

  useEffect(() => {
    if (!serviceId || !selectedDate) {
      setSlots([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get(`/api/availability/slots?date=${selectedDate}&serviceId=${serviceId}`)
      .then((data) => {
        if (!cancelled) setSlots(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, selectedDate]);

  return (
    <div>
      <h3 className="font-semibold text-ink mb-3">اختاري اليوم</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => {
          const key = formatDateKey(day);
          const isSelected = key === selectedDate;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                onSelectDate(key);
                onSelectTime(null);
              }}
              className={`shrink-0 flex flex-col items-center rounded-xl px-4 py-3 border transition ${
                isSelected
                  ? 'border-rose bg-rose text-white'
                  : 'border-gray-200 text-ink hover:border-rose/50'
              }`}
            >
              <span className="text-xs">{WEEKDAY_NAMES[day.getDay()]}</span>
              <span className="font-bold mt-1">{day.getDate()}</span>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-6">
          <h3 className="font-semibold text-ink mb-3">اختاري الوقت</h3>
          {loading && <p className="text-gray-500">جارِ تحميل الأوقات المتاحة...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && slots.length === 0 && (
            <p className="text-gray-500">لا توجد أوقات متاحة في هذا اليوم، جربي يوم آخر</p>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {slots.map((slot) => {
              const isSelected = slot.startTime === selectedTime;
              return (
                <button
                  key={slot.startTime}
                  type="button"
                  onClick={() => onSelectTime(slot.startTime)}
                  className={`rounded-lg py-2 text-sm border transition ${
                    isSelected
                      ? 'border-rose bg-rose text-white'
                      : 'border-gray-200 text-ink hover:border-rose/50'
                  }`}
                >
                  {slot.startTime}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}