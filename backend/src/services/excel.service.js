const ExcelJS = require('exceljs');

const COLUMNS = [
  { header: 'الاسم', key: 'name', width: 20 },
  { header: 'الهاتف', key: 'phone', width: 16 },
  { header: 'فصيلة الدم', key: 'bloodType', width: 12 },
  { header: 'الحساسية', key: 'allergies', width: 22 },
  { header: 'الأمراض المزمنة', key: 'chronicConditions', width: 22 },
  { header: 'الأدوية الحالية', key: 'currentMedications', width: 22 },
  { header: 'نوع البشرة', key: 'skinType', width: 14 },
  { header: 'ملخص التاريخ المرضي', key: 'historySummary', width: 30 },
  { header: 'ملخص الإجراءات', key: 'proceduresSummary', width: 30 },
  { header: 'ملاحظات', key: 'notes', width: 26 },
  { header: 'محظورة', key: 'isBlacklisted', width: 10 },
];

exports.exportPatientsToExcel = async (patients) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('سجلات الحالات', {
    views: [{ rightToLeft: true }],
  });

  sheet.columns = COLUMNS;

  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3A2E26' } };
    cell.alignment = { horizontal: 'right', vertical: 'middle' };
  });
  sheet.getRow(1).height = 22;

  patients.forEach((p) => {
    const record = p.medicalRecord || {};
    const row = sheet.addRow({
      name: p.name || '',
      phone: p.phone || '',
      bloodType: record.bloodType || '',
      allergies: record.allergies || '',
      chronicConditions: record.chronicConditions || '',
      currentMedications: record.currentMedications || '',
      skinType: record.skinType || '',
      historySummary: record.historySummary || '',
      proceduresSummary: record.proceduresSummary || '',
      notes: record.notes || '',
      isBlacklisted: p.isBlacklisted ? 'نعم' : 'لا',
    });
    row.alignment = { horizontal: 'right', vertical: 'top', wrapText: true };
  });

  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      };
    });
  });

  return workbook.xlsx.writeBuffer();
};

// يرجع مصفوفة من الصفوف بعد قراءتها كـ objects بنفس أسماء الأعمدة
exports.parsePatientsExcel = async (fileBuffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('الملف لا يحتوي على أي ورقة بيانات');

  const headerRow = sheet.getRow(1).values; // index 0 فاضي دايمًا في exceljs
  const keyByColumn = {};
  COLUMNS.forEach((col) => {
    const colIndex = headerRow.findIndex((h) => h === col.header);
    if (colIndex !== -1) keyByColumn[colIndex] = col.key;
  });

  if (!Object.values(keyByColumn).includes('phone')) {
    throw new Error('عمود "الهاتف" مطلوب في الملف ولم يتم العثور عليه');
  }

  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // تخطي رأس الجدول
    const obj = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = keyByColumn[colNumber];
      if (key) obj[key] = cell.value ? String(cell.value).trim() : '';
    });
    if (obj.phone) rows.push(obj);
  });

  return rows;
};