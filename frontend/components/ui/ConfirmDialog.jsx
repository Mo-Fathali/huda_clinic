'use client';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'تأكيد', cancelLabel = 'إلغاء', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-xl shadow-lg border border-gray-100 max-w-sm w-full p-6 animate-toast-in" dir="rtl">
        {title && <h2 className="text-base font-bold text-ink mb-2">{title}</h2>}
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-soft text-ink hover:bg-gray-100 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg font-medium text-sm bg-red-50 text-red-700 hover:bg-red-100 transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
