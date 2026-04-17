import React from 'react';
import { Tag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * RecipeContent Component
 * Purely responsible for displaying the recipe details (read-only mode).
 */
function RecipeContent({ recipe }) {
  const { isChinese, t } = useLanguage();

  return (
    <>
      {/* Hero Image */}
      {recipe.images && recipe.images.length > 0 && (
        <div className="detail-hero">
          <img src={recipe.images[0]} alt={recipe.name} />
        </div>
      )}
      
      <div className="detail-body">
        {/* Title Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2>
            {isChinese && recipe.name_zh && <div>{recipe.name_zh}</div>}
            <div style={{
              fontSize: isChinese ? '0.6em' : '1em', 
              color: isChinese ? 'var(--sv-wood-mid)' : 'inherit', 
              marginTop: '4px'
            }}>{recipe.name}</div>
          </h2>
        </div>
        
        {/* Meta Info */}
        <div style={{display: 'flex', gap: '1rem', color: 'var(--text-light)', marginBottom: '1rem', fontSize: '1.4rem'}}>
          <span>{t("Source: ", "来源：")}{recipe.author || t("Unknown", "未知村民")}</span> | 
          <span>{t("Yields: ", "份量：")}{recipe.servings || t("N/A", "未知")}</span>
        </div>
        
        {/* Full Tag List */}
        <div className="tag-list" style={{marginBottom: '2rem'}}>
          {(recipe.categories || []).map((c, idx) => (
            <span key={c} className="tag">
              <Tag size={12} style={{marginRight: '4px', verticalAlign: 'middle'}}/>
              {isChinese && recipe.categories_zh && recipe.categories_zh[idx] ? recipe.categories_zh[idx] : c}
            </span>
          ))}
        </div>
        
        {/* Ingredients Section */}
        <h3 className="section-title">{t("Ingredients", "需要的配料")}</h3>
        <ul className="ingredients-list">
          {(recipe.ingredients || []).map((ing, idx) => (
            <li key={idx} style={{marginBottom: '12px', alignItems: 'flex-start'}}>
              <div>
                {isChinese && recipe.ingredients_zh && recipe.ingredients_zh[idx] && (
                  <div style={{fontWeight: 'bold'}}>{recipe.ingredients_zh[idx]}</div>
                )}
                <div style={{opacity: isChinese ? 0.7 : 1, fontSize: isChinese ? '0.8em' : '1em', marginTop: '2px'}}>{ing}</div>
              </div>
            </li>
          ))}
        </ul>
        
        {/* Instructions Section */}
        <h3 className="section-title">{t("Instructions", "烹饪步骤")}</h3>
        <div className="instructions-text">
          {isChinese && recipe.instructions_zh ? (
            <>
              <div style={{marginBottom: '1rem'}}>{recipe.instructions_zh}</div>
              <div style={{opacity: 0.6, fontSize: '0.8em', borderTop: '2px dashed var(--sv-wood-mid)', paddingTop: '1rem'}}>{recipe.instructions || ''}</div>
            </>
          ) : (
            <div>{recipe.instructions || 'No instructions provided.'}</div>
          )}
        </div>
        
        {/* Notes Section */}
        {recipe.notes && (
          <>
            <h3 className="section-title">{t("Notes", "农夫寄语")}</h3>
            <div className="instructions-text" style={{fontStyle: 'italic', color: 'var(--text-light)'}}>
              {isChinese && recipe.notes_zh ? (
                 <>
                   <div style={{marginBottom: '0.5rem'}}>{recipe.notes_zh}</div>
                   <div style={{opacity: 0.6, fontSize: '0.8em'}}>{recipe.notes}</div>
                 </>
              ) : (
                 <div>{recipe.notes}</div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default RecipeContent;
