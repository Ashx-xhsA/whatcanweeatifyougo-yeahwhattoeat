import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Globe, Music, VolumeX, Settings } from 'lucide-react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import recipesDataRaw from '../data/recipes.json';
import SpringPetals from '../components/SpringPetals';

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  const searchTerm = searchParams.get('q') || '';
  const activeTags = useMemo(() => {
    const tagsStr = searchParams.get('tags');
    return tagsStr ? tagsStr.split(',').filter(t => t) : [];
  }, [searchParams]);

  const [recipes, setRecipes] = useState(recipesDataRaw);
  const [isChinese, setIsChinese] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  // Extract all unique categories (EN) and keep a map to ZH
  const { allTags, tagZhMap } = useMemo(() => {
    const tags = new Set();
    const map = {};
    recipesDataRaw.forEach(r => {
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
  }, []);

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
      filtered = filtered.filter(r => r.categories && tags.every(nt => r.categories.includes(nt)));
    }
    
    setRecipes(filtered);
  };

  useEffect(() => {
    performSearch(searchTerm, activeTags);
  }, [searchTerm, activeTags]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is reactive to URL, so we already handle it in useEffect
  };

  const updateURL = (newQ, newTags) => {
    const params = new URLSearchParams();
    if (newQ) params.set('q', newQ);
    if (newTags.length > 0) params.set('tags', newTags.join(','));
    setSearchParams(params, { replace: true });
  };

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

  const t = (en, zh) => isChinese ? zh : en;

  return (
    <>
    <SpringPetals />
    <div className="app-container" style={{position:'relative', zIndex:10}}>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '-2.5rem', position: 'relative', zIndex: 10, gap: '1rem'}}>
        <Link 
          to="/admin" 
          className="search-btn" 
          style={{padding: '0.5rem', fontSize: '1.2rem'}}
          title={t("Admin Settings", "管理员设置")}
        >
          <Settings size={24} opacity={0.5} />
        </Link>
        <button 
          onClick={toggleMusic}
          className="search-btn"
          style={{padding: '0.5rem', fontSize: '1.2rem'}}
          title={t("Toggle Background Music", "开关背景音乐")}
        >
          {isMusicPlaying ? <Music size={24} /> : <VolumeX size={24} opacity={0.5} />}
        </button>
        <button 
          onClick={() => setIsChinese(!isChinese)}
          className="search-btn"
          style={{padding: '0.5rem 1rem', fontSize: '1.2rem', gap: '0.5rem'}}
        >
          <Globe size={20} />
          {isChinese ? 'ENG' : '中文'}
        </button>
      </div>

      <audio ref={audioRef} loop src="/bgm.mp3" style={{display: 'none'}} />

      <header>
        <h1>是啊，吃啥</h1>
        
        <form onSubmit={handleSearchSubmit} className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder={t("Search...", "搜索食谱、配料，按下回车确认...")}
            value={searchTerm}
            onChange={(e) => updateURL(e.target.value, activeTags)}
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
      </header>
      
      <div style={{ marginBottom: '2rem' }} className="tag-list">
        {allTags.map(tag => (
          <button 
            key={tag} 
            onClick={() => toggleTag(tag)}
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

      <div className="recipe-grid">
        {recipes.map(recipe => (
          <Link 
            key={recipe.id} 
            to={`/recipe/${recipe.id}`} 
            state={{ backgroundLocation: location }}
            className="recipe-card sv-box" 
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div className="recipe-image-container">
              {recipe.images && recipe.images.length > 0 ? (
                <img src={recipe.images[0]} alt={recipe.name} loading="lazy" />
              ) : (
                <div style={{background: 'var(--sv-wood-mid)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'}}>No Image</div>
              )}
            </div>
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
              <div className="tag-list">
                {(recipe.categories || []).slice(0, 3).map((c, idx) => (
                  <span key={c} className="tag">{isChinese && recipe.categories_zh && recipe.categories_zh[idx] ? recipe.categories_zh[idx] : c}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
        {recipes.length === 0 && <p>{t("No recipes found matching your criteria.", "在这个农场没有找到匹配的食谱。")}</p>}
      </div>
    </div>
    </>
  );
}

export default Home;
