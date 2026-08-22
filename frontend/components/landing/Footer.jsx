export default function Footer({ profile }) {
  return (
    <footer id="footer" className="bg-ink text-white mt-16">
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-right">
        <div>
          <h3 className="font-semibold mb-3">{profile?.name || 'العيادة'}</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {profile?.title || ''}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">تواصل معنا</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {profile?.phone && (
              <li>
                <a href={`tel:${profile.phone}`} className="hover:text-rose transition" dir="ltr">
                  {profile.phone}
                </a>
              </li>
            )}
            {profile?.whatsapp && (
              <li>
                <a
                  href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-rose transition"
                >
                  واتساب
                </a>
              </li>
            )}
            {profile?.email && (
              <li>
                <a href={`mailto:${profile.email}`} className="hover:text-rose transition" dir="ltr">
                  {profile.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">العنوان</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {profile?.address || 'غير محدد بعد'}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} {profile?.name || 'العيادة'} — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}