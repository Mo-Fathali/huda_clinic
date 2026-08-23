
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import ServiceCard from '@/components/landing/ServiceCard';
import Footer from '@/components/landing/Footer';



async function getProfile() {
  try {
   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getServices() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/services`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const profile = await getProfile();
  const services = await getServices();

  return (
    <>
      <Header profile={profile} />
      <main className="min-h-screen bg-white">
        <Hero profile={profile} />

        <section id="services" className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-right mb-8">الخدمات والأسعار</h2>
          {services.length === 0 ? (
            <p className="text-gray-500 text-right">لا توجد خدمات متاحة حالياً</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer profile={profile} />
    </>
  );
}