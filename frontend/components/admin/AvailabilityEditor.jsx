'use client';

import { useState } from 'react';

const WEEKDAYS = [
  { value: 0, label: 'الأحد' },
  { value: 1, label: 'الاثنين' },
  { value: 2, label: 'الثلاثاء' },
  { value: 3, label: 'الأربعاء' },
  { value: 4, label: 'الخميس' },
  { value: 5, label: 'الجمعة' },
  { value: 6, label: 'السبت' },
];

export default function AvailabilityEditor({ schedule, onSave }) {
  const [saving, setSaving] = useState(null);

  function getDay(dayOfWeek) {
    return schedule.find((s) => s.dayOfWeek === dayOfWeek);
  }

  async function handleChange(dayOfWeek, field, value) {
    const current = getDay(dayOfWeek) || { startTime: '09:00', endTime: '17:00', isActive: true };
    setSaving(dayOfWeek);
    try {
      await onSave({ ...current, dayOfWeek, [field]: value });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-3">
      {WEEKDAYS.map(({ value, label }) => {
        const day = getDay(value);
        const isActive = day?.isActive ?? false;
        return (
          <div
            key={value}
            className="flex items-center gap-4 border border-gray-200 rounded-lg px-4 py-3"
          >
            <label className="flex items-center gap-2 w-28 shrink-0">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => handleChange(value, 'isActive', e.target.checked)}
              />
              <span className="font-medium text-ink">{label}</span>
            </label>

            {isActive ? (
              <div className="flex items-center gap-2 text-sm" dir="ltr">
                <input
                  type="time"
                  value={day?.startTime || '09:00'}
                  onChange={(e) => handleChange(value, 'startTime', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                />
                <span>إلى</span>
                <input
                  type="time"
                  value={day?.endTime || '17:00'}
                  onChange={(e) => handleChange(value, 'endTime', e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                />
              </div>
            ) : (
              <span className="text-gray-400 text-sm">يوم مقفول</span>
            )}

            {saving === value && <span className="text-xs text-gray-400">جارِ الحفظ...</span>}
          </div>
        );
      })}
    </div>
  );
}