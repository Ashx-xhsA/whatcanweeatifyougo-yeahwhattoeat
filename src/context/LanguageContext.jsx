import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * LanguageContext provides global language state (Chinese vs English)
 * and a translation helper function 't' to all component children.
 */
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Initialize language from localStorage, default to true (Chinese)
  const [isChinese, setIsChinese] = useState(() => {
    const saved = localStorage.getItem('isChinese');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Persist language choice when it changes
  useEffect(() => {
    localStorage.setItem('isChinese', JSON.stringify(isChinese));
  }, [isChinese]);

  /**
   * t - Translation utility
   * @param {string} en - English text
   * @param {string} zh - Chinese text
   * @returns {string} The text in current language
   */
  const t = (en, zh) => (isChinese ? zh : en);

  const toggleLanguage = () => setIsChinese(!isChinese);

  return (
    <LanguageContext.Provider value={{ isChinese, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Custom hook to use language features
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
