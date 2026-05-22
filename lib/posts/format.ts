const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatShortDate(d: Date | null): string {
  if (!d) return "Draft";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatFullDate(d: Date | null): string {
  if (!d) return "Draft";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
