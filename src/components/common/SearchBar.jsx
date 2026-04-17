import React from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * SearchBar Component
 * A stylized input field for searching recipes and ingredients.
 */
function SearchBar({ searchTerm, onSearchChange, onSearchSubmit }) {
  const { t } = useLanguage();

  return (
    <form onSubmit={onSearchSubmit} className="search-container">
      <input 
        type="text" 
        className="search-input" 
        placeholder={t("Search...", "搜索食草、配料，按下回车确认...")}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <button 
        type="submit"
        title={t("Search", "搜索")}
        className="search-btn"
        style={{
           background: 'var(--sv-wood-light)',
           color: 'var(--sv-wood-dark)',
        }}
      >
        <Search size={28} style={{marginRight: '8px'}} />
        {t("Search", "搜索")}
      </button>
    </form>
  );
}

export default SearchBar;
