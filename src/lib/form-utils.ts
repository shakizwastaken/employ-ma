import * as ct from "countries-and-timezones";

/**
 * Get all countries from the library
 */
export function getAllCountries() {
  const allCountries = ct.getAllCountries();
  return Object.values(allCountries)
    .map((country) => ({
      id: country.id, // ISO 3166-1 alpha-2 code
      code: country.id, // Same as id for consistency
      name: country.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get default timezone for a country code
 */
export function getDefaultTimezoneForCountry(countryCode: string): string {
  const countryData = ct.getCountry(countryCode.toUpperCase());
  if (countryData?.timezones && countryData.timezones.length > 0) {
    return countryData.timezones[0] ?? "UTC";
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
  const countryData = ct.getCountry(countryCode.toUpperCase());
  if (!countryData?.timezones) {
    return [];
  }

  return countryData.timezones.map((tzName) => {
    // Calculate UTC offset using Intl API
    const now = new Date();
    const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(now.toLocaleString("en-US", { timeZone: tzName }));
    const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);

    // Format offset string
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const offsetStr = `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    return {
      timezone: tzName,
      utcOffset: offsetMinutes,
      utcOffsetStr: offsetStr,
    };
  });
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
