const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const NOTIFICATION_EMAIL = process.env.CLINIC_NOTIFICATION_EMAIL;

function formatDate(date) {
  return new Date(date).toLocaleDateString('ar', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

exports.sendNewBookingNotification = async (appointment) => {
  if (!process.env.RESEND_API_KEY || !NOTIFICATION_EMAIL) {
    console.log('[email] RESEND_API_KEY أو CLINIC_NOTIFICATION_EMAIL غير مضبوطين — تم تخطي الإشعار');
    return;
  }

  const { patient, service, date, startTime, endTime } = appointment;

  try {
    await resend.emails.send({
      from: 'Clinic Booking <onboarding@resend.dev>', // غيّرها لدومين موثّق عندك لاحقًا
      to: NOTIFICATION_EMAIL,
      subject: `حجز جديد — ${patient?.name || 'مريضة'} — ${formatDate(date)}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #FBF6EE; border-radius: 12px;">
          <h2 style="color: #3A2E26; margin-bottom: 16px;">حجز موعد جديد</h2>
          <table style="width: 100%; font-size: 14px; color: #3A2E26;">
            <tr><td style="padding: 6px 0; color: #8a7a6d;">المريضة</td><td style="padding: 6px 0; font-weight: bold;">${patient?.name || '—'}</td></tr>
            <tr><td style="padding: 6px 0; color: #8a7a6d;">الهاتف</td><td style="padding: 6px 0; font-weight: bold; direction: ltr; display: inline-block;">${patient?.phone || '—'}</td></tr>
            <tr><td style="padding: 6px 0; color: #8a7a6d;">الخدمة</td><td style="padding: 6px 0; font-weight: bold;">${service?.name || '—'}</td></tr>
            <tr><td style="padding: 6px 0; color: #8a7a6d;">التاريخ</td><td style="padding: 6px 0; font-weight: bold;">${formatDate(date)}</td></tr>
            <tr><td style="padding: 6px 0; color: #8a7a6d;">الوقت</td><td style="padding: 6px 0; font-weight: bold; direction: ltr; display: inline-block;">${startTime} - ${endTime}</td></tr>
          </table>
        </div>
      `,
    });
  } catch (error) {
    // فشل إرسال الإيميل ميوقفش عملية الحجز نفسها — بس نسجل الخطأ
    console.error('[email] فشل إرسال إشعار الحجز:', error.message);
  }
};
exports.sendCancellationNotification = async (appointment) => {
  if (!process.env.RESEND_API_KEY || !NOTIFICATION_EMAIL) {
    console.log('[email] RESEND_API_KEY أو CLINIC_NOTIFICATION_EMAIL غير مضبوطين — تم تخطي الإشعار');
    return;
  }

  const { patient, service, date, startTime, endTime } = appointment;

  try {
    await resend.emails.send({
      from: 'Clinic Booking <onboarding@resend.dev>',
      to: NOTIFICATION_EMAIL,
      subject: `إلغاء حجز — ${patient?.name || 'مريضة'} — ${formatDate(date)}`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #FBF6EE; border-radius: 12px; border-right: 4px solid #C62828;">
          <h2 style="color: #C62828; margin-bottom: 16px;">تم إلغاء موعد</h2>
          <table style="width: 100%; font-size: 14px; color: #3A2E26;">
            <tr><td style="padding: 6px 0; color: #8a7a6d;">المريضة</td><td style="padding: 6px 0; font-weight: bold;">${patient?.name || '—'}</td></tr>
            <tr><td style="padding: 6px 0; color: #8a7a6d;">الهاتف</td><td style="padding: 6px 0; font-weight: bold; direction: ltr; display: inline-block;">${patient?.phone || '—'}</td></tr>
            <tr><td style="padding: 6px 0; color: #8a7a6d;">الخدمة</td><td style="padding: 6px 0; font-weight: bold;">${service?.name || '—'}</td></tr>
            <tr><td style="padding: 6px 0; color: #8a7a6d;">كان الموعد</td><td style="padding: 6px 0; font-weight: bold;">${formatDate(date)} — <span style="direction: ltr; display: inline-block;">${startTime} - ${endTime}</span></td></tr>
          </table>
          <p style="color: #8a7a6d; font-size: 12px; margin-top: 16px;">تم الإلغاء من قِبل المريضة عبر الموقع</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('[email] فشل إرسال إشعار الإلغاء:', error.message);
  }
};