import { DEFAULT_LOCALE, LOCALES, type Locale } from '../i18n/locales';

const longDate = (locale: Locale) =>
  new Intl.DateTimeFormat(LOCALES[locale].dateLocale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const formatDate = (d: Date, locale: Locale = DEFAULT_LOCALE): string => longDate(locale).format(d);
export const isoDate = (d: Date): string => d.toISOString().slice(0, 10);
