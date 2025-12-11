import categorySuggestionsData from "./category-suggestions.json";

/**
 * Get all category suggestions, optionally filtered by query
 */
export function getCategorySuggestions(query?: string): string[] {
  if (query) {
    const lowerQuery = query.toLowerCase();
    return categorySuggestionsData.filter((category) =>
      category.toLowerCase().includes(lowerQuery),
    );
  }
  return categorySuggestionsData;
}

/**
 * Get all available categories (for reference)
 */
export const ALL_CATEGORY_SUGGESTIONS =
  categorySuggestionsData as readonly string[];
