// @ts-expect-error - country-timezones doesn't have type definitions
import { getTimeZonesForCountry } from "country-timezones";

/**
 * Get default timezone for a country code
 */
export function getDefaultTimezoneForCountry(countryCode: string): string {
  const timezones = getTimeZonesForCountry(countryCode);
  if (timezones.length > 0) {
    // Return the first timezone (usually the primary one)
    return timezones[0]?.timezone ?? "UTC";
  }
  return "UTC";
}

/**
 * Get all timezones for a country code
 */
export function getTimezonesForCountry(countryCode: string): Array<{
  timezone: string;
  utcOffset: number;
  utcOffsetStr: string;
}> {
  return getTimeZonesForCountry(countryCode);
}

/**
 * Format phone number for international format
 * Basic validation - accepts +, digits, spaces, dashes, parentheses
 */
export function validatePhoneNumber(phone: string): boolean {
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  // Must start with + and have digits, or just have digits
  return /^\+?[1-9]\d{1,14}$/.test(cleaned);
}

/**
 * Get country code from country name (simple mapping for common countries)
 * This is a helper for timezone mapping - assumes country table has a code field
 */
export function getCountryCodeFromName(countryName: string): string {
  // This is a fallback - ideally country code should come from DB
  const countryMap: Record<string, string> = {
    Morocco: "MA",
    "United States": "US",
    "United Kingdom": "GB",
    Canada: "CA",
    France: "FR",
    Germany: "DE",
    Spain: "ES",
    Italy: "IT",
    // Add more as needed
  };

  return countryMap[countryName] ?? "US";
}
