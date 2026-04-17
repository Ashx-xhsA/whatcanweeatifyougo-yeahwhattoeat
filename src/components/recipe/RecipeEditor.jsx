import React from 'react';
import { Save, RotateCcw } from 'lucide-react';

/**
 * RecipeEditor Component
 * Provides a form interface for modifying recipe data.
 * 
 * @param {Object} editForm - Current form state
 * @param {Function} setEditForm - State setter for form
 * @param {Function} onSave - Callback to save changes
 * @param {Function} onCancel - Callback to exit edit mode
 * @param {boolean} isSaving - Loading state for save button
 */
function RecipeEditor({ editForm, setEditForm, onSave, onCancel, isSaving }) {
  const handleChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="detail-body edit-form">
      <h2 style={{ marginBottom: '1.5rem' }}>编辑食谱</h2>
      
      {/* Name Fields */}
      <div className="form-group">
        <label>中文名 / Name (ZH)</label>
        <input value={editForm.name_zh} onChange={e => handleChange('name_zh', e.target.value)} />
      </div>
      <div className="form-group">
        <label>英文名 / Name (EN)</label>
        <input value={editForm.name} onChange={e => handleChange('name', e.target.value)} />
      </div>

      {/* Author & Meta */}
      <div className="form-group">
         <label>来源 / Author</label>
         <input value={editForm.author} onChange={e => handleChange('author', e.target.value)} />
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label>难度 (ZH)</label>
          <input value={editForm.difficulty_zh} onChange={e => handleChange('difficulty_zh', e.target.value)} />
        </div>
        <div className="form-group">
          <label>份量 / Servings</label>
          <input value={editForm.servings} onChange={e => handleChange('servings', e.target.value)} />
        </div>
      </div>

      {/* Categories */}
      <div className="form-group">
        <label>分类 (EN, 逗号隔开)</label>
        <input value={editForm.categories} onChange={e => handleChange('categories', e.target.value)} />
      </div>

      {/* Ingredients Textareas */}
      <div className="form-group">
        <label>配料清单 (ZH, 每行一个)</label>
        <textarea rows={6} value={editForm.ingredients_zh} onChange={e => handleChange('ingredients_zh', e.target.value)} />
      </div>
      <div className="form-group">
        <label>配料清单 (EN, 每行一个)</label>
        <textarea rows={4} value={editForm.ingredients} onChange={e => handleChange('ingredients', e.target.value)} />
      </div>

      {/* Instructions Textareas */}
      <div className="form-group">
        <label>步骤 / Instructions (ZH)</label>
        <textarea rows={8} value={editForm.instructions_zh} onChange={e => handleChange('instructions_zh', e.target.value)} />
      </div>
      <div className="form-group">
        <label>步骤 / Instructions (EN)</label>
        <textarea rows={6} value={editForm.instructions} onChange={e => handleChange('instructions', e.target.value)} />
      </div>

      {/* Notes */}
      <div className="form-group">
        <label>备注 / Notes (ZH)</label>
        <textarea rows={3} value={editForm.notes_zh} onChange={e => handleChange('notes_zh', e.target.value)} />
      </div>

      {/* Action Buttons */}
      <div className="edit-actions" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
         <button 
           className="search-btn" 
           onClick={onSave} 
           disabled={isSaving} 
           style={{ flex: 1, background: 'var(--sv-energy)', color: 'white' }}
         >
           <Save size={20} style={{ marginRight: '8px' }} /> 
           {isSaving ? '正在保存...' : '保存'}
         </button>
         <button 
           className="search-btn" 
           onClick={onCancel} 
           style={{ flex: 1 }}
         >
           <RotateCcw size={20} style={{ marginRight: '8px' }} /> 
           取消
         </button>
      </div>
    </div>
  );
}

export default RecipeEditor;
