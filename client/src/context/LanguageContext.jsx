import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { speakText, stopSpeech } from '../utils/speech';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('scrapsathi_lang') || 'hi'; // Default Hindi
  });

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem('scrapsathi_lang', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en?.[key] || key;
  };

  const narrate = (text) => {
    if (!voiceEnabled) return;
    setIsSpeaking(true);
    speakText(text, language);
    // Simple reset after reasonable timeout
    setTimeout(() => setIsSpeaking(false), 5000);
  };

  const stopAudio = () => {
    stopSpeech();
    setIsSpeaking(false);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        narrate,
        stopAudio,
        voiceEnabled,
        setVoiceEnabled,
        isSpeaking
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
