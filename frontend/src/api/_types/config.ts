export type Locale = { type: 'Auto' } | { type: 'Fixed', value: string };

export type GlobalConfig = {
  locale: Locale;
}
