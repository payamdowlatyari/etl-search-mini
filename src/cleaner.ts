import { Provider } from "./types";

/**
 * Normalizes a phone number to a consistent format
 * @param phone - Raw phone number string
 * @returns Normalized phone number (xxx-xxx-xxxx)
 */
export function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // If we have 10 digits, format as xxx-xxx-xxxx
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // If we have 11 digits starting with 1, remove the 1 and format
  if (digits.length === 11 && digits.startsWith("1")) {
    const withoutCountryCode = digits.slice(1);
    return `${withoutCountryCode.slice(0, 3)}-${withoutCountryCode.slice(3, 6)}-${withoutCountryCode.slice(6)}`;
  }

  // Return original if can't normalize
  return phone;
}

/**
 * Normalizes an email address
 * @param email - Raw email string
 * @returns Normalized lowercase trimmed email
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Normalizes a name (proper case)
 * @param name - Raw name string
 * @returns Name in proper case
 */
export function normalizeName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Normalizes specialty field
 * @param specialty - Raw specialty string
 * @returns Normalized specialty
 */
export function normalizeSpecialty(specialty: string): string {
  return specialty
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Normalizes location field
 * @param location - Raw location string
 * @returns Normalized location
 */
export function normalizeLocation(location: string): string {
  return location.trim();
}

/**
 * Clamps a rating to valid range [0, 5]
 * @param rating - Raw rating
 * @returns Clamped rating
 */
export function normalizeRating(rating: number): number {
  return Math.min(5, Math.max(0, rating));
}

/**
 * Ensures years of experience is non-negative
 * @param years - Raw years
 * @returns Non-negative years
 */
export function normalizeYearsExperience(years: number): number {
  return Math.max(0, Math.floor(years));
}

/**
 * Cleans and normalizes a provider record
 * @param provider - Raw provider data
 * @returns Cleaned and normalized provider
 */
export function cleanProvider(provider: Provider): Provider {
  return {
    id: provider.id.trim(),
    name: normalizeName(provider.name),
    specialty: normalizeSpecialty(provider.specialty),
    location: normalizeLocation(provider.location),
    phone: normalizePhone(provider.phone),
    email: normalizeEmail(provider.email),
    rating: normalizeRating(provider.rating),
    yearsExperience: normalizeYearsExperience(provider.yearsExperience),
    acceptingPatients: provider.acceptingPatients,
  };
}

/**
 * Cleans and normalizes an array of providers
 * @param providers - Array of raw providers
 * @returns Array of cleaned providers
 */
export function cleanProviders(providers: Provider[]): Provider[] {
  return providers.map(cleanProvider);
}
