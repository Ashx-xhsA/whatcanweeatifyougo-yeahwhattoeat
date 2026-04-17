import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Edit3, ArrowLeft } from 'lucide-react';
import recipesDataRaw from '../data/recipes.json';

// Sub-components
import RecipeContent from '../components/recipe/RecipeContent';
import RecipeEditor from '../components/recipe/RecipeEditor';
import AuthPrompt from '../components/recipe/AuthPrompt';

// Utils & Context
import { prepareRecipeForEdit, parseRecipeFromForm } from '../utils/recipeHelpers';
import { useLanguage } from '../context/LanguageContext';

/**
 * RecipeDetail Component
 * Responsible for displaying a single recipe's details and managing its edit state.
 * Supports both standalone page view and modal overlay view.
 * 
 * @param {boolean} isModal - If true, renders with an overlay and 'navigate back' behavior.
 */
function RecipeDetail({ isModal = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isChinese } = useLanguage();
  
  // -- Data State --
  const [recipe, setRecipe] = useState(null);
  const [recipes, setRecipes] = useState(recipesDataRaw);
  
  // -- Flow State (Viewing vs Auth vs Editing) --
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // -- Form State --
  const [editForm, setEditForm] = useState(null);
  const [adminPassword, setAdminPassword] = useState(sessionStorage.getItem('admin_password') || '');
  const [authError, setAuthError] = useState('');

  // Load recipe data whenever the ID changes
  useEffect(() => {
    const found = recipes.find(r => r.id === id);
    if (found) {
      setRecipe(found);
      // Reset interaction states when switching between recipes
      setIsEditMode(false);
      setShowAuthPrompt(false);
      setAuthError('');
      setEditForm(null);
    }
  }, [id, recipes]);

  // Handle case where ID doesn't match any recipe
  if (!recipe) {
    return (
      <div className="detail-body" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>{isChinese ? '未找到食谱' : 'Recipe Not Found'}</h2>
        <button className="search-btn" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
          {isChinese ? '返回主页' : 'Back to Home'}
        </button>
      </div>
    );
  }

  /**
   * Transition to Edit Mode. Requires password if not already verified.
   */
  const handleEnterEditMode = () => {
    if (!adminPassword) {
      setShowAuthPrompt(true);
      return;
    }
    setIsEditMode(true);
    // Convert array fields to strings for easy textarea editing
    setEditForm(prepareRecipeForEdit(recipe));
  };

  /**
   * Validates the admin password against the serverless backend.
   */
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
        // Remember approval for the rest of the session
        sessionStorage.setItem('admin_password', adminPassword);
        setShowAuthPrompt(false);
        handleEnterEditMode();
      } else {
        setAuthError(isChinese ? '密码错误' : 'Incorrect password');
      }
    } catch (err) {
      setAuthError(isChinese ? '验证失败' : 'Auth failed');
    }
  };

  /**
   * Saves the modified recipe data back to the database (via GitHub API).
   */
  const handleSaveRecipe = async () => {
    try {
      setIsSaving(true);
      // Revert strings back to arrays
      const updatedRecipe = parseRecipeFromForm(editForm);

      // Create the new full dataset
      const newAllRecipes = recipesDataRaw.map(r => 
        r.id === updatedRecipe.id ? updatedRecipe : r
      );

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
        alert(isChinese ? '保存成功！几分钟后全局生效。' : 'Saved! Changes will be live in a few minutes.');
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Closes the view. If in a modal, go back in history. 
   * If standalone, return to the main gallery.
   */
  const handleClose = () => {
    if (isModal) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  /**
   * The core UI content, shared between the Modal and Standalone view.
   */
  const renderContent = () => (
    <div 
      className={`detail-modal sv-box ${!isModal ? 'standalone' : ''}`} 
      onClick={e => e.stopPropagation()}
    >
      {/* Navigation Header */}
      <div className="modal-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem', 
        padding: isModal ? '0' : '1rem 2rem 0' 
      }}>
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
            <X size={28} strokeWidth={isModal ? 4 : 2} />
          </button>
        </div>
      </div>

      {/* Main Body Switcher */}
      {showAuthPrompt ? (
        <AuthPrompt 
          password={adminPassword} 
          setPassword={setAdminPassword} 
          onSubmit={handleAuthSubmit} 
          error={authError} 
        />
      ) : isEditMode ? (
        <RecipeEditor 
          editForm={editForm} 
          setEditForm={setEditForm} 
          onSave={handleSaveRecipe} 
          onCancel={() => setIsEditMode(false)}
          isSaving={isSaving}
        />
      ) : (
        <RecipeContent recipe={recipe} />
      )}
    </div>
  );

  // Wrap content based on the rendering mode
  if (isModal) {
    return (
      <div className="detail-overlay" onClick={handleClose}>
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="app-container standalone-recipe">
      {renderContent()}
    </div>
  );
}

export default RecipeDetail;
