import Link from 'next/link';

export default function ServiceCard({ service }) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 text-right hover:shadow-md transition">
      <h3 className="text-lg font-semibold text-ink">{service.name}</h3>
      {service.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
      )}
      <p className="text-sm text-gray-500 mt-1">{service.duration} دقيقة</p>
      <p className="mt-3 text-rose font-bold text-xl">{service.price} د.ل</p>
      <Link
        href={`/booking?service=${service.id}`}
        className="block mt-4 text-sm text-rose hover:underline"
      >
        احجزي هذي الخدمة ←
      </Link>
    </div>
  );
}