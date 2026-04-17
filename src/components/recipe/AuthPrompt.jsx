import React from 'react';
import { Lock } from 'lucide-react';

/**
 * AuthPrompt Component
 * Modal-like content for password verification before entering edit mode.
 */
function AuthPrompt({ password, setPassword, onSubmit, error }) {
  return (
    <div className="detail-body" style={{ textAlign: 'center', padding: '3rem' }}>
      <h3>
        <Lock size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> 
        需要管理员密码 / Admin Access Required
      </h3>
      <form onSubmit={onSubmit} style={{ marginTop: '1rem' }}>
        <input 
          type="password" 
          className="search-input" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          placeholder="输入密码 / Enter password..."
          autoFocus
        />
        <button 
          type="submit" 
          className="search-btn" 
          style={{ marginTop: '1rem', width: '100%' }}
        >
          确定 / Submit
        </button>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </form>
    </div>
  );
}

export default AuthPrompt;
