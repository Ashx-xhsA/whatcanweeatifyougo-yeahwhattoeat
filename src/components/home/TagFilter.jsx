import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * TagFilter Component
 * Renders a cloud of category buttons that can be toggled on/off.
 * 
 * @param {Array} allTags - List of all category names in English
 * @param {Object} tagZhMap - Mapping from English category to Chinese
 * @param {Array} activeTags - Currently selected categories
 * @param {Function} onToggleTag - Callback when a tag is clicked
 */
function TagFilter({ allTags, tagZhMap, activeTags, onToggleTag }) {
  const { isChinese } = useLanguage();

  return (
    <div style={{ marginBottom: '2rem' }} className="tag-list">
      {allTags.map(tag => (
        <button 
          key={tag} 
          onClick={() => onToggleTag(tag)}
          className="tag"
          style={{ 
            cursor: 'pointer',
            background: activeTags.includes(tag) ? 'var(--sv-wood-dark)' : 'var(--sv-wood-light)',
            color: 'var(--sv-white)',
            borderBottom: activeTags.includes(tag) ? '2px solid transparent' : '2px solid var(--sv-wood-dark)'
          }}
        >
          {isChinese && tagZhMap[tag] ? tagZhMap[tag] : tag}
        </button>
      ))}
    </div>
  );
}

export default TagFilter;
