import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { X, Tag, Edit3, Save, RotateCcw, Lock, ArrowLeft } from 'lucide-react';
import recipesDataRaw from '../data/recipes.json';

function RecipeDetail({ isModal = false, isChineseGlobal = true }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [recipe, setRecipe] = useState(null);
  const [recipes, setRecipes] = useState(recipesDataRaw);
  const [isChinese, setIsChinese] = useState(isChineseGlobal);
  
  // Edit Mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [adminPassword, setAdminPassword] = useState(sessionStorage.getItem('admin_password') || '');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const found = recipes.find(r => r.id === id);
    if (found) {
      setRecipe(found);
      // Reset states when switching recipes
      setIsEditMode(false);
      setShowAuthPrompt(false);
      setAuthError('');
      setEditForm(null);
    }
  }, [id, recipes]);

  if (!recipe) {
    return (
      <div className="detail-body" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>未找到食谱 / Recipe Not Found</h2>
        <button className="search-btn" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>返回主页</button>
      </div>
    );
  }

  const t = (en, zh) => isChinese ? zh : en;

  const handleEnterEditMode = async () => {
    if (!adminPassword) {
      setShowAuthPrompt(true);
      return;
    }
    setIsEditMode(true);
    setEditForm({
      ...recipe,
      ingredients: (recipe.ingredients || []).join('\n'),
      ingredients_zh: (recipe.ingredients_zh || []).join('\n'),
      categories: (recipe.categories || []).join(', '),
      categories_zh: (recipe.categories_zh || []).join(', ')
    });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const resp = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      if (resp.ok) {
        sessionStorage.setItem('admin_password', adminPassword);
        setShowAuthPrompt(false);
        handleEnterEditMode();
      } else {
        setAuthError('密码错误');
      }
    } catch (err) {
      setAuthError('验证失败');
    }
  };

  const handleSaveRecipe = async () => {
    try {
      setIsSaving(true);
      const updatedRecipe = {
        ...editForm,
        ingredients: editForm.ingredients.split('\n').filter(line => line.trim()),
        ingredients_zh: editForm.ingredients_zh.split('\n').filter(line => line.trim()),
        categories: editForm.categories.split(',').map(c => c.trim()).filter(c => c),
        categories_zh: editForm.categories_zh.split(',').map(c => c.trim()).filter(c => c)
      };

      const newAllRecipes = recipesDataRaw.map(r => r.id === updatedRecipe.id ? updatedRecipe : r);

      const response = await fetch('/api/update-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          newRecipes: newAllRecipes
        })
      });

      if (response.ok) {
        setRecipes(newAllRecipes);
        setRecipe(updatedRecipe);
        setIsEditMode(false);
        alert('保存成功！改动已推送到 GitHub，几分钟后全局生效。');
      } else {
        const err = await response.json();
        alert(`保存失败: ${err.message}`);
      }
    } catch (err) {
      alert(`发生错误: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isModal) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const content = (
    <div className={`detail-modal sv-box ${!isModal ? 'standalone' : ''}`} onClick={e => e.stopPropagation()}>
      <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: isModal ? '0' : '1rem 2rem 0' }}>
        {!isModal && (
          <button className="search-btn" onClick={handleClose} style={{ padding: '0.5rem' }}>
            <ArrowLeft size={24} />
          </button>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          {!isEditMode && (
            <button className="search-btn" onClick={handleEnterEditMode} style={{ padding: '0.5rem' }} title="编辑此食谱">
              <Edit3 size={20} />
            </button>
          )}
          <button className="close-btn" onClick={handleClose}>
            {isModal ? <X size={28} strokeWidth={4} /> : <X size={28} />}
          </button>
        </div>
      </div>

      {showAuthPrompt ? (
        <div className="detail-body" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3><Lock size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> 需要管理员密码</h3>
          <form onSubmit={handleAuthSubmit} style={{ marginTop: '1rem' }}>
            <input 
              type="password" 
              className="search-input" 
              value={adminPassword} 
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="输入密码..."
              autoFocus
            />
            <button type="submit" className="search-btn" style={{ marginTop: '1rem', width: '100%' }}>确定</button>
            {authError && <p style={{ color: 'red', marginTop: '1rem' }}>{authError}</p>}
          </form>
        </div>
      ) : isEditMode ? (
        <div className="detail-body edit-form">
          <h2 style={{ marginBottom: '1.5rem' }}>编辑食谱</h2>
          <div className="form-group">
            <label>中文名 / Name (ZH)</label>
            <input value={editForm.name_zh} onChange={e => setEditForm({...editForm, name_zh: e.target.value})} />
          </div>
          <div className="form-group">
            <label>英文名 / Name (EN)</label>
            <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
          </div>
          <div className="form-group">
             <label>来源 / Author</label>
             <input value={editForm.author} onChange={e => setEditForm({...editForm, author: e.target.value})} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>难度 (ZH)</label>
              <input value={editForm.difficulty_zh} onChange={e => setEditForm({...editForm, difficulty_zh: e.target.value})} />
            </div>
            <div className="form-group">
              <label>份量 / Servings</label>
              <input value={editForm.servings} onChange={e => setEditForm({...editForm, servings: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>分类 (EN, 逗号隔开)</label>
            <input value={editForm.categories} onChange={e => setEditForm({...editForm, categories: e.target.value})} />
          </div>
          <div className="form-group">
            <label>配料清单 (ZH, 每行一个)</label>
            <textarea rows={6} value={editForm.ingredients_zh} onChange={e => setEditForm({...editForm, ingredients_zh: e.target.value})} />
          </div>
          <div className="form-group">
            <label>配料清单 (EN, 每行一个)</label>
            <textarea rows={4} value={editForm.ingredients} onChange={e => setEditForm({...editForm, ingredients: e.target.value})} />
          </div>
          <div className="form-group">
            <label>步骤 / Instructions (ZH)</label>
            <textarea rows={8} value={editForm.instructions_zh} onChange={e => setEditForm({...editForm, instructions_zh: e.target.value})} />
          </div>
          <div className="form-group">
            <label>步骤 / Instructions (EN)</label>
            <textarea rows={6} value={editForm.instructions} onChange={e => setEditForm({...editForm, instructions: e.target.value})} />
          </div>
          <div className="form-group">
            <label>备注 / Notes (ZH)</label>
            <textarea rows={3} value={editForm.notes_zh} onChange={e => setEditForm({...editForm, notes_zh: e.target.value})} />
          </div>

          <div className="edit-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
             <button className="search-btn" onClick={handleSaveRecipe} disabled={isSaving} style={{ flex: 1, background: 'var(--sv-energy)', color: 'white' }}>
               <Save size={20} style={{ marginRight: '8px' }} /> {isSaving ? '正在保存...' : '保存'}
             </button>
             <button className="search-btn" onClick={() => setIsEditMode(false)} style={{ flex: 1 }}>
               <RotateCcw size={20} style={{ marginRight: '8px' }} /> 取消
             </button>
          </div>
        </div>
      ) : (
        <>
          {recipe.images && recipe.images.length > 0 && (
            <div className="detail-hero">
              <img src={recipe.images[0]} alt={recipe.name} />
            </div>
          )}
          
          <div className="detail-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2>
                {isChinese && recipe.name_zh && <div>{recipe.name_zh}</div>}
                <div style={{fontSize: isChinese ? '0.6em' : '1em', color: isChinese ? 'var(--sv-wood-mid)' : 'inherit', marginTop: '4px'}}>{recipe.name}</div>
              </h2>
              <button onClick={() => setIsChinese(!isChinese)} className="search-btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                {isChinese ? 'ENG' : '中文'}
              </button>
            </div>
            
            <div style={{display: 'flex', gap: '1rem', color: 'var(--text-light)', marginBottom: '1rem', fontSize: '1.4rem'}}>
              <span>{t("Source: ", "来源：")}{recipe.author || t("Unknown", "未知村民")}</span> | 
              <span>{t("Yields: ", "份量：")}{recipe.servings || t("N/A", "未知")}</span>
            </div>
            
            <div className="tag-list" style={{marginBottom: '2rem'}}>
              {(recipe.categories || []).map((c, idx) => (
                <span key={c} className="tag">
                  <Tag size={12} style={{marginRight: '4px', verticalAlign: 'middle'}}/>
                  {isChinese && recipe.categories_zh && recipe.categories_zh[idx] ? recipe.categories_zh[idx] : c}
                </span>
              ))}
            </div>
            
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
            
            <Link 
              to="/admin" 
              style={{ display: 'block', marginTop: '3rem', textAlign: 'center', color: 'var(--sv-wood-mid)', opacity: 0.5, fontSize: '0.8rem', textDecoration: 'none' }}
            >
              高级：编辑完整 JSON
            </Link>
          </div>
        </>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="detail-overlay" onClick={handleClose}>
        {content}
      </div>
    );
  }

  return (
    <div className="app-container standalone-recipe">
      {content}
    </div>
  );
}

export default RecipeDetail;
