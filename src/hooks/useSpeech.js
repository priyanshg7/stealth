import { useState, useCallback } from 'react';

export function useSpeech(voiceGuideEnabled = true, defaultLanguage = 'en') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startListening = useCallback((onResultCallback, lang = defaultLanguage) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript;
      setTranscript(resultText);
      if (onResultCallback) onResultCallback(resultText);
    };

    recognition.onerror = (e) => {
      console.error('[useSpeech] Speech recognition error:', e);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [defaultLanguage]);

  const speakText = useCallback(async (text, langCode = defaultLanguage) => {
    if (!voiceGuideEnabled || !text) return;

    const localeMap = {
      en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN',
      te: 'te-IN', ta: 'ta-IN', gu: 'gu-IN',
      kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN'
    };

    setIsSpeaking(true);

    // Try Puter.js TTS first (free, high-quality AI voices)
    if (typeof window !== 'undefined' && window.puter?.ai?.txt2speech) {
      try {
        const audio = await window.puter.ai.txt2speech(text, langCode);
        if (audio) {
          audio.play();
          audio.onended = () => setIsSpeaking(false);
          return;
        }
      } catch (e) {
        console.warn("[useSpeech] Puter.js TTS unavailable, falling back to Web Speech API:", e);
      }
    }

    // Fallback: Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = localeMap[langCode] || 'en-IN';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  }, [voiceGuideEnabled, defaultLanguage]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    transcript,
    isSpeaking,
    startListening,
    speakText,
    stopSpeaking
  };
}
