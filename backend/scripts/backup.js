const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');
const prisma = require('../src/config/db');

const resend = new Resend(process.env.RESEND_API_KEY);
const BACKUP_EMAIL = process.env.BACKUP_EMAIL || process.env.CLINIC_NOTIFICATION_EMAIL;

async function exportAllData() {
  const [
    doctorProfile, services, patients, appointments,
    notificationLogs, availability, blockedSlots,
    medicalRecords, adminUsers,
  ] = await Promise.all([
    prisma.doctorProfile.findMany(),
    prisma.service.findMany(),
    prisma.patient.findMany(),
    prisma.appointment.findMany(),
    prisma.notificationLog.findMany(),
    prisma.availability.findMany(),
    prisma.blockedSlot.findMany(),
    prisma.medicalRecord.findMany(),
    
  ]);

  return {
    exportedAt: new Date().toISOString(),
    doctorProfile, services, patients, appointments,
    notificationLogs, availability, blockedSlots,
    medicalRecords, adminUsers,
  };
}

async function main() {
  console.log('جارِ تجميع النسخة الاحتياطية...');
  const data = await exportAllData();

  const dateStamp = new Date().toISOString().split('T')[0];
  const fileName = `backup-${dateStamp}.json`;
  const localDir = path.join(__dirname, '..', 'backups');
  const localPath = path.join(localDir, fileName);

  if (!fs.existsSync(localDir)) fs.mkdirSync(localDir);
  fs.writeFileSync(localPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`تم حفظ نسخة محلية: ${localPath}`);

  if (!process.env.RESEND_API_KEY || !BACKUP_EMAIL) {
    console.log('تخطي الإرسال بالإيميل — RESEND_API_KEY أو BACKUP_EMAIL غير مضبوطين');
    return;
  }

  const fileBuffer = fs.readFileSync(localPath);
  await resend.emails.send({
    from: 'Clinic Backup <onboarding@resend.dev>',
    to: BACKUP_EMAIL,
    subject: `نسخة احتياطية — ${dateStamp}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <p>نسخة احتياطية تلقائية لبيانات العيادة بتاريخ ${dateStamp}.</p>
        <p style="color: #C62828; font-size: 13px;">⚠️ هذا الملف يحتوي بيانات حساسة (سجلات مرضية، بيانات دخول) — لا تُعيدي توجيه هذا الإيميل لأي شخص.</p>
      </div>
    `,
    attachments: [
      { filename: fileName, content: fileBuffer.toString('base64') },
    ],
  });

  console.log(`تم إرسال النسخة الاحتياطية إلى ${BACKUP_EMAIL}`);
}

main()
  .catch((err) => {
    console.error('فشل النسخ الاحتياطي:', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
