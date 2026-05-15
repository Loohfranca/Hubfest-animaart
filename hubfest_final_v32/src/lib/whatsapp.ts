export function whatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const withDDI = digits.length >= 10 && !digits.startsWith("55") ? `55${digits}` : digits;
  return `https://wa.me/${withDDI}`;
}
