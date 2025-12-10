import tagSuggestionsData from "./tag-suggestions.json";

/**
 * Get all tag suggestions, optionally filtered by query
 */
export function getTagSuggestions(query?: string): string[] {
  if (query) {
    const lowerQuery = query.toLowerCase();
    return tagSuggestionsData.filter((tag) =>
      tag.toLowerCase().includes(lowerQuery),
    );
  }
  return tagSuggestionsData;
}

/**
 * Get all available tags (for reference)
 */
export const ALL_TAG_SUGGESTIONS = tagSuggestionsData as readonly string[];
