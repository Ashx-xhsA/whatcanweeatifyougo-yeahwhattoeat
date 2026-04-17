import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import recipesDataRaw from '../data/recipes.json';

// Local Components
import SpringPetals from '../components/SpringPetals';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import TagFilter from '../components/home/TagFilter';
import RecipeCard from '../components/home/RecipeCard';

// Tools & Context
import { extractAllTags } from '../utils/recipeHelpers';
import { useLanguage } from '../context/LanguageContext';

/**
 * Home Component
 * The main landing page featuring a recipe gallery, search, and category filters.
 * Now refactored to use modular sub-components and global state.
 */
function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { t } = useLanguage();
  
  // -- State & Refs --
  const [recipes, setRecipes] = useState(recipesDataRaw);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  // -- URL Sync for Search & Tags --
  // We derive the search term and active tags directly from the URL.
  // This ensures that using the "Back" button preserves the user's view.
  const searchTerm = searchParams.get('q') || '';
  const activeTags = useMemo(() => {
    const tagsStr = searchParams.get('tags');
    return tagsStr ? tagsStr.split(',').filter(t => t) : [];
  }, [searchParams]);

  // -- Metadata Extraction --
  // Extract all categories available in the dataset for the filter bar.
  const { allTags, tagZhMap } = useMemo(() => extractAllTags(recipesDataRaw), []);

  /**
   * Filters the recipe list based on search query and active tags.
   */
  const performSearch = (q, tags) => {
    let filtered = recipesDataRaw;
    
    if (q) {
      filtered = filtered.filter(r => 
        (r.name && r.name.toLowerCase().includes(q.toLowerCase())) ||
        (r.name_zh && r.name_zh.includes(q)) ||
        (r.ingredients && r.ingredients.some(ing => ing.toLowerCase().includes(q.toLowerCase()))) ||
        (r.ingredients_zh && r.ingredients_zh.some(ing => ing.includes(q)))
      );
    }
    
    if (tags.length > 0) {
      // Recipe must match ALL selected tags
      filtered = filtered.filter(r => r.categories && tags.every(nt => r.categories.includes(nt)));
    }
    
    setRecipes(filtered);
  };

  // Trigger search whenever search params change
  useEffect(() => {
    performSearch(searchTerm, activeTags);
  }, [searchTerm, activeTags]);

  /**
   * Updates the browser URL to reflect current search/filter state.
   */
  const updateURL = (newQ, newTags) => {
    const params = new URLSearchParams();
    if (newQ) params.set('q', newQ);
    if (newTags.length > 0) params.set('tags', newTags.join(','));
    setSearchParams(params, { replace: true });
  };

  const handleSearchChange = (val) => updateURL(val, activeTags);

  const toggleTag = (tag) => {
    const newTags = activeTags.includes(tag) 
      ? activeTags.filter(t => t !== tag)
      : [...activeTags, tag];
    updateURL(searchTerm, newTags);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  return (
    <>
      {/* Background Decor */}
      <SpringPetals />

      <div className="app-container" style={{ position: 'relative', zIndex: 10 }}>
        {/* Top Header & Controls */}
        <Header 
          isMusicPlaying={isMusicPlaying} 
          toggleMusic={toggleMusic} 
        />

        <audio ref={audioRef} loop src="/bgm.mp3" style={{ display: 'none' }} />

        {/* Search Input Area */}
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={(e) => e.preventDefault()}
        />
        
        {/* Category Filter Pills */}
        <TagFilter 
          allTags={allTags}
          tagZhMap={tagZhMap}
          activeTags={activeTags}
          onToggleTag={toggleTag}
        />

        {/* Main Gallery Grid */}
        <div className="recipe-grid">
          {recipes.map(recipe => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              location={location} 
            />
          ))}
          
          {/* Empty State */}
          {recipes.length === 0 && (
            <p style={{ textAlign: 'center', width: '100%', marginTop: '3rem', fontSize: '1.5rem' }}>
              {t("No recipes found matching your criteria.", "在这个农场没有找到匹配的食谱。")}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
