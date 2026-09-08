// Web Speech API wrapper for Scrap Sathi
// Supports Text-To-Speech (TTS) and Speech-To-Text (STT) in Hindi, Marathi, and English

let currentUtterance = null;

export const speakText = (text, language = 'hi') => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance;

  // Language mapping
  if (language === 'hi') {
    utterance.lang = 'hi-IN';
    utterance.pitch = 1.0;
    utterance.rate = 0.95; // Slightly slower for clear comprehension by informal workers
  } else if (language === 'mr') {
    utterance.lang = 'mr-IN';
    utterance.pitch = 1.0;
    utterance.rate = 0.95;
  } else {
    utterance.lang = 'en-IN';
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
  }

  // Try to find a matched voice if available
  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find(v => v.lang.startsWith(utterance.lang.slice(0, 2)));
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

// Speech-to-Text Voice Recognizer
export const startVoiceRecognition = ({ language = 'hi', onResult, onError, onEnd }) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (onError) onError('Speech recognition not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  recognition.start();
  return recognition;
};
