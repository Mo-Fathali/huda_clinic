'use client';

export default function ServiceSelector({ services, selectedId, onSelect }) {
  if (!services || services.length === 0) {
    return <p className="text-gray-500 text-center py-10">لا توجد خدمات متاحة حالياً</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {services.map((service) => {
        const isSelected = service.id === selectedId;
        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service)}
            className={`text-right border rounded-xl p-5 transition ${
              isSelected
                ? 'border-rose bg-rose/5 ring-2 ring-rose'
                : 'border-gray-200 hover:border-rose/50'
            }`}
          >
            <h3 className="font-semibold text-ink">{service.name}</h3>
            {service.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-500">{service.duration} دقيقة</span>
              <span className="font-bold text-rose">{service.price} د.ل</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}