/**
 * recipeHelpers.js
 * Contains utility functions for parsing and formatting recipe data
 * to make it human-readable for editing and JSON-safe for storage.
 */

/**
 * Prepares recipe data for the edit form by converting arrays to multiline strings
 * @param {Object} recipe - The raw recipe object from JSON
 * @returns {Object} A flat object suitable for form values
 */
export const prepareRecipeForEdit = (recipe) => {
  return {
    ...recipe,
    ingredients: (recipe.ingredients || []).join('\n'),
    ingredients_zh: (recipe.ingredients_zh || []).join('\n'),
    categories: (recipe.categories || []).join(', '),
    categories_zh: (recipe.categories_zh || []).join(', ')
  };
};

/**
 * Reverts form data back into a clean recipe object for JSON storage
 * @param {Object} formData - The raw state from the edit form
 * @returns {Object} A clean object with parsed arrays
 */
export const parseRecipeFromForm = (formData) => {
  return {
    ...formData,
    ingredients: formData.ingredients.split('\n').filter(line => line.trim()),
    ingredients_zh: formData.ingredients_zh.split('\n').filter(line => line.trim()),
    categories: formData.categories.split(',').map(c => c.trim()).filter(c => c),
    categories_zh: formData.categories_zh.split(',').map(c => c.trim()).filter(c => c)
  };
};

/**
 * Extracts unique categories and their translations from all recipes
 * @param {Array} recipes - Array of all recipe objects
 * @returns {Object} { allTags: string[], tagZhMap: Object }
 */
export const extractAllTags = (recipes) => {
  const tags = new Set();
  const map = {};
  recipes.forEach(r => {
    if (r.categories) {
      r.categories.forEach((c, i) => {
        tags.add(c);
        if (r.categories_zh && r.categories_zh[i]) {
          map[c] = r.categories_zh[i];
        }
      });
    }
  });
  return { allTags: Array.from(tags).sort(), tagZhMap: map };
};
