import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

/**
 * RecipeCard Component
 * Displays a summary of a recipe in the main grid gallery.
 * Clicking the card navigates to the detail URL.
 */
function RecipeCard({ recipe, location }) {
  const { isChinese } = useLanguage();

  return (
    <Link 
      to={`/recipe/${recipe.id}`} 
      state={{ backgroundLocation: location }}
      className="recipe-card sv-box" 
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      {/* Recipe Portrait Image */}
      <div className="recipe-image-container">
        {recipe.images && recipe.images.length > 0 ? (
          <img src={recipe.images[0]} alt={recipe.name} loading="lazy" />
        ) : (
          <div style={{
            background: 'var(--sv-wood-mid)', 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff'
          }}>No Image</div>
        )}
      </div>

      {/* Card Content Info */}
      <div className="recipe-content">
        <h3 className="recipe-title">
          {isChinese && recipe.name_zh ? <div style={{marginBottom: '4px'}}>{recipe.name_zh}</div> : null}
          <div style={{fontSize: isChinese ? '0.7em' : '1em', opacity: isChinese ? 0.7 : 1}}>{recipe.name}</div>
        </h3>
        
        <div className="recipe-meta">
          <span>{isChinese && recipe.difficulty_zh ? recipe.difficulty_zh : (recipe.difficulty || 'Easy')}</span>
          <span>•</span>
          <span>{recipe.servings ? recipe.servings + (isChinese ? ' 份' : ' servings') : ''}</span>
        </div>

        {/* Small Tag Preview */}
        <div className="tag-list">
          {(recipe.categories || []).slice(0, 3).map((c, idx) => (
            <span key={c} className="tag">
              {isChinese && recipe.categories_zh && recipe.categories_zh[idx] ? recipe.categories_zh[idx] : c}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;
