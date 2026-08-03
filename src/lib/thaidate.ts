// ==========================================
// Thai Date Utilities
// ==========================================

/** แปลง ISO date → วันที่ พ.ศ. แบบ dd-mm-yy */
export function toThaiDateShort(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const buddhistYear = d.getFullYear() + 543;
  const shortYear = String(buddhistYear).slice(-2);
  return `${day}-${month}-${shortYear}`;
}

/** แปลง ISO date → วันที่ พ.ศ. แบบเต็ม */
export function toThaiDateFull(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
}

/** แปลง ISO date → ค่าสำหรับ input[type=date] */
export function toInputDate(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toISOString().split('T')[0];
}

/** แปลงจาก input[type=date] → ISO string */
export function fromInputDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString();
}

/** วันนี้เป็น ISO string */
export function todayISO(): string {
  return new Date().toISOString();
}

/** แปลง พ.ศ. เป็น ค.ศ. */
export function buddhistToGregorian(buddhistYear: number): number {
  return buddhistYear - 543;
}

/** แปลง ค.ศ. เป็น พ.ศ. */
export function gregorianToBuddhist(gregorianYear: number): number {
  return gregorianYear + 543;
}

/** Format time HH:mm */
export function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}
