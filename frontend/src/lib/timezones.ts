export const timezones = (() => {
  try {
    const zones = (Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf('timeZone');
    // Browsers list only regional zones, but UTC is the server default and a valid choice.
    return zones.includes('UTC') ? zones : ['UTC', ...zones];
  } catch {
    return ['UTC', 'Africa/Kigali', 'Africa/Nairobi', 'Africa/Lagos', 'Europe/London', 'Europe/Paris', 'America/New_York'];
  }
})();
/** The zone list, always containing `current` — a select can't show a value it has no option for and would silently fall back to the first zone. */
export const zoneOptions = (current?: string | null) => (current && !timezones.includes(current) ? [current, ...timezones] : timezones);
export const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
