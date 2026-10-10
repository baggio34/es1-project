// thx gemini
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Split accented characters into base letters and accents
    .replace(/[\u0300-\u036f]/g, '') // Remove the diacritical marks
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing whitespace
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove all non-word characters
    .replace(/--+/g, '-'); // Replace multiple hyphens with a single hyphen
}
