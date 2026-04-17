import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Loader2, Cpu, X, Tag } from 'lucide-react';
import recipesData from './data/recipes.json';
import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js for local/browser usage
env.allowLocalModels = false; 

function App() {
  const [recipes, setRecipes] = useState(recipesData);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  
  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const extractorRef = useRef(null);
  const recipeEmbeddingsRef = useRef(null);

  // Extract all unique categories
  const allTags = useMemo(() => {
    const tags = new Set();
    recipesData.forEach(r => r.categories.forEach(c => tags.add(c)));
    return Array.from(tags).sort();
  }, []);

  // Initialize transformers.js on demand
  const initAI = async () => {
    if (aiReady || isAiLoading) return;
    setIsAiLoading(true);
    try {
      // Feature extraction pipeline
      extractorRef.current = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      setAiReady(true);
    } catch (e) {
      console.error("AI Init failed", e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    // If AI is ready and term is a natural language query (more than 3 words)
    if (aiReady && searchTerm.trim().split(' ').length > 2) {
      setIsAiLoading(true);
      try {
        // Embed the query
        const queryOut = await extractorRef.current(searchTerm, { pooling: 'mean', normalize: true });
        const queryEmbedding = queryOut.data;
        
        // Compute caching for recipes
        if (!recipeEmbeddingsRef.current) {
          const docs = recipesData.map(r => `${r.name}. ${r.ingredients.join(', ')}. ${r.categories.join(', ')}`);
          const docOut = await extractorRef.current(docs, { pooling: 'mean', normalize: true });
          recipeEmbeddingsRef.current = docOut.tolist();
        }
        
        // Cosine similarity
        const similarities = recipesData.map((r, i) => {
          let docEmb = recipeEmbeddingsRef.current[i];
          let sim = 0;
          for(let k=0; k<queryEmbedding.length; k++) {
             sim += queryEmbedding[k] * docEmb[k];
          }
          return { recipe: r, score: sim };
        });
        
        // Sort by similarity
        similarities.sort((a,b) => b.score - a.score);
        setRecipes(similarities.slice(0, 15).map(s => s.recipe));
        
      } catch (e) {
        console.error(e);
      } finally {
        setIsAiLoading(false);
      }
    } else {
      // Basic fallback filtering
      const filtered = recipesData.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setRecipes(filtered);
    }
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
        filtered = filtered.filter(r => newTags.every(nt => r.categories.includes(nt)));
      }
      if (searchTerm) {
        filtered = filtered.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setRecipes(filtered);
    }
  };

  // Reset search
  useEffect(() => {
    if (searchTerm === '' && activeTags.length === 0) setRecipes(recipesData);
  }, [searchTerm, activeTags]);

  return (
    <div className="app-container">
      <header>
        <h1>Smart Recipe Vault</h1>
        <p style={{color: 'var(--text-light)', marginBottom: '1rem'}}>
          Your personal culinary collection, powered by local privacy-first AI.
        </p>
        
        <form onSubmit={handleSearch} className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by name, ingredient, or ask a question like 'I want something spicy with chicken'..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            type="button"
            onClick={initAI}
            title="Enable AI Semantic Search"
            style={{
               background: aiReady ? 'var(--accent-color)' : 'var(--border-color)',
               color: aiReady ? 'white' : 'var(--text-dark)',
               border: 'none',
               padding: '1rem',
               borderRadius: '50%',
               cursor: 'pointer',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               transition: 'all 0.3s'
            }}
          >
            {isAiLoading ? <Loader2 className="animate-spin" /> : <Cpu />}
          </button>
        </form>
        {isAiLoading && <p style={{fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--accent-color)'}}>Loading Local AI Model (first time takes ~10 seconds)...</p>}
      </header>
      
      <div style={{ marginBottom: '2rem' }} className="tag-list">
        {allTags.map(tag => (
          <button 
            key={tag} 
            onClick={() => toggleTag(tag)}
            className="tag"
            style={{ 
              border: 'none', 
              cursor: 'pointer',
              background: activeTags.includes(tag) ? 'var(--accent-color)' : 'rgba(107, 114, 128, 0.1)',
              color: activeTags.includes(tag) ? '#fff' : 'inherit'
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="recipe-grid">
        {recipes.map(recipe => (
          <div key={recipe.id} className="recipe-card glass" onClick={() => setSelectedRecipe(recipe)}>
            <div className="recipe-image-container">
              {recipe.images && recipe.images.length > 0 ? (
                <img src={recipe.images[0]} alt={recipe.name} loading="lazy" />
              ) : (
                <div style={{background: '#eee', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa'}}>No Image</div>
              )}
            </div>
            <div className="recipe-content">
              <h3 className="recipe-title">{recipe.name}</h3>
              <div className="recipe-meta">
                <span>{recipe.difficulty || 'Easy'}</span>
                <span>•</span>
                <span>{recipe.servings ? recipe.servings + ' servings' : ''}</span>
              </div>
              <div className="tag-list">
                {recipe.categories.slice(0, 3).map(c => (
                  <span key={c} className="tag">{c}</span>
                ))}
                {recipe.categories.length > 3 && <span className="tag">+{recipe.categories.length - 3}</span>}
              </div>
            </div>
          </div>
        ))}
        {recipes.length === 0 && <p>No recipes found matching your criteria.</p>}
      </div>
      
      {/* Detail View Modal */}
      {selectedRecipe && (
        <div className="detail-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="detail-modal glass" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedRecipe(null)}><X /></button>
            
            {selectedRecipe.images && selectedRecipe.images.length > 0 && (
              <div className="detail-hero">
                <img src={selectedRecipe.images[0]} alt={selectedRecipe.name} />
              </div>
            )}
            
            <div className="detail-body">
              <h2>{selectedRecipe.name}</h2>
              <div style={{display: 'flex', gap: '1rem', color: 'var(--text-light)', marginBottom: '1rem'}}>
                <span>Source: {selectedRecipe.author || 'Unknown'}</span> | 
                <span>Yields: {selectedRecipe.servings || 'N/A'}</span>
              </div>
              
              <div className="tag-list" style={{marginBottom: '2rem'}}>
                {selectedRecipe.categories.map(c => <span key={c} className="tag"><Tag size={12} style={{marginRight: '4px', verticalAlign: 'middle'}}/>{c}</span>)}
              </div>
              
              <h3 className="section-title">Ingredients</h3>
              <ul className="ingredients-list">
                {selectedRecipe.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
              
              <h3 className="section-title">Instructions</h3>
              <div className="instructions-text">
                {selectedRecipe.instructions || 'No instructions provided.'}
              </div>
              
              {selectedRecipe.notes && (
                <>
                  <h3 className="section-title">Notes</h3>
                  <div className="instructions-text" style={{fontStyle: 'italic', color: 'var(--text-light)'}}>
                    {selectedRecipe.notes}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
