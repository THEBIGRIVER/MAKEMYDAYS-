export const DEFAULT_COUNTRY_CODE = '91';

/**
 * Normalize a phone number for use with wa.me links.
 * - strips non-digits
 * - removes leading zeros
 * - if result is 10 digits, prefixes the default country code
 */
export function formatForWhatsApp(phone?: string, defaultCountry = DEFAULT_COUNTRY_CODE): string {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  // remove any leading zeros (users sometimes include trunk 0)
  while (cleaned.length > 0 && cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  // if still 10 digits, assume local national number and prefix country code
  if (cleaned.length === 10) cleaned = defaultCountry + cleaned;
  return cleaned;
}
