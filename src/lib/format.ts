const longDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const formatDate = (d: Date): string => longDate.format(d);
export const isoDate = (d: Date): string => d.toISOString().slice(0, 10);
export const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
