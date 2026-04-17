import React from 'react';
import { Music, VolumeX, Globe, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Header Component
 * Contains the sky-blue skybg title and global controls (Music, Language).
 * Note: Admin link has been removed per user request.
 */
function Header({ isMusicPlaying, toggleMusic, title = "是啊，吃啥" }) {
  const { isChinese, toggleLanguage, t } = useLanguage();

  return (
    <div style={{ position: 'relative', zIndex: 10 }}>
      {/* Global Controls Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '-2.5rem', 
        position: 'relative', 
        zIndex: 10, 
        gap: '1rem' 
      }}>
        <button 
          onClick={toggleMusic}
          className="search-btn"
          style={{ padding: '0.5rem', fontSize: '1.2rem' }}
          title={t("Toggle Background Music", "开关背景音乐")}
        >
          {isMusicPlaying ? <Music size={24} /> : <VolumeX size={24} opacity={0.5} />}
        </button>
        <button 
          onClick={toggleLanguage}
          className="search-btn"
          style={{ padding: '0.5rem 1rem', fontSize: '1.2rem', gap: '0.5rem' }}
        >
          <Globe size={20} />
          {isChinese ? 'ENG' : '中文'}
        </button>
      </div>

      {/* Main Title Banner */}
      <header>
        <h1>{title}</h1>
      </header>
    </div>
  );
}

export default Header;
