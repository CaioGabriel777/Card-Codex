/**
 * Generates a URL-safe slug from a card name.
 * Handles accented characters, special symbols, and whitespace.
 *
 * @param name - The card name to slugify
 * @returns A lowercase, hyphen-separated slug
 *
 * @example
 * slugify('Blue-Eyes White Dragon') // 'blue-eyes-white-dragon'
 * slugify('Dark Magician Girl')     // 'dark-magician-girl'
 */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')    // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '');        // trim leading/trailing hyphens
}
