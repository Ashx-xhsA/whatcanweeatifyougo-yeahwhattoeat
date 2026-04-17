import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Tag, Globe, Music, VolumeX, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import recipesData from '../data/recipes.json';
import SpringPetals from '../components/SpringPetals';

function Home() {
  const [recipes, setRecipes] = useState(recipesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isChinese, setIsChinese] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef(null);

  // Extract all unique categories (EN) and keep a map to ZH
  const { allTags, tagZhMap } = useMemo(() => {
    const tags = new Set();
    const map = {};
    recipesData.forEach(r => {
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setRecipes(recipesData);
      return;
    }
    
    const filtered = recipesData.filter(r => 
      (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.name_zh && r.name_zh.includes(searchTerm)) ||
      (r.ingredients && r.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (r.ingredients_zh && r.ingredients_zh.some(ing => ing.includes(searchTerm)))
    );
    setRecipes(filtered);
  };

  const toggleTag = (tag) => {
    const newTags = activeTags.includes(tag) 
      ? activeTags.filter(t => t !== tag)
      : [...activeTags, tag];
      
    setActiveTags(newTags);
    
    if (newTags.length === 0 && !searchTerm) {
      setRecipes(recipesData);
    } else {
      let filtered = recipesData;
      if (newTags.length > 0) {
        filtered = filtered.filter(r => r.categories && newTags.every(nt => r.categories.includes(nt)));
      }
      if (searchTerm) {
        filtered = filtered.filter(r => 
          (r.name && r.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.name_zh && r.name_zh.includes(searchTerm))
        );
      }
      setRecipes(filtered);
    }
  };

  useEffect(() => {
    if (searchTerm === '' && activeTags.length === 0) setRecipes(recipesData);
  }, [searchTerm, activeTags]);

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
        
        <form onSubmit={handleSearch} className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder={t("Search...", "搜索食谱、配料，按下回车确认...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          <div key={recipe.id} className="recipe-card sv-box" onClick={() => setSelectedRecipe(recipe)}>
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
          </div>
        ))}
        {recipes.length === 0 && <p>{t("No recipes found matching your criteria.", "在这个农场没有找到匹配的食谱。")}</p>}
      </div>
      
      {/* Detail View Modal */}
      {selectedRecipe && (
        <div className="detail-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="detail-modal sv-box" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedRecipe(null)}>
              <X size={28} strokeWidth={4} />
            </button>

            <Link 
              to="/admin" 
              style={{ position: 'absolute', bottom: '1rem', right: '1rem', color: 'var(--sv-wood-mid)', opacity: 0.5, fontSize: '0.8rem', textDecoration: 'none' }}
            >
              编辑 JSON
            </Link>
            
            {selectedRecipe.images && selectedRecipe.images.length > 0 && (
              <div className="detail-hero">
                <img src={selectedRecipe.images[0]} alt={selectedRecipe.name} />
              </div>
            )}
            
            <div className="detail-body">
              <h2>
                {isChinese && selectedRecipe.name_zh && <div>{selectedRecipe.name_zh}</div>}
                <div style={{fontSize: isChinese ? '0.6em' : '1em', color: isChinese ? 'var(--sv-wood-mid)' : 'inherit', marginTop: '4px'}}>{selectedRecipe.name}</div>
              </h2>
              
              <div style={{display: 'flex', gap: '1rem', color: 'var(--text-light)', marginBottom: '1rem', fontSize: '1.4rem'}}>
                <span>{t("Source: ", "来源：")}{selectedRecipe.author || t("Unknown", "未知村民")}</span> | 
                <span>{t("Yields: ", "份量：")}{selectedRecipe.servings || t("N/A", "未知")}</span>
              </div>
              
              <div className="tag-list" style={{marginBottom: '2rem'}}>
                {(selectedRecipe.categories || []).map((c, idx) => (
                  <span key={c} className="tag">
                    <Tag size={12} style={{marginRight: '4px', verticalAlign: 'middle'}}/>
                    {isChinese && selectedRecipe.categories_zh && selectedRecipe.categories_zh[idx] ? selectedRecipe.categories_zh[idx] : c}
                  </span>
                ))}
              </div>
              
              <h3 className="section-title">{t("Ingredients", "需要的配料")}</h3>
              <ul className="ingredients-list">
                {(selectedRecipe.ingredients || []).map((ing, idx) => (
                  <li key={idx} style={{marginBottom: '12px', alignItems: 'flex-start'}}>
                    <div>
                      {isChinese && selectedRecipe.ingredients_zh && selectedRecipe.ingredients_zh[idx] && (
                        <div style={{fontWeight: 'bold'}}>{selectedRecipe.ingredients_zh[idx]}</div>
                      )}
                      <div style={{opacity: isChinese ? 0.7 : 1, fontSize: isChinese ? '0.8em' : '1em', marginTop: '2px'}}>{ing}</div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <h3 className="section-title">{t("Instructions", "烹饪步骤")}</h3>
              <div className="instructions-text">
                {isChinese && selectedRecipe.instructions_zh ? (
                  <>
                    <div style={{marginBottom: '1rem'}}>{selectedRecipe.instructions_zh}</div>
                    <div style={{opacity: 0.6, fontSize: '0.8em', borderTop: '2px dashed var(--sv-wood-mid)', paddingTop: '1rem'}}>{selectedRecipe.instructions || ''}</div>
                  </>
                ) : (
                  <div>{selectedRecipe.instructions || 'No instructions provided.'}</div>
                )}
              </div>
              
              {selectedRecipe.notes && (
                <>
                  <h3 className="section-title">{t("Notes", "农夫寄语")}</h3>
                  <div className="instructions-text" style={{fontStyle: 'italic', color: 'var(--text-light)'}}>
                    {isChinese && selectedRecipe.notes_zh ? (
                       <>
                         <div style={{marginBottom: '0.5rem'}}>{selectedRecipe.notes_zh}</div>
                         <div style={{opacity: 0.6, fontSize: '0.8em'}}>{selectedRecipe.notes}</div>
                       </>
                    ) : (
                       <div>{selectedRecipe.notes}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default Home;
