import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Save, ChevronLeft, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import recipesData from '../data/recipes.json';

function Admin() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recipesJson, setRecipesJson] = useState(JSON.stringify(recipesData, null, 2));
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) {
      setMessage('请输入密码');
      return;
    }

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setIsLoggedIn(true);
        setMessage('');
        sessionStorage.setItem('admin_password', password); // Store for current session
      } else {
        setMessage('密码错误，请重试');
      }
    } catch (err) {
      setMessage(`验证出错: ${err.message}`);
    }
  };

  const handleSave = async () => {
    try {
      const parsed = JSON.parse(recipesJson);
      setIsSaving(true);
      setMessage('正在推给 GitHub...');
      
      const response = await fetch('/api/update-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password,
          newRecipes: parsed
        })
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('修改成功！Vercel 会在 1-2 分钟内自动重写部署，请稍后刷新首页。');
      } else {
        setMessage(`错误: ${result.message || '保存失败'}`);
      }
    } catch (err) {
      setMessage(`JSON 格式错误: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sv-box" style={{ padding: '2rem', maxWidth: '400px', width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--sv-wood-dark)' }}>
            <Lock size={24} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
            管理员验证
          </h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="search-input" 
                placeholder="请输入管理员密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', paddingRight: '3rem' }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sv-wood-mid)' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button type="submit" className="search-btn" style={{ width: '100%', padding: '1rem' }}>
              开门！
            </button>
            {message && <p style={{ color: 'red', textAlign: 'center', marginTop: '1rem' }}>{message}</p>}
          </form>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--sv-wood-mid)', textDecoration: 'none' }}>← 返回主页</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
        <Link to="/" className="search-btn" style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', gap: '0.5rem' }}>
          <ChevronLeft size={20} /> 返回
        </Link>
        <h2 style={{ color: 'var(--sv-white)' }}>菜谱原始数据编辑器 (JSON)</h2>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="search-btn" 
          style={{ padding: '0.5rem 1rem', background: 'var(--sv-energy)', color: 'white' }}
        >
          <Save size={20} style={{ marginRight: '8px' }} />
          {isSaving ? '正在保存...' : '保存更改'}
        </button>
      </header>

      {message && (
        <div className="sv-box" style={{ margin: '1rem 0', padding: '1rem', background: message.includes('错误') ? '#fee' : '#efe' }}>
          <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>{message}</p>
        </div>
      )}

      <div className="sv-box" style={{ padding: '1rem', height: 'calc(100vh - 250px)' }}>
        <textarea
          style={{
            width: '100%',
            height: '100%',
            background: '#1a1a1a',
            color: '#00ff00',
            fontFamily: 'monospace',
            fontSize: '1rem',
            padding: '1rem',
            border: 'none',
            outline: 'none',
            resize: 'none'
          }}
          value={recipesJson}
          onChange={(e) => setRecipesJson(e.target.value)}
          spellCheck="false"
        />
      </div>
      
      <p style={{ marginTop: '1rem', opacity: 0.7, textAlign: 'center' }}>
        注意：修改 JSON 格式如果不正确会导致整个页面白屏，请谨慎操作。建议先在本地预览。
      </p>
    </div>
  );
}

export default Admin;
