import Link from 'next/link';

export default function Hero({ profile }) {
  return (
    <section id="about" className="max-w-5xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-10">
      <div className="flex-1 text-right">
        {profile ? (
          <>
            <h1 className="text-3xl md:text-4xl font-bold font-english">{profile.name}</h1>
            <p className="mt-2 text-lg text-gray-600">{profile.title}</p>
            <p className="mt-4 text-gray-700 leading-relaxed">{profile.bio}</p>
          </>
        ) : (
          <p className="text-gray-500">بيانات الدكتورة لم تُضف بعد من لوحة التحكم</p>
        )}
        <Link
          href="/booking"
          className="inline-block mt-6 bg-rose text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
        >
          احجزي موعدك الآن
        </Link>
      </div>
      <div className="flex-1">
        {profile?.imageUrl ? (
          <img
            src={profile.imageUrl}
            alt={profile.name}
            className="w-full h-80 object-cover rounded-2xl"
          />
        ) : (
          <div className="w-full h-80 bg-soft rounded-2xl" />
        )}
      </div>
    </section>
  );
}