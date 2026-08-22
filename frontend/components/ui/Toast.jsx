'use client';

export default function Toast({ message, type = 'error', onClose }) {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 px-4 pointer-events-none">
      <div
        className={`animate-toast-in pointer-events-auto flex items-center gap-3 max-w-sm w-full sm:w-auto px-5 py-3 rounded-xl shadow-lg border text-sm ${
          isError ? 'bg-white border-red-200 text-red-700' : 'bg-ink border-ink text-white'
        }`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${isError ? 'bg-red-500' : 'bg-rose'}`} />
        <p className="flex-1">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-lg leading-none opacity-50 hover:opacity-100 transition"
          aria-label="إغلاق"
        >
          ×
        </button>
      </div>
    </div>
  );
}