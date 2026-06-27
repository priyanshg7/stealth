import React, { useState, useEffect } from 'react';
import { 
  Check, Volume2, Mic, MapPin, Plus, Trash2, Edit3, ArrowLeft, ArrowRight,
  Info, Cpu, Shield, Sparkles, PlusCircle, HelpCircle, Layers, Droplet,
  Smartphone, Wifi, Users, Truck, Compass, Sun, Wind, CloudRain, Calendar,
  Activity, CheckCircle2, ChevronRight, RefreshCw, Upload, AlertCircle
} from 'lucide-react';
import DashboardShell from './components/DashboardShell';

// Firebase SDK Imports & Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';

const firebaseConfig = {
  projectId: "kisanmitra-bpa7t",
  appId: "1:919454579680:web:0e30b2d80764f293108985",
  storageBucket: "kisanmitra-bpa7t.firebasestorage.app",
  apiKey: "AIzaSyDfn0vSHZA6gYN-MBS5XE_ahZRVnz4x91k",
  authDomain: "kisanmitra-bpa7t.firebaseapp.com",
  messagingSenderId: "919454579680",
  projectNumber: "919454579680"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Static Data
const LANGUAGES = [
  { id: 'hi', name: 'Hindi', native: 'हिन्दी', letter: 'अ' },
  { id: 'en', name: 'English', native: 'English', letter: 'A' },
  { id: 'mr', name: 'Marathi', native: 'मराठी', letter: 'म' },
  { id: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', letter: 'ਪੰ' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు', letter: 'తె' },
  { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', letter: 'ಕ' }
];

const CROPS = [
  { id: 'wheat', name: 'Wheat', native: 'गेहूं', icon: '🌾' },
  { id: 'rice', name: 'Rice', native: 'धान', icon: '🌱' },
  { id: 'maize', name: 'Maize', native: 'मक्का', icon: '🌽' },
  { id: 'cotton', name: 'Cotton', native: 'कपास', icon: '☁️' },
  { id: 'soybean', name: 'Soybean', native: 'सोयाबीन', icon: '🫘' },
  { id: 'sugarcane', name: 'Sugarcane', native: 'गन्ना', icon: '🎋' },
  { id: 'tomato', name: 'Tomato', native: 'टमाटर', icon: '🍅' },
  { id: 'chilli', name: 'Chilli', native: 'मिर्च', icon: '🌶️' }
];

const WATER_SOURCES = [
  { id: 'canal', name: 'Canal Irrigation', icon: '🌊' },
  { id: 'borewell', name: 'Borewell / Tubewell', icon: '🎛️' },
  { id: 'openwell', name: 'Open Well', icon: '🕳️' },
  { id: 'river', name: 'River', icon: '🏞️' },
  { id: 'pond', name: 'Pond', icon: '💧' },
  { id: 'farmpond', name: 'Farm Pond', icon: '⛲' },
  { id: 'rain', name: 'Rain-fed Only', icon: '🌧️' },
  { id: 'checkdam', name: 'Check Dam', icon: '🧱' },
  { id: 'tank', name: 'Community Water Tank', icon: '🛢️' },
  { id: 'lake', name: 'Lake / Reservoir', icon: '🏞️' },
  { id: 'lift', name: 'Lift Irrigation', icon: '⚡' },
  { id: 'municipal', name: 'Municipal Water Supply', icon: '🚰' }
];

const IRRIGATION_METHODS = [
  { id: 'flood', name: 'Flood Irrigation', icon: '🌊' },
  { id: 'furrow', name: 'Furrow Irrigation', icon: '🚜' },
  { id: 'basin', name: 'Basin Irrigation', icon: '⭕' },
  { id: 'border', name: 'Border Irrigation', icon: '📊' },
  { id: 'drip', name: 'Drip Irrigation', icon: '💧' },
  { id: 'minidrip', name: 'Mini Drip', icon: '🍼' },
  { id: 'sprinkler', name: 'Sprinkler', icon: '🚿' },
  { id: 'microsprinkler', name: 'Micro Sprinkler', icon: '💦' },
  { id: 'raingun', name: 'Rain Gun', icon: '🔫' },
  { id: 'manual', name: 'Manual Watering', icon: '🪣' },
  { id: 'hose', name: 'Hose Pipe', icon: '🐍' },
  { id: 'awd', name: 'Alternate Wetting & Drying', icon: '⏱️' },
  { id: 'pivot', name: 'Center Pivot', icon: '🎡' },
  { id: 'subsurface', name: 'Subsurface Drip', icon: '⬇️' }
];

const MACHINERY_ITEMS = [
  { id: 'tractor', name: 'Tractor', icon: '🚜' },
  { id: 'tiller', name: 'Power Tiller', icon: '⚙️' },
  { id: 'cultivator', name: 'Cultivator', icon: '⚙️' },
  { id: 'rotavator', name: 'Rotavator', icon: '🌀' },
  { id: 'plough', name: 'MB Plough', icon: '🪵' },
  { id: 'seeddrill', name: 'Seed Drill', icon: '🌱' },
  { id: 'happyseeder', name: 'Happy Seeder', icon: '🌾' },
  { id: 'transplanter', name: 'Paddy Transplanter', icon: '🌾' },
  { id: 'leveler', name: 'Laser Land Leveler', icon: '📏' },
  { id: 'harvester', name: 'Combine Harvester', icon: '🌾' },
  { id: 'reaper', name: 'Reaper', icon: '✂️' },
  { id: 'thresher', name: 'Thresher', icon: '🌀' },
  { id: 'weeder', name: 'Power Weeder', icon: '🌱' },
  { id: 'sprayer', name: 'Sprayer (Manual)', icon: '🧴' },
  { id: 'boomsprayer', name: 'Boom Sprayer', icon: '🚿' },
  { id: 'dronespayer', name: 'Drone Sprayer', icon: '🛸' },
  { id: 'broadcaster', name: 'Fertilizer Broadcaster', icon: '🎒' }
];

const LOCALIZED_GUIDES = {
  hi: {
    welcome: 'किसानमित्र में आपका स्वागत है। आगे बढ़ने के लिए "शुरू करें" पर दबाएं।',
    otp: 'कृपया अपना १० अंकों का मोबाइल नंबर डालें और ओटीपी दर्ज करें।',
    lang: 'अपनी पसंदीदा भाषा चुनें और "पुष्टि करें और आगे बढ़ें" दबाएं।',
    profile: 'कृपया अपना नाम, राज्य, जिला और गाँव की जानकारी भरें।',
    step1: 'अपने खेत का नाम दर्ज करें और खेत की सीमा का नक्शा बनाएं।',
    step2: 'अपनी वर्तमान फसल और मिट्टी का विवरण चुनें।',
    step3: 'अपने पानी के स्रोत, सिंचाई विधि और उपलब्ध संसाधनों का चयन करें।',
    review: 'खेत के विवरण की समीक्षा करें और इसे सहेजें।'
  },
  en: {
    welcome: 'Welcome to KisanMitra. Tap "Get Started" to personalize your digital companion.',
    otp: 'Please enter your 10-digit mobile number and verify using the OTP sent.',
    lang: 'Select your preferred language for text and voice guidance.',
    profile: 'Fill in your profile details. Location coordinates can be detected automatically.',
    step1: 'Give your farm a name and draw its boundary directly on the map.',
    step2: 'Select your current crop cycle, sowing dates, and specify your soil properties.',
    step3: 'Select all water sources, irrigation equipment, and machinery you use.',
    review: 'Review your complete farm profile before registering it.'
  }
};

const DEFAULT_FARM = {
  name: '',
  state: '',
  district: '',
  village: '',
  pinCode: '',
  lat: '',
  lng: '',
  boundary: [],
  plots: 1,
  area: '',
  unit: 'Acres',
  crop: {
    name: 'wheat',
    variety: 'Karan Vandana',
    stage: 'Sowing',
    sowingDate: '2026-06-01',
    harvestDate: '2026-10-15',
    previousCrop: 'Rice',
    farmingType: 'Conventional'
  },
  soil: {
    type: 'black',
    source: 'manual',
    ph: '7.2',
    carbon: '0.55',
    nitrogen: 'Medium',
    phosphorus: 'Medium',
    potassium: 'High',
    micronutrients: 'Zinc, Iron'
  },
  water: {
    sources: ['canal'],
    sourceDetails: {
      canal: { seasonal: true, availability: 'Medium' }
    },
    irrigationMethods: ['drip'],
    availability: 'Moderate',
    reliability: 'Always Available',
    electricity: 'Daytime Only',
    pumpType: 'Solar',
    pumpCapacity: '3 HP'
  },
  machinery: ['tractor'],
  machineryOwnership: { tractor: 'Own' },
  storage: ['Warehouse'],
  livestock: ['Cow'],
  labor: { type: 'Both', count: '3–5' },
  transportation: ['Tractor'],
  internet: 'Average',
  smartphone: 'Farmer Uses App',
  nearbyRadius: '10 km',
  nearbyFacilities: ['Mandi', 'Fertilizer Shop']
};

// JWT Generation Helpers
const base64UrlEncode = (obj) => {
  const str = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (x) => String.fromCharCode(x)).join("");
  return btoa(binString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const generateMockJWT = (profile) => {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: "google-oauth2|1234567890",
    name: profile.name,
    email: profile.email,
    picture: profile.picture,
    email_verified: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const mockSignature = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
};

const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT Decode Error:", e);
    return null;
  }
};

const decodeJWTHeader = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { alg: "HS256", typ: "JWT" };
    const base64Url = parts[0];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonHeader = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonHeader);
  } catch (e) {
    console.error("JWT Header Decode Error:", e);
    return { alg: "HS256", typ: "JWT" };
  }
};

const getFriendlyAuthErrorMessage = (error) => {
  if (!error) return null;
  
  let code = '';
  let message = '';
  if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object') {
    code = error.code || '';
    message = error.message || '';
  }
  
  if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
    return {
      title: "Domain Not Authorized",
      instructions: "This domain is not authorized for Firebase Authentication. Go to Firebase Console > Authentication > Settings > Authorized domains and add your domain.",
      showFallback: true
    };
  }
  if (code === 'auth/configuration-not-found' || message.includes('configuration-not-found')) {
    return {
      title: "Google Auth Not Enabled",
      instructions: "Google Sign-In is not enabled for project 'kisanmitra-bpa7t' in Firebase Console.",
      showFallback: true
    };
  }
  if (code === 'auth/operation-not-allowed' || message.includes('operation-not-allowed')) {
    return {
      title: "Google Provider Disabled",
      instructions: "This operation is not allowed. Enable Google Sign-In in your Firebase Console.",
      showFallback: true
    };
  }
  if (code === 'auth/popup-blocked' || message.includes('popup-blocked')) {
    return {
      title: "Popup Blocked",
      instructions: "The browser blocked the sign-in popup. Please allow popups for this site or use Demo Mode.",
      showFallback: true
    };
  }
  if (code === 'auth/popup-closed-by-user' || message.includes('popup-closed-by-user')) {
    return {
      title: "Popup Closed",
      instructions: "The login popup was closed before completing authentication. Please try again.",
      showFallback: true
    };
  }
  return {
    title: "Authentication Error",
    instructions: message || "An unknown error occurred during Google Sign-In. Please check the developer console.",
    showFallback: true
  };
};

export default function App() {
  const [view, setView] = useState('WELCOME');
  const [language, setLanguage] = useState('en');
  const [voiceGuide, setVoiceGuide] = useState(true);
  const [playingAudio, setPlayingAudio] = useState(null);
  
  // Auth state
  const [mobileNumber, setMobileNumber] = useState('');
  const [jwtToken, setJwtToken] = useState(localStorage.getItem('km_jwt') || '');
  const [decodedToken, setDecodedToken] = useState(() => {
    const saved = localStorage.getItem('km_decoded_jwt');
    return saved ? JSON.parse(saved) : null;
  });
  const [showGoogleDialog, setShowGoogleDialog] = useState(false);
  const [showJwtInspector, setShowJwtInspector] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Profile setup state (autofilled from local storage if available)
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('km_profile');
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      mobile: '',
      photo: '',
      gender: '',
      dob: '',
      state: '',
      district: '',
      village: '',
      pinCode: '',
      experience: '',
      occupation: 'Farmer',
      ownership: 'Owner',
      farmingMethod: ['Conventional'],
      governmentId: ''
    };
  });
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | success | denied | error

  // Farms state
  const [farms, setFarms] = useState([]);
  const [currentFarm, setCurrentFarm] = useState(DEFAULT_FARM);
  const [editingFarmIndex, setEditingFarmIndex] = useState(null);

  // Location suggestions (mock)
  const [villageSearch, setVillageSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Boundary draw variables
  const [boundaryPoints, setBoundaryPoints] = useState([]);

  // OCR card status
  const [soilHealthCardUploaded, setSoilHealthCardUploaded] = useState(false);
  const [soilOCRProcessing, setSoilOCRProcessing] = useState(false);

  // Redesigned Dashboard State Variables
  const [seasonPlanConfirmed, setSeasonPlanConfirmed] = useState(() => localStorage.getItem('km_season_confirmed') === 'true');
  const [selectedFarmIndex, setSelectedFarmIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState([
    { sender: 'ai', text: 'Namaste! I am KisanMitra Voice Assistant. Ask me anything about your farm today.' }
  ]);
  const [activeDashboardTab, setActiveDashboardTab] = useState('dashboard');
  const [soilCardReminderDismissed, setSoilCardReminderDismissed] = useState(false);
  const [onboardingCarouselIndex, setOnboardingCarouselIndex] = useState(0);
  const [showAnnualPlanWizard, setShowAnnualPlanWizard] = useState(false);
  const [wizardSelectedCrop, setWizardSelectedCrop] = useState('wheat');
  const [activeDialogTask, setActiveDialogTask] = useState(null);
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [selectedMandiDetails, setSelectedMandiDetails] = useState(null);
  const [selectedCommunityPost, setSelectedCommunityPost] = useState(null);
  const [showAllTasksModal, setShowAllTasksModal] = useState(false);
  // Gemini API & Speech Recognition States
  const GROQ_API_KEY = "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";
  const [isListening, setIsListening] = useState(false);
  const [translatedDashboardData, setTranslatedDashboardData] = useState(null);
  const [translating, setTranslating] = useState(false);

  const languageName = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
    te: "Telugu",
    ta: "Tamil",
    gu: "Gujarati",
    kn: "Kannada",
    ml: "Malayalam"
  };

  async function queryGroqAPI(prompt, systemInstruction = "", forceJson = false) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
            { role: "user", content: prompt }
          ],
          temperature: 0.1,
          ...(forceJson ? { response_format: { type: "json_object" } } : {})
        })
      });
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "Sorry, I am unable to connect to the AI service right now.";
    } catch (err) {
      console.error("Groq API Error:", err);
      return "Network error. Please check your internet connection.";
    }
  }

  // TTS: Puter.js (free, uses AWS Polly / OpenAI voices) with Web Speech API fallback
  const speakText = async (text, langCode = 'en') => {
    if (!voiceGuide || !text) return;
    
    // Map language to IETF BCP-47 locale for Web Speech API fallback
    const localeMap = {
      en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN',
      te: 'te-IN', ta: 'ta-IN', gu: 'gu-IN',
      kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN'
    };

    // Try Puter.js TTS first (free, unlimited, high-quality)
    if (typeof puter !== 'undefined' && puter?.ai?.txt2speech) {
      try {
        const audio = await puter.ai.txt2speech(text);
        audio.play();
        return;
      } catch (err) {
        console.warn("Puter.js TTS failed, falling back to Web Speech:", err);
      }
    }

    // Fallback: browser Web Speech Synthesis API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = localeMap[langCode] || 'en-IN';
      utterance.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith(utterance.lang));
      if (matchingVoice) utterance.voice = matchingVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  // STT: Puter.js Whisper (free, highly accurate, multilingual) with Web Speech API fallback
  const startSpeechRecognition = (onTranscript, onError) => {
    const localeMap = {
      en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN',
      te: 'te-IN', ta: 'ta-IN', gu: 'gu-IN',
      kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN'
    };

    // Try Puter.js Whisper STT (free, no API key, handles Indian languages well)
    if (typeof puter !== 'undefined' && puter?.ai?.speech2text) {
      setIsListening(true);
      // Record audio using MediaRecorder, then send to Puter Whisper
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mediaRecorder.onstop = async () => {
          setIsListening(false);
          stream.getTracks().forEach(t => t.stop());
          try {
            const audioBlob = new Blob(chunks, { type: 'audio/webm' });
            const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
            const result = await puter.ai.speech2text(audioFile);
            if (result?.text) {
              if (onTranscript) onTranscript(result.text);
            }
          } catch (err) {
            console.warn("Puter STT error:", err);
            if (onError) onError(err.message);
          }
        };

        mediaRecorder.start();
        // Auto-stop after 6 seconds
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') mediaRecorder.stop();
        }, 6000);
      }).catch(err => {
        setIsListening(false);
        console.warn("Mic access denied, falling back to Web Speech:", err);
        useBrowserSpeechRecognition(localeMap, onTranscript, onError);
      });
      return;
    }

    // Fallback: browser Web Speech API
    useBrowserSpeechRecognition(localeMap, onTranscript, onError);
  };

  const useBrowserSpeechRecognition = (localeMap, onTranscript, onError) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported. Please use Chrome or Edge.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = localeMap[language] || 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onTranscript) onTranscript(transcript);
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      if (onError) onError(event.error);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  useEffect(() => {
    const activeFarm = farms[selectedFarmIndex];
    if (!activeFarm) {
      setTranslatedDashboardData(null);
      return;
    }
    const rawData = getFarmDashboardData(activeFarm);
    if (language === 'en') {
      setTranslatedDashboardData(null);
      return;
    }
    const translateData = async () => {
      setTranslating(true);
      try {
        const translatableFields = {
          weatherInterpretation: rawData.weatherInterpretation,
          market: {
            reasoning: rawData.market.reasoning,
            recommendedMandi: rawData.market.recommendedMandi,
            recommendation: rawData.market.recommendation
          },
          tasks: rawData.tasks.map(t => ({
            id: t.id,
            title: t.title,
            category: t.category,
            why: t.why,
            benefit: t.benefit,
            resources: t.resources
          })),
          actionFeed: rawData.actionFeed.map(a => ({
            id: a.id,
            title: a.title,
            problem: a.problem,
            reason: a.reason,
            action: a.action,
            benefit: a.benefit,
            actionText: a.actionText
          })),
          schemes: rawData.schemes.map(s => ({
            id: s.id,
            name: s.name,
            benefits: s.benefits
          })),
          community: rawData.community.map(c => ({
            id: c.id,
            title: c.title,
            location: c.location,
            content: c.content
          }))
        };
        const targetLangName = languageName[language] || 'Hindi';
        const systemPrompt = "You are a professional agronomist translator. Translate the JSON values into the requested language. Return ONLY the translated JSON. Do not change JSON keys, ids, numbers, or tags. Do not put markdown wrappers.";
        const prompt = `Translate this JSON object into ${targetLangName}:\n${JSON.stringify(translatableFields, null, 2)}`;

        let reply = await queryGroqAPI(prompt, systemPrompt, true);
        reply = reply.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
        const translated = JSON.parse(reply);
        
        const mergedData = {
          ...rawData,
          weatherInterpretation: translated.weatherInterpretation || rawData.weatherInterpretation,
          market: {
            ...rawData.market,
            reasoning: translated.market?.reasoning || rawData.market.reasoning,
            recommendedMandi: translated.market?.recommendedMandi || rawData.market.recommendedMandi,
            recommendation: translated.market?.recommendation || rawData.market.recommendation
          },
          tasks: rawData.tasks.map(t => {
            const transTask = translated.tasks?.find(tt => tt.id === t.id);
            return transTask ? { ...t, ...transTask } : t;
          }),
          actionFeed: rawData.actionFeed.map(a => {
            const transAction = translated.actionFeed?.find(ta => ta.id === a.id);
            return transAction ? { ...a, ...transAction } : a;
          }),
          schemes: rawData.schemes.map(s => {
            const transScheme = translated.schemes?.find(ts => ts.id === s.id);
            return transScheme ? { ...s, ...transScheme } : s;
          }),
          community: rawData.community.map(c => {
            const transPost = translated.community?.find(tc => tc.id === c.id);
            return transPost ? { ...c, ...transPost } : c;
          })
        };
        setTranslatedDashboardData(mergedData);
      } catch (err) {
        console.error("Translation failed:", err);
      } finally {
        setTranslating(false);
      }
    };
    translateData();
  }, [language, selectedFarmIndex, farms]);

  // Sync season plan confirmed state
  useEffect(() => {
    localStorage.setItem('km_season_confirmed', seasonPlanConfirmed);
  }, [seasonPlanConfirmed]);

  // Illustrated Onboarding swipeable items
  const ONBOARDING_SLIDES = [
    {
      title: "Annual Planning",
      icon: "calendar_today",
      desc: "Calculate yearly crop rotations, water budgets, and crop profit forecasts tailored to your soil health indices.",
      color: "from-green-600 to-emerald-800"
    },
    {
      title: "Season Planning",
      icon: "potted_plant",
      desc: "Get automated daily schedules for land prep, seed treatment, irrigation, fertilizer dosages, and harvesting.",
      color: "from-amber-600 to-orange-700"
    },
    {
      title: "Disease Diagnosis",
      icon: "photo_camera",
      desc: "Upload images of diseased leaves or stems to receive instant identification, chemical dosage guides, and organic treatments.",
      color: "from-red-600 to-rose-800"
    },
    {
      title: "Market Intelligence",
      icon: "trending_up",
      desc: "Compare nearby mandi prices, adjust transport costs, and get AI recommendations on whether to sell today or hold.",
      color: "from-blue-600 to-indigo-800"
    },
    {
      title: "Government Schemes",
      icon: "assignment_ind",
      desc: "Direct verification of PM-Kisan and local agricultural subsidies. We cross-reference your registered farm to check eligibility.",
      color: "from-purple-600 to-indigo-700"
    },
    {
      title: "Voice Assistant",
      icon: "mic",
      desc: "Ask questions in Hindi, Marathi, English, or your local language. KisanMitra replies with agricultural voice warnings.",
      color: "from-teal-600 to-cyan-800"
    },
    {
      title: "Community Hub",
      icon: "groups",
      desc: "Discuss regional issues, report local pest spreads, get community warnings, and borrow machinery from neighboring farms.",
      color: "from-sky-600 to-blue-700"
    }
  ];

  // Dynamic Dashboard Data generator based on selected farm and crop
  const getFarmDashboardData = (farm) => {
    if (!farm) return null;
    const cropId = farm.crop?.name || 'wheat';
    const cropDetails = CROPS.find(c => c.id === cropId) || { name: 'Wheat', icon: '🌾' };
    const cropStage = farm.crop?.stage || 'Vegetative / Growth';
    
    // Default structure
    let data = {
      cropName: cropDetails.name,
      cropIcon: cropDetails.icon,
      healthScore: 84,
      growthProgress: 45,
      harvestDays: 72,
      expectedYield: "24 Quintals/Acre",
      estimatedProfit: 120000,
      weatherStatus: "Optimized",
      diseaseRisk: "Low",
      waterStatus: "Optimized",
      timelineStageIndex: 3, // vegetative growth
      tasks: [],
      actionFeed: [],
      healthMetrics: {
        overall: 84,
        water: 90,
        nutrient: 78,
        disease: 15,
        weather: 20,
        growth: 45,
        readiness: 15
      },
      market: {
        recommendation: "Hold",
        expectedProfitIncrease: "₹12,500",
        recommendedMandi: "Nashik APMC",
        adjustedEarnings: "₹2,250/Quintal",
        confidence: 88,
        trend: "up",
        reasoning: "Prices are expected to rise due to supply delays. Selling in 5-7 days will maximize profits."
      },
      schemes: [],
      community: []
    };

    // Wheat specifics
    if (cropId === 'wheat') {
      data.healthScore = 88;
      data.growthProgress = 35;
      data.harvestDays = 85;
      data.expectedYield = "22 Quintals/Acre";
      data.estimatedProfit = Math.round((parseFloat(farm.area) || 2.5) * 45000);
      data.diseaseRisk = "Medium";
      data.waterStatus = "Irrigation Scheduled";
      data.timelineStageIndex = 3; // Vegetative Growth
      data.healthMetrics = {
        overall: 88,
        water: 85,
        nutrient: 90,
        disease: 35,
        weather: 15,
        growth: 35,
        readiness: 10
      };
      data.tasks = [
        {
          id: 'w1',
          title: 'Apply Nitrogen Fertilizer (Urea Top-dressing)',
          category: 'Fertilization',
          priority: 'High',
          time: '07:30 AM',
          duration: '1.5 hours',
          why: `Based on your Soil Health report (Medium nitrogen level). Wheat tillering stage requires Nitrogen boost for healthy shoots.`,
          benefit: 'Increases crop tillering and improves potential grain yield by 15-20%.',
          resources: 'Urea (45 kg/acre), Spreader Backpack, Protective Mask',
          status: 'pending'
        },
        {
          id: 'w2',
          title: 'Drip Irrigation Cycle',
          category: 'Irrigation',
          priority: 'High',
          time: '09:00 AM',
          duration: '2.5 hours',
          why: `Soil moisture in ${farm.name} is currently at 52%. Crown root initiation requires consistent moisture.`,
          benefit: 'Prevents moisture stress and supports uniform tillering.',
          resources: 'Drip system active, 15,000 Litres of Water',
          status: 'pending'
        },
        {
          id: 'w3',
          title: 'Inspect leaves for Stem Rust symptoms',
          category: 'Crop Protection',
          priority: 'Medium',
          time: '11:00 AM',
          duration: '1 hour',
          why: 'Recent morning humidity has exceeded 85%, which is highly favorable for rust fungal spores.',
          benefit: 'Early detection avoids severe foliage damage and prevents 40% yield loss.',
          resources: 'KisanMitra Disease Scanner (Smart Camera)',
          status: 'pending'
        }
      ];
      data.actionFeed = [
        {
          id: 'af1',
          type: 'disease',
          title: 'Stem Rust Warning Nearby',
          problem: 'Increasing reports of Stem Rust in neighboring village (Pimpalgaon, 3km away).',
          reason: 'High morning humidity and moderate temperatures (24-28°C) are ideal for fungal spread.',
          action: 'Inspect your fields and upload leaf photos immediately if you notice yellow/orange pustules.',
          benefit: 'Early application of propiconazole fungicide can save up to ₹25,000 in damages.',
          actionText: 'Open Leaf Scanner'
        },
        {
          id: 'af2',
          type: 'weather',
          title: 'Moderate Rainfall Forecasted',
          problem: 'Local weather station predicts 15mm rainfall in 48 hours.',
          reason: 'Western disturbance approaching the district.',
          action: 'Postpone your next scheduled drip irrigation cycle to save electricity and prevent root waterlogging.',
          benefit: 'Saves around ₹450 in power bills and avoids nutrient leaching.',
          actionText: 'Postpone Irrigation'
        }
      ];
      data.schemes = [
        {
          id: 's1',
          name: 'PM-Kisan Samman Nidhi',
          status: 'Eligible',
          benefits: '₹6,000/year (Direct Benefit Transfer)',
          deadline: '2026-07-15',
          progress: 80,
          documents: 'Aadhaar Card, Land Registry (Khatauni), Bank Passbook',
          desc: 'Income support scheme for small and marginal landholder farmer families.'
        },
        {
          id: 's2',
          name: 'Subsidized Wheat Seed Distribution Scheme',
          status: 'In Progress',
          benefits: '50% subsidy on certified high-yielding wheat seeds (Karan Vandana, HD-3226)',
          deadline: '2026-08-01',
          progress: 40,
          documents: 'Farmer ID card, Soil Health Card, Land holding proof',
          desc: 'Provides high quality seeds at subsidized rates to boost productivity.'
        }
      ];
      data.community = [
        {
          id: 'c1',
          title: 'Stem Rust spotted in Wheat crop',
          author: 'Suresh Patil',
          location: 'Pimpalgaon (3 km away)',
          date: 'Today, 10:30 AM',
          content: 'Hi fellow farmers, I noticed small orange spots on my wheat crop leaves this morning. Agronomist confirmed it is Stem Rust. Please check your fields and take preventive action.',
          replies: 14,
          likes: 28
        },
        {
          id: 'c2',
          title: 'Urea fertilizer availability at Cooperative',
          author: 'Ramesh Sawant',
          location: 'Nashik District Center',
          date: 'Yesterday',
          content: 'Good news! Fresh stock of urea and DAP has arrived at the cooperative society center. Limit is 5 bags per farmer. Bring your Aadhaar Card.',
          replies: 9,
          likes: 19
        }
      ];
    } else if (cropId === 'rice') {
      data.healthScore = 91;
      data.growthProgress = 20;
      data.harvestDays = 110;
      data.expectedYield = "28 Quintals/Acre";
      data.estimatedProfit = Math.round((parseFloat(farm.area) || 2.5) * 52000);
      data.diseaseRisk = "Low";
      data.waterStatus = "Optimal Standing Water";
      data.timelineStageIndex = 2; // Sowing/Transplanting
      data.healthMetrics = {
        overall: 91,
        water: 95,
        nutrient: 85,
        disease: 10,
        weather: 30,
        growth: 20,
        readiness: 5
      };
      data.tasks = [
        {
          id: 'r1',
          title: 'Monitor standing water levels',
          category: 'Irrigation',
          priority: 'High',
          time: '06:30 AM',
          duration: '1 hour',
          why: 'Rice seedlings require consistent standing water (2-5cm) during transplanting.',
          benefit: 'Controls weed growth naturally and supports early root development.',
          resources: 'Borewell water supply, gate valve',
          status: 'pending'
        },
        {
          id: 'r2',
          title: 'Apply Zinc Sulphate Monohydrate',
          category: 'Nutrition',
          priority: 'Medium',
          time: '08:00 AM',
          duration: '2 hours',
          why: 'Khaira disease is common in district soils due to zinc deficiency. Your manual entry shows medium nutrients.',
          benefit: 'Prevents leaves yellowing and improves grain development.',
          resources: 'Zinc Sulphate (10 kg/acre), Dry Sand mix',
          status: 'pending'
        }
      ];
      data.actionFeed = [
        {
          id: 'af3',
          type: 'market',
          title: 'Rice Mandi Price Hike',
          problem: 'Basmati Paddy prices rose by 14% at Nashik Mandi.',
          reason: 'Export demand surge and lower arrivals in northern states.',
          action: 'If you have stored rice from the previous season, consider selling now.',
          benefit: 'Earn an additional ₹350 per quintal over the standard support price.',
          actionText: 'View Mandi Prices'
        }
      ];
      data.schemes = [
        {
          id: 's3',
          name: 'Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)',
          status: 'Eligible',
          benefits: 'Up to 80% subsidy on micro-irrigation system setups',
          deadline: '2026-07-31',
          progress: 10,
          documents: 'Land registry, Aadhaar, Bank Details, Pump Electricity Bill',
          desc: 'Assistance for setting up drip or sprinkler systems to conserve water.'
        }
      ];
      data.community = [
        {
          id: 'c3',
          title: 'Best pesticide for leaf folder control?',
          author: 'Baldev Singh',
          location: 'Rampur (5 km away)',
          date: '2 days ago',
          content: 'My paddy leaves are folding and rolling. Seeing some white caterpillar cocoons. Which organic pesticide works best for this?',
          replies: 22,
          likes: 15
        }
      ];
    } else {
      // Sugarcane or other crops
      data.healthScore = 80;
      data.growthProgress = 60;
      data.harvestDays = 140;
      data.expectedYield = "45 Tonnes/Acre";
      data.estimatedProfit = Math.round((parseFloat(farm.area) || 2.5) * 85000);
      data.diseaseRisk = "Low";
      data.waterStatus = "Optimized Drip";
      data.timelineStageIndex = 3;
      data.healthMetrics = {
        overall: 80,
        water: 88,
        nutrient: 70,
        disease: 15,
        weather: 25,
        growth: 60,
        readiness: 40
      };
      data.tasks = [
        {
          id: 's1',
          title: 'Trash Mulching between Cane Rows',
          category: 'Agronomy',
          priority: 'Medium',
          time: '08:00 AM',
          duration: '3 hours',
          why: 'High temperatures are causing high evaporation. Mulching with dried cane leaves covers soil.',
          benefit: 'Conserves 25% soil moisture and suppresses weed growth.',
          resources: 'Dried cane leaves, Hand rake',
          status: 'pending'
        },
        {
          id: 's2',
          title: 'Drip Fertigation - Potassium Nitrate',
          category: 'Fertilization',
          priority: 'High',
          time: '04:00 PM',
          duration: '2 hours',
          why: 'Sugarcane is in active elongation stage. Potash is critical for sugar accumulation and stalk strength.',
          benefit: 'Increases cane weight and sugar recovery percentage.',
          resources: 'Venturi injector system, Potash fertilizer solubles',
          status: 'pending'
        }
      ];
      data.actionFeed = [
        {
          id: 'af4',
          type: 'deadline',
          title: 'Sugarcane Factory Registration Deadline',
          problem: 'Cane crushing factory registration closing in 5 days.',
          reason: 'Sugar mills coordinating seasonal schedule slots.',
          action: 'Upload sugarcane area certificate and bank details on the mill portal.',
          benefit: 'Ensures guaranteed harvest collection slot and timely billing.',
          actionText: 'Register Mill Slot'
        }
      ];
      data.schemes = [
        {
          id: 's4',
          name: 'State Sugarcane Drip Subsidy Scheme',
          status: 'Eligible',
          benefits: '₹40,000 per hectare direct subsidy for drip line setups',
          deadline: '2026-07-10',
          progress: 90,
          documents: 'Soil Card, CHC registration, Farm Area certificate',
          desc: 'State-sponsored program encouraging water-efficient cane farming.'
        }
      ];
      data.community = [
        {
          id: 'c4',
          title: 'Sugarcane Stem Borer warning',
          author: 'Arvind Patil',
          location: 'Vikas Nagar (8 km away)',
          date: '3 days ago',
          content: 'Spotted stem borer in early shoots. The central leaves are drying up (dead hearts). Advise release of Trichogramma cards or chemical spray.',
          replies: 18,
          likes: 32
        }
      ];
    }

    // Weather interpretations
    data.weatherInterpretation = "Ideal conditions for fertilizer application this morning. Wind is under 8 km/h.";
    if (data.actionFeed.some(item => item.type === 'weather')) {
      data.weatherInterpretation = "Heavy wind & precipitation expected: Avoid spraying pesticides and postpone irrigation.";
    }

    return data;
  };

  // Chatbot Command parser
  const handleVoiceCommand = async (cmdText) => {
    if (!cmdText) return;
    
    // Add user bubble
    setVoiceReplies(prev => [...prev, { sender: 'user', text: cmdText }]);
    // Add typing bubble
    setVoiceReplies(prev => [...prev, { sender: 'ai', text: '...' }]);
    
    const activeFarm = farms[selectedFarmIndex] || DEFAULT_FARM;
    
    const systemPrompt = `You are KisanMitra, an intelligent agricultural AI companion for Indian farmers.
Farmer profile:
- Name: ${profile.name || 'Ramesh'}
- Active Farm: ${activeFarm?.name || 'My Farm'}
- Crop: ${activeFarm?.crop?.name || 'Wheat'} (${activeFarm?.crop?.stage || 'Growth'} stage)
- Location: ${profile.village || 'Pimpalgaon'}, ${profile.district || 'Nashik'}, ${profile.state || 'Maharashtra'}
- Soil: ${activeFarm?.soil?.type || 'Black Clay'} (pH ${activeFarm?.soil?.ph || '6.8'})
- Water resources: ${activeFarm?.water?.sources?.join(', ') || 'Borewell'}

Instructions:
1. Always respond in the requested language: ${languageName[language] || 'English'}.
2. Keep your answer brief, warm, and highly actionable (1-3 sentences maximum).
3. If the user wants to navigate to a screen or perform an action, append one of these exact tokens to the very end of your response:
   - For disease leaf scan / camera: [NAV: diagnosis]
   - For mandi price / market info: [NAV: market]
   - For government subsidies: [NAV: schemes]
   - For farm list: [NAV: farms]
   - For profile or voice settings: [NAV: settings]
   - For today's tasks list: [NAV: tasks]
   - For home dashboard: [NAV: dashboard]
   - For switching to a crop (e.g. wheat, rice, sugarcane): [NAV: switch_wheat], [NAV: switch_rice], [NAV: switch_sugarcane]
`;

    const reply = await queryGroqAPI(cmdText, systemPrompt, false);
    let cleanedReply = reply;
    let navToken = null;
    const navMatch = reply.match(/\[NAV:\s*([a-zA-Z0-9_]+)\]/);
    if (navMatch) {
      navToken = navMatch[1];
      cleanedReply = reply.replace(/\[NAV:\s*[a-zA-Z0-9_]+\]/g, '').trim();
    }
    
    setVoiceReplies(prev => {
      const copy = [...prev];
      if (copy[copy.length - 1]?.text === '...') {
        copy[copy.length - 1] = { sender: 'ai', text: cleanedReply };
      } else {
        copy.push({ sender: 'ai', text: cleanedReply });
      }
      return copy;
    });
    
    speakText(cleanedReply, language);
    
    if (navToken) {
      if (navToken === 'diagnosis') setActiveDashboardTab('diagnosis');
      else if (navToken === 'market') setActiveDashboardTab('market');
      else if (navToken === 'schemes') setActiveDashboardTab('schemes');
      else if (navToken === 'farms') setActiveDashboardTab('farms');
      else if (navToken === 'settings') setActiveDashboardTab('settings');
      else if (navToken === 'dashboard') setActiveDashboardTab('dashboard');
      else if (navToken === 'tasks') setActiveDashboardTab('tasks');
      else if (navToken.startsWith('switch_')) {
        const targetCrop = navToken.replace('switch_', '');
        const idx = farms.findIndex(f => f.crop?.name === targetCrop);
        if (idx !== -1) {
          setSelectedFarmIndex(idx);
          setActiveDashboardTab('dashboard');
        }
      }
    }
  };

  // Trigger TTS voice guide
  useEffect(() => {
    if (voiceGuide) {
      speakGuide();
    }
  }, [view, language, voiceGuide]);

  const speakGuide = () => {
    const guideText = LOCALIZED_GUIDES[language]?.[view.toLowerCase()] || LOCALIZED_GUIDES['en']?.[view.toLowerCase()];
    if (guideText) {
      setPlayingAudio(view);
      setTimeout(() => setPlayingAudio(null), 4000);
    }
  };

  // Auto-save profile
  useEffect(() => {
    localStorage.setItem('km_profile', JSON.stringify(profile));
  }, [profile]);

  // Auto-save JWT
  useEffect(() => {
    if (jwtToken) {
      localStorage.setItem('km_jwt', jwtToken);
      localStorage.setItem('km_decoded_jwt', JSON.stringify(decodedToken));
    } else {
      localStorage.removeItem('km_jwt');
      localStorage.removeItem('km_decoded_jwt');
    }
  }, [jwtToken, decodedToken]);

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const decoded = decodeJWT(idToken);
          setJwtToken(idToken);
          setDecodedToken(decoded);
          
          // Pre-fill profile from Google account data
          setProfile(p => ({
            ...p,
            name: p.name || firebaseUser.displayName || '',
            email: p.email || firebaseUser.email || '',
            mobile: p.mobile || (firebaseUser.phoneNumber ? firebaseUser.phoneNumber.replace('+91', '').trim() : ''),
            photo: firebaseUser.photoURL || p.photo || ''
          }));
          
          // If we are on WELCOME step, advance to LANGUAGE selection
          setView(v => v === 'WELCOME' ? 'LANGUAGE' : v);
        } catch (error) {
          console.error("Error fetching Firebase ID Token:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);


  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      setAuthLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const { user } = result;
      const idToken = await user.getIdToken();
      const decoded = decodeJWT(idToken);
      
      setJwtToken(idToken);
      setDecodedToken(decoded);

      // Pull every available field from Google account
      setProfile(p => ({
        ...p,
        name: user.displayName || p.name || '',
        email: user.email || p.email || '',
        mobile: user.phoneNumber ? user.phoneNumber.replace('+91', '').trim() : p.mobile || '',
        photo: user.photoURL || p.photo || '',
      }));
      setView('LANGUAGE');
    } catch (err) {
      console.error("Firebase Sign-In Error:", err);
      setAuthError(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign Out Error:", err);
    }
    setJwtToken('');
    setDecodedToken(null);
    setProfile({
      name: '',
      mobile: '',
      photo: '',
      gender: '',
      dob: '',
      state: '',
      district: '',
      village: '',
      pinCode: '',
      experience: '',
      occupation: 'Farmer',
      ownership: 'Owner',
      farmingMethod: ['Conventional'],
      governmentId: ''
    });
    setView('WELCOME');
  };

  const triggerLocationDetection = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          // Reverse geocode using OpenStreetMap Nominatim (free, no API key)
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const geo = await resp.json();
          const addr = geo.address || {};
          const state = addr.state || '';
          const district = addr.county || addr.state_district || addr.city_district || addr.district || '';
          const village = addr.village || addr.town || addr.city || addr.suburb || '';
          const pinCode = addr.postcode || '';

          setCurrentFarm(f => ({
            ...f,
            lat: latitude.toFixed(6),
            lng: longitude.toFixed(6),
            accuracy: Math.round(accuracy),
            state,
            district,
            village,
            pinCode,
          }));
          setLocationStatus('success');
        } catch {
          // Geolocation succeeded but reverse geocode failed – still store coords
          setCurrentFarm(f => ({
            ...f,
            lat: latitude.toFixed(6),
            lng: longitude.toFixed(6),
            accuracy: Math.round(accuracy),
          }));
          setLocationStatus('success');
        }
      },
      (err) => {
        if (err.code === 1) setLocationStatus('denied');
        else setLocationStatus('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSoilHealthCardUpload = (e) => {
    setSoilOCRProcessing(true);
    setTimeout(() => {
      setSoilOCRProcessing(false);
      setSoilHealthCardUploaded(true);
      setCurrentFarm(f => ({
        ...f,
        soil: {
          ...f.soil,
          source: 'card',
          ph: '6.8',
          carbon: '0.62',
          nitrogen: 'High',
          phosphorus: 'Medium',
          potassium: 'Medium',
          micronutrients: 'Zinc, Boron'
        }
      }));
    }, 1500);
  };

  const addAnotherFarmPrompt = () => {
    const savedFarm = { ...currentFarm, boundary: boundaryPoints };
    let nextFarms = [...farms];
    if (editingFarmIndex !== null) {
      nextFarms[editingFarmIndex] = savedFarm;
    } else {
      nextFarms.push(savedFarm);
    }
    setFarms(nextFarms);
    setView('MULTI_FARM_PROMPT');
  };

  const startNewFarmRegistration = () => {
    // Prefill locations & irrigation from the first farm to reduce friction
    const firstFarm = farms[0] || {};
    setCurrentFarm({
      ...DEFAULT_FARM,
      name: `Farm #${farms.length + 1}`,
      state: firstFarm.state || profile.state || '',
      district: firstFarm.district || profile.district || '',
      village: firstFarm.village || profile.village || '',
      pinCode: firstFarm.pinCode || profile.pinCode || '',
      water: {
        ...DEFAULT_FARM.water,
        irrigationMethods: firstFarm.water?.irrigationMethods || ['drip']
      }
    });
    setBoundaryPoints([]);
    setEditingFarmIndex(null);
    setSoilHealthCardUploaded(false);
    setView('WIZARD_STEP1');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      
      {/* TTS voice guide floating overlay */}
      {voiceGuide && (
        <div className="fixed top-20 right-4 z-[100] max-w-xs md:max-w-sm bg-primary-container text-on-primary-container border-2 border-primary rounded-2xl shadow-2xl p-4 flex gap-3 items-start animate-bounce">
          <div className="p-2 rounded-full bg-primary/10 text-primary flex-shrink-0">
            <Volume2 className={`w-6 h-6 ${playingAudio ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5 flex justify-between items-center">
              <span>Voice Guide Active</span>
              {playingAudio && <span className="h-1.5 w-1.5 bg-red-600 rounded-full animate-ping"></span>}
            </div>
            <p className="text-sm font-medium">
              {LOCALIZED_GUIDES[language]?.[view.toLowerCase()] || LOCALIZED_GUIDES['en']?.[view.toLowerCase()]}
            </p>
            <button 
              onClick={speakGuide}
              className="mt-2 text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Replay Voice Guidance
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col">
        
        {/* Navigation bar */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-surface-container-high py-4 px-6 md:px-12 flex justify-between items-center z-50">
          <div className="flex items-center gap-3">
            {/* JWT Inspector Button (Visible only when jwtToken is set) */}
             {jwtToken && (
               <button
                 onClick={() => setShowJwtInspector(true)}
                 className="p-2.5 rounded-xl border border-outline-variant bg-[#f0fcfc] text-[#006e2d] hover:bg-[#e0fcfc] transition-all font-semibold text-xs flex items-center gap-1.5"
               >
                 <Cpu className="w-4 h-4 text-primary" />
                 <span>Inspect JWT</span>
               </button>
             )}

             {/* Sign Out Button (Visible only when jwtToken is set) */}
             {jwtToken && (
               <button
                 onClick={handleSignOut}
                 className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-all font-semibold text-xs flex items-center gap-1.5"
               >
                 <span className="material-symbols-outlined text-sm font-bold">logout</span>
                 <span>Sign Out</span>
               </button>
             )}

             {/* Voice toggle button */}
             <button 
               onClick={() => setVoiceGuide(!voiceGuide)}
               className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium text-sm transition-all ${
                 voiceGuide 
                   ? 'bg-primary-container/20 border-primary text-primary shadow-sm' 
                   : 'bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container'
               }`}
             >
               <Volume2 className="w-4 h-4" />
               <span className="hidden sm:inline">{voiceGuide ? 'Voice Helper On' : 'Voice Helper Off'}</span>
             </button>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined font-bold text-2xl">agriculture</span>
            </div>
            <span className="font-display text-2xl font-bold text-primary tracking-tight">KisanMitra</span>
          </div>

          <div className="flex items-center gap-4">
          </div>
        </header>

        {/* View Routing */}
        <div className="flex-1 flex justify-center items-center py-6 px-4 md:px-8">
          
          {/* Welcome Screen */}
          {view === 'WELCOME' && (
            <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-10 py-8">
              <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container/40 text-on-secondary-container font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-primary" /> Indian Farmers' Trusted Companion
                </div>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface leading-tight">
                  Your Digital Farm Companion, Built for Indian Fields
                </h1>
                <p className="text-lg md:text-xl text-on-surface-variant max-w-lg mx-auto lg:mx-0">
                  Tailored crop recommendations, Soil health checks, Irrigation calendars, and direct government aid updates—all in your local language.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl mx-auto lg:mx-0">
                  {[
                    { title: 'Personalized Plan', icon: 'assignment' },
                    { title: 'Sowing Advices', icon: 'potted_plant' },
                    { title: 'Irrigation Cycles', icon: 'water_drop' },
                    { title: 'Market Mandi Prices', icon: 'storefront' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-4 border border-outline-variant/30 shadow-[0_2px_8px_rgba(15,23,42,0.04)] text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-primary-container/20 text-primary flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-2xl fill">{item.icon}</span>
                      </div>
                      <div className="text-xs font-bold text-on-surface">{item.title}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-[450px]">
                <div className="bg-white rounded-card p-8 border border-outline-variant shadow-2xl relative overflow-hidden flex flex-col items-center">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                  
                  {/* Decorative agricultural visual card */}
                  <div className="w-full h-44 rounded-2xl overflow-hidden mb-6 relative">
                    <img 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-APngoDgqNeu9UGHzxO-EFIWrCb3ccrQAdjxEAgoUne7BImTAiOt9aNM-D7xN5EjCJnJYFcfDYh0FeS3cQeJnfej-mQUDp4OjzZKqjIILCchMqIbiDphBVCV69_JZ06GDvqYrI5RNmHtEkhttR_sqY-t8L19eUJlqScgF_vLGt0PFxhBtN-cfH9kggra2sXkrDfbbw0puK_zQVbQj1wGcPqBV5vHV4zo1FvM6rHjuOtxa1WHFaxkjvIoYGuSsUmolPQPVyngePbg" 
                      alt="Agri background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <p className="text-white text-md font-bold">KisanMitra is ready to boost your yield</p>
                    </div>
                  </div>

                  <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Start Your Onboarding</h2>
                  <p className="text-sm text-on-surface-variant text-center mb-6">
                    Connect your Google Account to automatically sync credentials and verify your identity.
                  </p>
                  
                  {authError && (() => {
                    const errorDetails = getFriendlyAuthErrorMessage(authError);
                    return (
                      <div className="w-full mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-950 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-red-900">{errorDetails.title}</p>
                          <p className="text-[11px] text-red-800 font-normal mt-0.5 leading-relaxed">{errorDetails.instructions}</p>
                        </div>
                      </div>
                    );
                  })()}

                  <button 
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="w-full border border-outline-variant bg-white hover:bg-surface-container text-on-surface font-bold h-[54px] rounded-xl flex items-center justify-center gap-3 shadow-md transition-all active:scale-[0.98] mb-3 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    <span>{authLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                  </button>

                  <div className="w-full flex items-center my-3 text-xs text-on-surface-variant font-medium">
                    <div className="flex-1 h-px bg-outline-variant/30"></div>
                    <span className="px-3">OR</span>
                    <div className="flex-1 h-px bg-outline-variant/30"></div>
                  </div>

                  <button 
                    onClick={() => setShowGoogleDialog(true)}
                    className="w-full border-2 border-dashed border-outline-variant bg-[#fdfdfd] hover:bg-[#f4fcf0] hover:border-primary text-on-surface-variant hover:text-primary font-bold h-[54px] rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-lg">science</span>
                    <span>Demo Mode (Mock Sign-In)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OTP Screen */}
          {view === 'OTP' && (
            <div className="w-full max-w-[450px]">
              <div className="bg-white rounded-card p-6 md:p-8 border border-outline-variant shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#0EA5E9]"></div>
                
                <button 
                  onClick={() => setView('WELCOME')}
                  className="mb-4 text-on-surface-variant hover:text-primary flex items-center gap-1.5 text-sm font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <div className="text-center mb-6">
                  <h2 className="font-display text-2xl font-bold text-on-surface">OTP Mobile Login</h2>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {otpStep ? 'Enter the 4-digit code sent to +91 ' + mobileNumber : 'Enter your 10-digit mobile number'}
                  </p>
                </div>

                {/* Simulated SMS Alert Banner */}
                {otpStep && smsNotification && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 animate-pulse">
                    <span className="material-symbols-outlined text-amber-700">sms</span>
                    <span>{smsNotification}</span>
                  </div>
                )}

                {otpStep && otpError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-950 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}

                {/* Form fields */}
                <div className="mb-6">
                  {!otpStep ? (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <span className="text-on-surface font-semibold text-lg">+91</span>
                        <div className="h-5 w-px bg-outline-variant mx-3"></div>
                      </div>
                      <input 
                        type="tel"
                        disabled
                        value={mobileNumber}
                        placeholder="Enter 10 digit number"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-[56px] pl-16 pr-4 text-on-surface font-semibold text-lg tracking-wider"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center gap-4">
                      {otp.map((digit, idx) => (
                        <div 
                          key={idx} 
                          className="w-12 h-14 bg-surface-container-lowest border-2 border-outline-variant rounded-xl flex items-center justify-center text-2xl font-bold text-on-surface transition-colors"
                          style={{ borderColor: digit ? '#006b2c' : '#bdcaba' }}
                        >
                          {digit}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Simulated Custom Large Keypad */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button 
                      key={num}
                      onClick={() => pressKey(num.toString())}
                      className="h-14 rounded-xl bg-surface-container-low hover:bg-surface-container text-xl font-bold text-on-surface transition-colors active:scale-95 flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}
                  <button 
                    onClick={() => {
                      if (otpStep) {
                        setOtpStep(false);
                        setOtp(['', '', '', '']);
                      } else {
                        setMobileNumber('');
                      }
                    }}
                    className="h-14 rounded-xl bg-error-container/20 hover:bg-error-container/40 text-sm font-bold text-error transition-colors active:scale-95 flex items-center justify-center"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => pressKey('0')}
                    className="h-14 rounded-xl bg-surface-container-low hover:bg-surface-container text-xl font-bold text-on-surface transition-colors active:scale-95 flex items-center justify-center"
                  >
                    0
                  </button>
                  <button 
                    onClick={backspaceKey}
                    className="h-14 rounded-xl bg-surface-container-low hover:bg-surface-container text-xl font-bold text-on-surface transition-colors active:scale-95 flex items-center justify-center"
                  >
                    ⌫
                  </button>
                </div>

                {/* Primary Action Button */}
                {!otpStep ? (
                  <button 
                    onClick={() => {
                      if (mobileNumber.length === 10) {
                        setOtpStep(true);
                        const code = '1234';
                        setSmsNotification(`[SMS Received] KisanMitra Verification Code: ${code}`);
                      }
                    }}
                    disabled={mobileNumber.length !== 10}
                    className={`w-full font-bold h-[50px] rounded-xl flex items-center justify-center gap-2 transition-all ${
                      mobileNumber.length === 10 
                        ? 'bg-primary hover:bg-secondary text-white shadow-md' 
                        : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                    }`}
                  >
                    <span>Get OTP Code</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="text-center">
                    <button 
                      onClick={() => verifyOtpAndLogin()}
                      className="w-full bg-primary hover:bg-secondary text-white font-bold h-[50px] rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] mb-3"
                    >
                      Verify & Login
                    </button>
                    <button 
                      onClick={() => {
                        setOtp(['', '', '', '']);
                        setOtpError('');
                        setSmsNotification(`[SMS Resent] KisanMitra Verification Code: 1234`);
                      }}
                      className="text-primary font-semibold text-sm hover:underline"
                    >
                      Resend Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Language Selection */}
          {view === 'LANGUAGE' && (
            <div className="w-full max-w-4xl py-6 flex flex-col items-center">
              
              {/* Graphic Banner */}
              <div className="w-full h-44 rounded-2xl overflow-hidden mb-6 relative shadow-lg">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-Y8wbc_YufAvd2qpsJW-U87OoRsV_0kUeIoknjMmwg3euY6xXp8F2KFaJQc694ncIq7Kroa_vJW7HaW7v9Y0HPc6dz4B8iHztGfrU7-3VJdCEG_tcjlFWjj9JN6FuThppoJhw0BN-xnUNUjvVDArr28qNo5zbpvIvMHYOaZGHO3cuQrDWCmNvg4wHvRcuERW4WHgmGDngc_DzDs5S2KdNBDDfpqwHYyn5qkGEtWjJNvN7BlRCMHiGlYsu8f15htSyWTvpCL0N3zw" 
                  alt="Farm"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                  <div>
                    <h2 className="text-white text-2xl font-bold">Select Language / भाषा चुनें</h2>
                    <p className="text-white/80 text-sm mt-1">This will configure voice commands and AI responses.</p>
                  </div>
                </div>
              </div>

              {/* Language Picker Grid */}
              <div className="w-full bg-white rounded-card p-6 md:p-8 border border-outline-variant shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b border-surface-container-high pb-4">
                  <div className="w-full md:w-auto">
                    <h3 className="font-display text-xl font-bold text-on-surface">Available Languages</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">Select a native language option below</p>
                  </div>
                  {/* Search box */}
                  <div className="relative w-full md:w-64">
                    <input 
                      type="text" 
                      placeholder="Search languages..."
                      className="w-full h-10 pl-10 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {LANGUAGES.map(lang => {
                    const isSelected = language === lang.id;
                    return (
                      <button 
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`group relative flex items-center p-4 rounded-[18px] border-2 transition-all text-left shadow-sm ${
                          isSelected 
                            ? 'border-primary bg-surface-container-low shadow-md' 
                            : 'border-outline-variant bg-white hover:border-primary/50 hover:shadow-md'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                          isSelected ? 'bg-primary text-white font-bold' : 'bg-surface-container-high text-on-surface font-semibold'
                        }`}>
                          <span className="text-lg">{lang.letter}</span>
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-bold text-on-surface text-base">{lang.name}</h4>
                          <p className="text-xs text-on-surface-variant">{lang.native}</p>
                        </div>

                        {/* Play preview sound icon */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlayingAudio(lang.id);
                            setTimeout(() => setPlayingAudio(null), 1500);
                          }}
                          className={`p-2 rounded-full hover:bg-surface-container-high mr-1 transition-all ${
                            playingAudio === lang.id ? 'text-primary scale-110' : 'text-on-surface-variant'
                          }`}
                          title="Listen Preview"
                        >
                          <Volume2 className="w-5 h-5" />
                        </div>

                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? 'border-primary bg-primary text-white' : 'border-outline-variant'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center border-t border-surface-container-high pt-6">
                  <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-primary" />
                    <span>Language can be changed anytime in settings</span>
                  </div>
                  <button 
                    onClick={() => setView('PROFILE')}
                    className="bg-primary hover:bg-secondary text-white font-bold h-12 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                  >
                    <span>Confirm & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Farmer Profile Setup Screen */}
          {view === 'PROFILE' && (
            <div className="w-full max-w-3xl py-6">
              <header className="mb-6 text-center md:text-left">
                <h1 className="font-display text-3xl font-bold text-primary">Farmer Profile Setup</h1>
                <p className="text-on-surface-variant">We collect minimal fields to automatically customize AI warnings and recommendations.</p>
              </header>

              {/* Progress bar */}
              <div className="w-full mb-6">
                <div className="flex justify-between text-xs text-on-surface-variant mb-2">
                  <span className="font-semibold text-primary">Step 1 of 5: Profile Info</span>
                  <span>20% Complete</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-1/5 transition-all"></div>
                </div>
              </div>

              {/* Profile setup card */}
              <div className="bg-white rounded-card p-6 md:p-8 border border-outline-variant shadow-xl space-y-6">
                
                {/* Photo upload section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-surface-container-high pb-6">
                  <div className="relative w-24 h-24 rounded-full bg-surface-container-high border-2 border-dashed border-outline flex items-center justify-center cursor-pointer hover:border-primary hover:bg-surface-container transition-colors group overflow-hidden">
                    {profile.photo ? (
                      <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="material-symbols-outlined text-outline group-hover:text-primary text-3xl">add_a_photo</span>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const file = e.target.files[0]; if(file){ const url = URL.createObjectURL(file); setProfile(p=>({...p, photo: url})); }}} />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-bold text-on-surface text-lg">Add Profile Photo (Optional)</h3>
                    <p className="text-sm text-on-surface-variant mt-1">Helps personalize your account or ID card in Farmer Producer Organizations (FPOs).</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Name field (with voice input option) */}
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-on-surface">Full Name</label>
                    <div className="relative flex items-center">
                      <input 
                        type="text" 
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="e.g. Rajesh Kumar"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 pr-12 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface"
                      />
                      <button 
                        onClick={() => setProfile({ ...profile, name: 'Rajesh Kumar' })}
                        className="absolute right-3 p-1.5 rounded-full hover:bg-surface-container text-primary"
                        title="Simulate Voice Input"
                      >
                        <Mic className="w-5 h-5 animate-pulse" />
                      </button>
                    </div>
                  </div>

                  {/* Email field (auto-filled from Google) */}
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                      Email
                      {profile.email && <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ From Google</span>}
                    </label>
                    <input 
                      type="email" 
                      disabled
                      value={profile.email || ''}
                      placeholder="Fetched from Google account"
                      className="w-full bg-surface-container border border-outline-variant rounded-xl h-12 px-4 text-on-surface-variant cursor-not-allowed font-medium"
                    />
                  </div>

                  {/* Mobile field (auto-filled, disabled) */}
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-on-surface">Mobile Number</label>
                    <input 
                      type="text" 
                      disabled
                      value={profile.mobile ? `+91 ${profile.mobile}` : 'Not linked to Google account'}
                      className="w-full bg-surface-container border border-outline-variant rounded-xl h-12 px-4 text-on-surface-variant cursor-not-allowed font-medium"
                    />
                  </div>

                  {/* PIN Code */}
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-on-surface">PIN Code</label>
                    <input 
                      type="text" 
                      maxLength="6"
                      value={profile.pinCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfile(p => ({ ...p, pinCode: val }));
                      }}
                      placeholder="e.g. 422001"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface font-semibold"
                    />
                  </div>

                  {/* State (Dropdown) */}
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-on-surface">State</label>
                    <select
                      value={profile.state}
                      onChange={(e) => {
                        const newState = e.target.value;
                        setProfile(p => ({ ...p, state: newState, district: '' }));
                      }}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface"
                    >
                      <option value="" disabled>Select State</option>
                      {['Maharashtra', 'Karnataka', 'Gujarat', 'Tamil Nadu', 'Rajasthan', 'Delhi', 'West Bengal', 'Uttar Pradesh'].map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {/* District (Dropdown) */}
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-on-surface">District</label>
                    <select
                      value={profile.district}
                      onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                      disabled={!profile.state}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface"
                    >
                      <option value="" disabled>{profile.state ? 'Select District' : 'Select State First'}</option>
                      {profile.state && {
                        'Maharashtra': ['Mumbai', 'Pune', 'Nashik', 'Nagpur'],
                        'Karnataka': ['Bengaluru', 'Mysore', 'Mangalore'],
                        'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara'],
                        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
                        'Rajasthan': ['Jaipur', 'Udaipur', 'Jodhpur'],
                        'Delhi': ['New Delhi'],
                        'West Bengal': ['Kolkata', 'Howrah'],
                        'Uttar Pradesh': ['Lucknow', 'Agra', 'Kanpur']
                      }[profile.state]?.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>

                  {/* Village (Text Input) */}
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-on-surface">Village</label>
                    <div className="relative flex items-center">
                      <input 
                        type="text" 
                        value={profile.village}
                        onChange={(e) => setProfile({ ...profile, village: e.target.value })}
                        placeholder="Enter Village Name"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface"
                      />
                      {/* Voice input button removed to avoid preset values */}
                    </div>
                  </div>

                  {/* Ownership type */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-bold text-sm text-on-surface">Farm Ownership Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['Owner', 'Tenant', 'Lease', 'Contract'].map(type => {
                        const isSel = profile.ownership === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setProfile({ ...profile, ownership: type })}
                            className={`py-3 rounded-xl border text-center font-bold text-sm transition-all ${
                              isSel 
                                ? 'bg-primary-container/20 border-primary text-primary' 
                                : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/50'
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Farming Method (Multi-select) */}
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="font-bold text-sm text-on-surface">Preferred Farming Method (Select Multiple)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['Conventional', 'Organic', 'Natural', 'Mixed'].map(method => {
                        const isSel = profile.farmingMethod.includes(method);
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => {
                              const currentMethods = [...profile.farmingMethod];
                              if (isSel) {
                                setProfile({
                                  ...profile,
                                  farmingMethod: currentMethods.filter(m => m !== method)
                                });
                              } else {
                                currentMethods.push(method);
                                setProfile({ ...profile, farmingMethod: currentMethods });
                              }
                            }}
                            className={`py-3 px-2 rounded-xl border text-center font-bold text-sm flex items-center justify-center gap-1.5 transition-all ${
                              isSel 
                                ? 'bg-primary-container/20 border-primary text-primary' 
                                : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/50'
                            }`}
                          >
                            {isSel && <Check className="w-4 h-4" />}
                            <span>{method}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Occupation */}
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-on-surface">Primary Occupation</label>
                    <select 
                      value={profile.occupation}
                      onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface appearance-none"
                    >
                      <option>Farmer</option>
                      <option>Agri Business Owner</option>
                      <option>Agronomist / Advisor</option>
                      <option>Labourer</option>
                    </select>
                  </div>

                  {/* Experience */}
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-on-surface">Farming Experience (Years)</label>
                    <input 
                      type="number" 
                      value={profile.experience}
                      onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                      placeholder="e.g. 10"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface"
                    />
                  </div>

                  {/* Optional demographic fields (collapsed by default / progressive disclosure) */}
                  <div className="flex flex-col gap-2 md:col-span-2 border-t border-surface-container-high pt-4">
                    <h4 className="font-bold text-sm text-on-surface-variant flex items-center gap-1">
                      <Layers className="w-4 h-4 text-primary" /> Optional Demographics & Government ID
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <select 
                        value={profile.gender}
                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        className="bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 text-sm text-on-surface"
                      >
                        <option value="">Gender (Optional)</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <input 
                        type="date"
                        value={profile.dob}
                        onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                        className="bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 text-sm text-on-surface"
                        placeholder="DOB"
                      />
                      <input 
                        type="text"
                        value={profile.governmentId}
                        onChange={(e) => setProfile({ ...profile, governmentId: e.target.value })}
                        placeholder="Govt Card ID (e.g. PM-KISAN, optional)"
                        className="bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 text-sm text-on-surface"
                      />
                    </div>
                  </div>

                </div>

                {/* Bottom actions */}
                <div className="flex justify-between items-center border-t border-surface-container-high pt-6">
                  <button 
                    type="button" 
                    onClick={() => setView('LANGUAGE')}
                    className="text-on-surface-variant hover:text-primary font-bold text-sm"
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      // Save farm default location
                      setCurrentFarm(f => ({
                        ...f,
                        state: profile.state,
                        district: profile.district,
                        village: profile.village,
                        pinCode: profile.pinCode
                      }));
                      setView('WIZARD_STEP1');
                    }}
                    className="bg-primary hover:bg-secondary text-white font-bold h-12 px-8 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                  >
                    <span>Save & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Farm Setup Wizard: Step 1 - Basic Farm Info */}
          {view === 'WIZARD_STEP1' && (
            <div className="w-full max-w-3xl py-6">
              <header className="mb-6 text-center md:text-left">
                <h1 className="font-display text-3xl font-bold text-primary">Farm Registration Wizard</h1>
                <p className="text-on-surface-variant">Step 1: Identify your farm, detect coordinates, and draw your boundary layout.</p>
              </header>

              {/* Progress bar */}
              <div className="w-full mb-6">
                <div className="flex justify-between text-xs text-on-surface-variant mb-2">
                  <span className="font-semibold text-primary">Step 2 of 5: Basic Farm Information</span>
                  <span>40% Complete</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-2/5 transition-all"></div>
                </div>
              </div>

              {/* Form card */}
              <div className="bg-white rounded-card p-6 border border-outline-variant shadow-xl space-y-6">
                
                {/* Farm name input */}
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-sm text-on-surface">Farm Name</label>
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      value={currentFarm.name}
                      onChange={(e) => setCurrentFarm({ ...currentFarm, name: e.target.value })}
                      placeholder="e.g. North Fields, main plot"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface"
                    />
                    <button 
                      onClick={() => setCurrentFarm({ ...currentFarm, name: 'Main Fields' })}
                      className="absolute right-3 p-1.5 rounded-full hover:bg-surface-container text-primary"
                      title="Simulate Voice Input"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Location Detection Block */}
                <div className="border border-outline-variant rounded-2xl p-4 bg-surface-container-low space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <h3 className="font-bold text-on-surface text-base flex items-center gap-1.5">
                        <MapPin className="w-5 h-5 text-primary" /> GPS Location Detection
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Precise coordinates allow KisanMitra to supply hyper-local weather alerts and pest warnings.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={triggerLocationDetection}
                      disabled={locationStatus === 'loading'}
                      className="bg-primary hover:bg-secondary disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 text-xs shadow-md transition-all active:scale-95"
                    >
                      <Compass className={`w-4 h-4 ${locationStatus === 'loading' ? 'animate-spin' : ''}`} />
                      <span>{locationStatus === 'loading' ? 'Detecting...' : 'Detect My Location'}</span>
                    </button>
                  </div>

                  {/* Status messages */}
                  {locationStatus === 'denied' && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                      <span className="material-symbols-outlined text-base">location_off</span>
                      <span><strong>Permission Denied.</strong> Please allow location access in your browser (click the lock icon in the address bar → Permissions → Location → Allow) and try again.</span>
                    </div>
                  )}
                  {locationStatus === 'error' && (
                    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                      <span className="material-symbols-outlined text-base">warning</span>
                      <span><strong>Could not detect location.</strong> Make sure GPS is enabled on your device or try moving to an open area.</span>
                    </div>
                  )}
                  {locationStatus === 'success' && (
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-2 text-xs text-green-700 font-semibold">
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      Location detected successfully{currentFarm.accuracy ? ` (±${currentFarm.accuracy}m accuracy)` : ''}!
                    </div>
                  )}

                  {currentFarm.lat && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-outline-variant text-xs font-semibold">
                      <div><span className="text-on-surface-variant block">Latitude:</span> {currentFarm.lat}</div>
                      <div><span className="text-on-surface-variant block">Longitude:</span> {currentFarm.lng}</div>
                      <div><span className="text-on-surface-variant block">Village:</span> {currentFarm.village || '—'}</div>
                      <div><span className="text-on-surface-variant block">District:</span> {currentFarm.district || '—'}</div>
                    </div>
                  )}

                  {/* Interactive Map and Polygon Drawer */}
                  <div className="relative w-full h-64 bg-surface-container-highest rounded-xl overflow-hidden border border-outline-variant group">
                    {/* Simulated Satellite Map */}
                    <img 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAw-bZQ2DWz0sQDoUL7p95FW-g1TB8KH9sGw4GgaeEGd3sVrmM1t2J5p_fEazEW6OQmYHOTJgi-t_FIg_txK73nTbFDepbYoCRwLctWzLdoCX2Ok1guM0UxYMjOsfdZBrg8wELSY1ro8IiFAqUQd0DKefToaDtQFi1GCBat2DHHhoWaB7VXnShTX7dhxBl9egZdlYZQq885K3WICZT4Lh497__Td9cOmtkKz-HHWOoH5ToWE6F7fEPrf1hPHZ-QrjqrNiQ_8WnWegY" 
                      alt="Satellite Map View"
                    />

                    {/* SVG Polygon overlay drawing */}
                    {boundaryPoints.length > 0 && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <polygon 
                          points={boundaryPoints.map(p => `${p.x},${p.y}`).join(' ')} 
                          fill="rgba(22, 163, 74, 0.25)" 
                          stroke="#16a34a" 
                          strokeWidth="3" 
                        />
                        {boundaryPoints.map((p, i) => (
                          <circle key={i} cx={p.x} cy={p.y} r="5" fill="#15803d" stroke="white" strokeWidth="1.5" />
                        ))}
                      </svg>
                    )}

                    {/* Pin overlay */}
                    {currentFarm.lat && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-600 pointer-events-none drop-shadow-md">
                        <MapPin className="w-10 h-10 fill-red-600 text-white" />
                      </div>
                    )}

                    </div>
                  </div>
                </div>

                {/* Land Area and Unit selector */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-on-surface">Total Land Area</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={currentFarm.area}
                      onChange={(e) => setCurrentFarm({ ...currentFarm, area: e.target.value })}
                      placeholder="e.g. 5.5"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-on-surface">Unit</label>
                    <select 
                      value={currentFarm.unit}
                      onChange={(e) => setCurrentFarm({ ...currentFarm, unit: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface font-semibold appearance-none"
                    >
                      <option>Acres</option>
                      <option>Hectares</option>
                      <option>Bigha</option>
                      <option>Guntha</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-sm text-on-surface">Number of Separate Plots</label>
                    <input 
                      type="number" 
                      min="1"
                      value={currentFarm.plots}
                      onChange={(e) => setCurrentFarm({ ...currentFarm, plots: parseInt(e.target.value) || 1 })}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface"
                    />
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="flex justify-between items-center border-t border-surface-container-high pt-6">
                  <button 
                    type="button" 
                    onClick={() => setView('PROFILE')}
                    className="text-on-surface-variant hover:text-primary font-bold text-sm"
                  >
                    Back to Profile
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setView('WIZARD_STEP2')}
                    className="bg-primary hover:bg-secondary text-white font-bold h-12 px-8 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                  >
                    <span>Next: Crops & Soil</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
          )}

          {/* Farm Setup Wizard: Step 2 - Crop & Soil Info */}
          {view === 'WIZARD_STEP2' && (
            <div className="w-full max-w-3xl py-6">
              <header className="mb-6 text-center md:text-left">
                <h1 className="font-display text-3xl font-bold text-primary">Farm Registration Wizard</h1>
                <p className="text-on-surface-variant">Step 2: Enter crop details, sowing logs, and Soil Health Card records.</p>
              </header>

              {/* Progress bar */}
              <div className="w-full mb-6">
                <div className="flex justify-between text-xs text-on-surface-variant mb-2">
                  <span className="font-semibold text-primary">Step 3 of 5: Crop & Soil Information</span>
                  <span>60% Complete</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-3/5 transition-all"></div>
                </div>
              </div>

              {/* Form container */}
              <div className="space-y-6">
                
                {/* Crops Info Card */}
                <div className="bg-white rounded-card p-6 border border-outline-variant shadow-xl space-y-6">
                  <h2 className="font-display text-xl font-bold text-on-surface border-b border-surface-container-high pb-3 flex items-center gap-2">
                    <span>🌾</span> Crop Lifecycle Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Crop selection cards */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="font-bold text-sm text-on-surface">Select Current Crop</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {CROPS.map(c => {
                          const isSel = currentFarm.crop.name === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setCurrentFarm({
                                ...currentFarm,
                                crop: { ...currentFarm.crop, name: c.id }
                              })}
                              className={`p-4 rounded-xl border text-center font-bold text-sm flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 ${
                                isSel 
                                  ? 'bg-primary-container/20 border-primary text-primary' 
                                  : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/50'
                              }`}
                            >
                              <span className="text-3xl">{c.icon}</span>
                              <span>{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Variety */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-sm text-on-surface">Crop Variety</label>
                      <input 
                        type="text"
                        value={currentFarm.crop.variety}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          crop: { ...currentFarm.crop, variety: e.target.value }
                        })}
                        placeholder="e.g. Karan Vandana, PBW-343"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface"
                      />
                    </div>

                    {/* Stage */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-sm text-on-surface">Current Crop Stage</label>
                      <select 
                        value={currentFarm.crop.stage}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          crop: { ...currentFarm.crop, stage: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface font-medium"
                      >
                        <option>Sowing</option>
                        <option>Vegetative / Growth</option>
                        <option>Flowering</option>
                        <option>Pod / Grain Filling</option>
                        <option>Harvesting</option>
                      </select>
                    </div>

                    {/* Dates */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-sm text-on-surface">Sowing Date</label>
                      <input 
                        type="date"
                        value={currentFarm.crop.sowingDate}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          crop: { ...currentFarm.crop, sowingDate: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 text-on-surface"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-sm text-on-surface">Expected Harvest Date</label>
                      <input 
                        type="date"
                        value={currentFarm.crop.harvestDate}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          crop: { ...currentFarm.crop, harvestDate: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 text-on-surface"
                      />
                    </div>

                    {/* Farming Type */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-sm text-on-surface">Farming Type</label>
                      <select 
                        value={currentFarm.crop.farmingType}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          crop: { ...currentFarm.crop, farmingType: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 text-on-surface"
                      >
                        <option>Conventional</option>
                        <option>Organic</option>
                        <option>Natural Farming (ZBNF)</option>
                        <option>Mixed</option>
                      </select>
                    </div>

                    {/* Previous Crop */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-sm text-on-surface">Previous Crop</label>
                      <input 
                        type="text"
                        value={currentFarm.crop.previousCrop}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          crop: { ...currentFarm.crop, previousCrop: e.target.value }
                        })}
                        placeholder="What did you grow here last?"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-12 px-4 focus:border-primary focus:ring-1 focus:ring-primary/20 text-on-surface"
                      />
                    </div>

                  </div>
                </div>

                {/* Soil Health Card Section */}
                <div className="bg-white rounded-card p-6 border border-outline-variant shadow-xl space-y-6">
                  <h2 className="font-display text-xl font-bold text-on-surface border-b border-surface-container-high pb-3 flex items-center gap-2">
                    <span>🧪</span> Soil Information & Soil Health Card
                  </h2>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentFarm(f => ({ ...f, soil: { ...f.soil, source: 'card' } }))}
                      className={`p-4 rounded-xl border text-center font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        currentFarm.soil.source === 'card'
                          ? 'bg-primary-container/20 border-primary text-primary'
                          : 'bg-white border-outline-variant text-on-surface-variant'
                      }`}
                    >
                      <Upload className="w-5 h-5" />
                      <span>Upload Soil Health Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentFarm(f => ({ ...f, soil: { ...f.soil, source: 'manual' } }))}
                      className={`p-4 rounded-xl border text-center font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        currentFarm.soil.source === 'manual'
                          ? 'bg-primary-container/20 border-primary text-primary'
                          : 'bg-white border-outline-variant text-on-surface-variant'
                      }`}
                    >
                      <Edit3 className="w-5 h-5" />
                      <span>Enter Manually</span>
                    </button>
                  </div>

                  {/* Mode Card Upload */}
                  {currentFarm.soil.source === 'card' && (
                    <div className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center space-y-4">
                      {soilOCRProcessing ? (
                        <div className="space-y-2">
                          <RefreshCw className="w-10 h-10 animate-spin mx-auto text-primary" />
                          <h4 className="font-bold text-on-surface">Processing Soil Health Card...</h4>
                          <p className="text-xs text-on-surface-variant">Extracting pH, organic carbon, and NPK indices using KisanMitra AI OCR.</p>
                        </div>
                      ) : soilHealthCardUploaded ? (
                        <div className="space-y-2 text-[#16a34a]">
                          <CheckCircle2 className="w-10 h-10 mx-auto" />
                          <h4 className="font-bold">Soil Health Card Parsed Successfully!</h4>
                          <p className="text-xs text-on-surface-variant">Extracted metrics auto-filled in the fields below.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <span className="material-symbols-outlined text-outline-variant text-5xl">description</span>
                          <div>
                            <h4 className="font-bold text-on-surface">Upload Soil Health Card photo or PDF</h4>
                            <p className="text-xs text-on-surface-variant mt-1">Accepts PNG, JPG, or PDF (Max 10MB)</p>
                          </div>
                          <label className="inline-block bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-xl text-xs cursor-pointer shadow-md">
                            Browse Files
                            <input type="file" onChange={handleSoilHealthCardUpload} className="hidden" />
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Warning banner if manual averages used */}
                  {currentFarm.soil.source === 'manual' && !soilHealthCardUploaded && (
                    <div className="p-4 rounded-xl bg-error-container/20 border-l-4 border-error text-on-error-container text-xs flex gap-3 items-start">
                      <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                      <div>
                        <span className="font-bold block">District Averages Will Be Used Temporarily</span>
                        Since you haven't uploaded a Soil Health Card, KisanMitra will use average district-level soil data ({currentFarm.district || 'Nashik'} region averages). Upload your card later for hyper-accurate yield calculations.
                      </div>
                    </div>
                  )}

                  {/* Manual soil inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-xs text-on-surface">Soil Type</label>
                      <select 
                        value={currentFarm.soil.type}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          soil: { ...currentFarm.soil, type: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs"
                      >
                        <option value="black">Black Soil (Regur)</option>
                        <option value="red">Red Soil</option>
                        <option value="alluvial">Alluvial Soil</option>
                        <option value="laterite">Laterite Soil</option>
                        <option value="sandy">Sandy Soil</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-xs text-on-surface">Soil pH</label>
                      <input 
                        type="text"
                        value={currentFarm.soil.ph}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          soil: { ...currentFarm.soil, ph: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-xs text-on-surface">Organic Carbon (%)</label>
                      <input 
                        type="text"
                        value={currentFarm.soil.carbon}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          soil: { ...currentFarm.soil, carbon: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-xs text-on-surface">Nitrogen (N)</label>
                      <select 
                        value={currentFarm.soil.nitrogen}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          soil: { ...currentFarm.soil, nitrogen: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-xs text-on-surface">Phosphorus (P)</label>
                      <select 
                        value={currentFarm.soil.phosphorus}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          soil: { ...currentFarm.soil, phosphorus: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-xs text-on-surface">Potassium (K)</label>
                      <select 
                        value={currentFarm.soil.potassium}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          soil: { ...currentFarm.soil, potassium: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>

                </div>

                {/* Bottom actions */}
                <div className="flex justify-between items-center border-t border-surface-container-high pt-6 bg-white p-4 rounded-xl border border-outline-variant">
                  <button 
                    type="button" 
                    onClick={() => setView('WIZARD_STEP1')}
                    className="text-on-surface-variant hover:text-primary font-bold text-sm"
                  >
                    Back to Farm Info
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setView('WIZARD_STEP3')}
                    className="bg-primary hover:bg-secondary text-white font-bold h-12 px-8 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                  >
                    <span>Next: Water & Resources</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Farm Setup Wizard: Step 3 - Water Sources, Irrigation & Farm Resources */}
          {view === 'WIZARD_STEP3' && (
            <div className="w-full max-w-4xl py-6">
              <header className="mb-6 text-center md:text-left">
                <h1 className="font-display text-3xl font-bold text-primary">Farm Registration Wizard</h1>
                <p className="text-on-surface-variant">Step 3: Tell us about your water availability, power grid supply, machinery, and resources.</p>
              </header>

              {/* Progress bar */}
              <div className="w-full mb-6">
                <div className="flex justify-between text-xs text-on-surface-variant mb-2">
                  <span className="font-semibold text-primary">Step 4 of 5: Water Sources, Irrigation & Farm Resources</span>
                  <span>80% Complete</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-4/5 transition-all"></div>
                </div>
              </div>

              {/* Form container */}
              <div className="space-y-6">
                
                {/* 1. Water Sources (Multi-select cards) */}
                <div className="bg-white rounded-card p-6 border border-outline-variant shadow-xl space-y-4">
                  <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                    <Droplet className="w-6 h-6 text-primary" /> Primary Water Sources (Select Multiple)
                  </h2>
                  <p className="text-xs text-on-surface-variant">Indian farms often use more than one source. Please select all that apply.</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {WATER_SOURCES.map(source => {
                      const isSel = currentFarm.water.sources.includes(source.id);
                      return (
                        <button
                          key={source.id}
                          type="button"
                          onClick={() => {
                            const currentSources = [...currentFarm.water.sources];
                            if (isSel) {
                              setCurrentFarm({
                                ...currentFarm,
                                water: {
                                  ...currentFarm.water,
                                  sources: currentSources.filter(s => s !== source.id)
                                }
                              });
                            } else {
                              currentSources.push(source.id);
                              setCurrentFarm({
                                ...currentFarm,
                                water: {
                                  ...currentFarm.water,
                                  sources: currentSources
                                }
                              });
                            }
                          }}
                          className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                            isSel 
                              ? 'bg-primary-container/20 border-primary text-primary shadow-sm' 
                              : 'bg-white border-outline-variant text-on-surface hover:border-primary/50'
                          }`}
                        >
                          <span className="text-2xl">{source.icon}</span>
                          <span>{source.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Conditional options for each selected source */}
                  {currentFarm.water.sources.map(sourceId => {
                    const src = WATER_SOURCES.find(s => s.id === sourceId);
                    if (!src) return null;
                    const detail = currentFarm.water.sourceDetails[sourceId] || { seasonal: false, availability: 'Medium' };
                    return (
                      <div key={sourceId} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 text-xs space-y-3">
                        <h4 className="font-bold text-on-surface flex items-center gap-1">
                          <Check className="w-4 h-4 text-primary" /> {src.name} Custom Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="block text-on-surface-variant mb-1 font-semibold">Availability Cycle</span>
                            <div className="flex border border-outline-variant rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() => setCurrentFarm({
                                  ...currentFarm,
                                  water: {
                                    ...currentFarm.water,
                                    sourceDetails: {
                                      ...currentFarm.water.sourceDetails,
                                      [sourceId]: { ...detail, seasonal: false }
                                    }
                                  }
                                })}
                                className={`flex-1 py-1 text-center font-bold ${!detail.seasonal ? 'bg-primary text-white' : 'bg-white text-on-surface-variant'}`}
                              >
                                Year-round
                              </button>
                              <button
                                type="button"
                                onClick={() => setCurrentFarm({
                                  ...currentFarm,
                                  water: {
                                    ...currentFarm.water,
                                    sourceDetails: {
                                      ...currentFarm.water.sourceDetails,
                                      [sourceId]: { ...detail, seasonal: true }
                                    }
                                  }
                                })}
                                className={`flex-1 py-1 text-center font-bold ${detail.seasonal ? 'bg-primary text-white' : 'bg-white text-on-surface-variant'}`}
                              >
                                Seasonal
                              </button>
                            </div>
                          </div>
                          <div>
                            <span className="block text-on-surface-variant mb-1 font-semibold">Water Level</span>
                            <div className="flex border border-outline-variant rounded-lg overflow-hidden">
                              {['Low', 'Medium', 'High'].map(lvl => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => setCurrentFarm({
                                    ...currentFarm,
                                    water: {
                                      ...currentFarm.water,
                                      sourceDetails: {
                                        ...currentFarm.water.sourceDetails,
                                        [sourceId]: { ...detail, availability: lvl }
                                      }
                                    }
                                  })}
                                  className={`flex-1 py-1 text-center font-bold ${detail.availability === lvl ? 'bg-primary text-white' : 'bg-white text-on-surface-variant'}`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Irrigation Methods */}
                <div className="bg-white rounded-card p-6 border border-outline-variant shadow-xl space-y-4">
                  <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl font-bold">sprinkler</span> Irrigation Methods (Select Multiple)
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {IRRIGATION_METHODS.map(m => {
                      const isSel = currentFarm.water.irrigationMethods.includes(m.id);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            const currentMethods = [...currentFarm.water.irrigationMethods];
                            if (isSel) {
                              setCurrentFarm({
                                ...currentFarm,
                                water: {
                                  ...currentFarm.water,
                                  irrigationMethods: currentMethods.filter(item => item !== m.id)
                                }
                              });
                            } else {
                              currentMethods.push(m.id);
                              setCurrentFarm({
                                ...currentFarm,
                                water: {
                                  ...currentFarm.water,
                                  irrigationMethods: currentMethods
                                }
                              });
                            }
                          }}
                          className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all ${
                            isSel 
                              ? 'bg-primary-container/20 border-primary text-primary shadow-sm' 
                              : 'bg-white border-outline-variant text-on-surface hover:border-primary/50'
                          }`}
                        >
                          <span className="text-2xl">{m.icon}</span>
                          <span>{m.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Water Availability & Reliability & Electricity */}
                <div className="bg-white rounded-card p-6 border border-outline-variant shadow-xl space-y-6">
                  <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                    <Compass className="w-6 h-6 text-primary" /> Supply & Reliability
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Water availability */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-sm text-on-surface">Overall Water Availability</label>
                      <select
                        value={currentFarm.water.availability}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          water: { ...currentFarm.water, availability: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-11 px-3 text-sm font-semibold"
                      >
                        <option>Plenty</option>
                        <option>Moderate</option>
                        <option>Limited</option>
                        <option>Highly Scarce</option>
                      </select>
                    </div>

                    {/* Water supply reliability */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-sm text-on-surface">Water Supply Reliability</label>
                      <select
                        value={currentFarm.water.reliability}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          water: { ...currentFarm.water, reliability: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-11 px-3 text-sm"
                      >
                        <option>Always Available</option>
                        <option>Seasonal</option>
                        <option>Rain Dependent</option>
                        <option>Electricity Dependent</option>
                      </select>
                    </div>

                    {/* Electricity for Irrigation */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-sm text-on-surface">Electricity for Irrigation</label>
                      <select
                        value={currentFarm.water.electricity}
                        onChange={(e) => setCurrentFarm({
                          ...currentFarm,
                          water: { ...currentFarm.water, electricity: e.target.value }
                        })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl h-11 px-3 text-sm"
                      >
                        <option>24 Hours</option>
                        <option>Daytime Only</option>
                        <option>Night Supply</option>
                        <option>Irregular</option>
                        <option>Solar Pump</option>
                        <option>Diesel Pump</option>
                      </select>
                    </div>
                  </div>

                  {/* 4. Conditional Pump Details (Visible ONLY if Borewell or Tubewell selected) */}
                  {(currentFarm.water.sources.includes('borewell')) && (
                    <div className="p-6 rounded-2xl bg-primary-container/10 border border-primary/20 space-y-4">
                      <h3 className="font-bold text-primary text-base flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary font-bold">bolt</span> Conditional Pump Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="font-bold text-xs text-on-surface">Pump Type</label>
                          <select
                            value={currentFarm.water.pumpType}
                            onChange={(e) => setCurrentFarm({
                              ...currentFarm,
                              water: { ...currentFarm.water, pumpType: e.target.value }
                            })}
                            className="bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs"
                          >
                            <option>Electric</option>
                            <option>Diesel</option>
                            <option>Solar</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="font-bold text-xs text-on-surface">Pump Capacity</label>
                          <select
                            value={currentFarm.water.pumpCapacity}
                            onChange={(e) => setCurrentFarm({
                              ...currentFarm,
                              water: { ...currentFarm.water, pumpCapacity: e.target.value }
                            })}
                            className="bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs"
                          >
                            <option>1 HP</option>
                            <option>2 HP</option>
                            <option>3 HP</option>
                            <option>5 HP</option>
                            <option>Custom</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Farm Machinery (Ownership toggle cards) */}
                <div className="bg-white rounded-card p-6 border border-outline-variant shadow-xl space-y-4">
                  <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl font-bold">agriculture</span> Farm Machinery (Multi-select)
                  </h2>
                  <p className="text-xs text-on-surface-variant">Select machinery and select whether you own it, rent it, or use a custom hiring center.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MACHINERY_ITEMS.map(item => {
                      const isSel = currentFarm.machinery.includes(item.id);
                      const ownType = currentFarm.machineryOwnership[item.id] || 'Own';
                      return (
                        <div 
                          key={item.id} 
                          className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                            isSel ? 'border-primary bg-surface-container-low shadow-sm' : 'border-outline-variant bg-white'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              let nextList = [...currentFarm.machinery];
                              if (isSel) {
                                nextList = nextList.filter(id => id !== item.id);
                              } else {
                                nextList.push(item.id);
                              }
                              setCurrentFarm({ ...currentFarm, machinery: nextList });
                            }}
                            className="flex items-center gap-2.5 font-bold text-sm text-left flex-grow"
                          >
                            <span className="text-2xl">{item.icon}</span>
                            <span className="text-on-surface">{item.name}</span>
                          </button>

                          {isSel && (
                            <div className="flex border border-outline-variant rounded-lg overflow-hidden bg-white">
                              {['Own', 'Rent', 'CHC'].map(type => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setCurrentFarm({
                                    ...currentFarm,
                                    machineryOwnership: {
                                      ...currentFarm.machineryOwnership,
                                      [item.id]: type
                                    }
                                  })}
                                  className={`px-2.5 py-1 text-xs font-bold transition-all ${
                                    ownType === type ? 'bg-primary text-white' : 'hover:bg-surface-container text-on-surface-variant'
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Storage Facilities & Livestock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Storage */}
                  <div className="bg-white rounded-card p-6 border border-outline-variant shadow-xl space-y-4">
                    <h3 className="font-bold text-on-surface text-lg border-b border-surface-container-high pb-2">Storage Facilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Open Storage', 'Warehouse', 'Cold Storage', 'Grain Storage', 'Onion Storage', 'Potato Storage', 'None'].map(s => {
                        const isSel = currentFarm.storage.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              let next = [...currentFarm.storage];
                              if (isSel) {
                                next = next.filter(item => item !== s);
                              } else {
                                if (s === 'None') next = ['None'];
                                else {
                                  next = next.filter(item => item !== 'None');
                                  next.push(s);
                                }
                              }
                              setCurrentFarm({ ...currentFarm, storage: next });
                            }}
                            className={`py-2 px-3 rounded-full border text-xs font-bold transition-colors ${
                              isSel ? 'bg-primary text-white border-primary' : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/50'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Livestock */}
                  <div className="bg-white rounded-card p-6 border border-outline-variant shadow-xl space-y-4">
                    <h3 className="font-bold text-on-surface text-lg border-b border-surface-container-high pb-2">Livestock (Optional)</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Cow', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Pig', 'Fish Pond', 'None'].map(s => {
                        const isSel = currentFarm.livestock.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              let next = [...currentFarm.livestock];
                              if (isSel) {
                                next = next.filter(item => item !== s);
                              } else {
                                if (s === 'None') next = ['None'];
                                else {
                                  next = next.filter(item => item !== 'None');
                                  next.push(s);
                                }
                              }
                              setCurrentFarm({ ...currentFarm, livestock: next });
                            }}
                            className={`py-2 px-3 rounded-full border text-xs font-bold transition-colors ${
                              isSel ? 'bg-primary text-white border-primary' : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/50'
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 7. Labor, Transportation, Connectivity & Smartphone */}
                <div className="bg-white rounded-card p-6 border border-outline-variant shadow-xl space-y-6">
                  <h3 className="font-bold text-on-surface text-lg border-b border-surface-container-high pb-2">Labour & Operations</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Labor */}
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-xs text-on-surface">Labor Availability</label>
                        <select
                          value={currentFarm.labor.type}
                          onChange={(e) => setCurrentFarm({
                            ...currentFarm,
                            labor: { ...currentFarm.labor, type: e.target.value }
                          })}
                          className="bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs"
                        >
                          <option>Family Labour</option>
                          <option>Hired Labour</option>
                          <option>Both</option>
                          <option>Labour Shortage</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-xs text-on-surface">Average Number of Workers</label>
                        <select
                          value={currentFarm.labor.count}
                          onChange={(e) => setCurrentFarm({
                            ...currentFarm,
                            labor: { ...currentFarm.labor, count: e.target.value }
                          })}
                          className="bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs"
                        >
                          <option>1–2</option>
                          <option>3–5</option>
                          <option>5–10</option>
                          <option>10+</option>
                        </select>
                      </div>
                    </div>

                    {/* Transportation */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-xs text-on-surface">Transportation Tools</label>
                      <div className="flex flex-wrap gap-2">
                        {['Tractor', 'Pickup', 'Mini Truck', 'Truck', 'Two Wheeler', 'Auto', 'None'].map(t => {
                          const isSel = currentFarm.transportation.includes(t);
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => {
                                let next = [...currentFarm.transportation];
                                if (isSel) {
                                  next = next.filter(item => item !== t);
                                } else {
                                  next.push(t);
                                }
                                setCurrentFarm({ ...currentFarm, transportation: next });
                              }}
                              className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                                isSel ? 'bg-primary text-white border-primary' : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/50'
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Connectivity & Smartphone Usage */}
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-xs text-on-surface">Internet Connectivity</label>
                      <select
                        value={currentFarm.internet}
                        onChange={(e) => setCurrentFarm({ ...currentFarm, internet: e.target.value })}
                        className="bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs font-semibold"
                      >
                        <option>Good</option>
                        <option>Average</option>
                        <option>Poor</option>
                        <option>No Internet</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-xs text-on-surface">Smartphone Usage</label>
                      <select
                        value={currentFarm.smartphone}
                        onChange={(e) => setCurrentFarm({ ...currentFarm, smartphone: e.target.value })}
                        className="bg-surface-container-lowest border border-outline-variant rounded-xl h-10 px-3 text-xs"
                      >
                        <option>Farmer Uses App</option>
                        <option>Family Member Uses App</option>
                        <option>Shared Phone</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 8. Nearby Agriculture Facilities */}
                <div className="bg-white rounded-card p-6 border border-outline-variant shadow-xl space-y-4">
                  <h3 className="font-bold text-on-surface text-lg border-b border-surface-container-high pb-2">Nearby Agriculture Facilities</h3>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-on-surface">Search Radius:</span>
                      <div className="flex border border-outline-variant rounded-lg overflow-hidden bg-white">
                        {['5 km', '10 km', '20 km'].map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setCurrentFarm({ ...currentFarm, nearbyRadius: r })}
                            className={`px-3 py-1.5 text-xs font-bold transition-all ${
                              currentFarm.nearbyRadius === r ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-container'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      'Krishi Vigyan Kendra (KVK)', 'Agriculture Office', 'Fertilizer Shop', 
                      'Seed Shop', 'Pesticide Shop', 'Soil Testing Laboratory', 
                      'Mandi', 'Farmer Producer Organization (FPO)', 'Cold Storage'
                    ].map(f => {
                      const isSel = currentFarm.nearbyFacilities.includes(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            let next = [...currentFarm.nearbyFacilities];
                            if (isSel) {
                              next = next.filter(item => item !== f);
                            } else {
                              next.push(f);
                            }
                            setCurrentFarm({ ...currentFarm, nearbyFacilities: next });
                          }}
                          className={`py-2 px-3 rounded-full border text-xs font-bold transition-colors ${
                            isSel ? 'bg-primary text-white border-primary' : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary/50'
                          }`}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="flex justify-between items-center border-t border-surface-container-high pt-6 bg-white p-4 rounded-xl border border-outline-variant">
                  <button 
                    type="button" 
                    onClick={() => setView('WIZARD_STEP2')}
                    className="text-on-surface-variant hover:text-primary font-bold text-sm"
                  >
                    Back to Crops & Soil
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setView('REVIEW')}
                    className="bg-primary hover:bg-secondary text-white font-bold h-12 px-8 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                  >
                    <Check className="w-5 h-5" />
                    <span>Review Farm Details</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Farm Review Screen */}
          {view === 'REVIEW' && (
            <div className="w-full max-w-4xl py-6 space-y-6">
              <header className="mb-4 text-center md:text-left">
                <h1 className="font-display text-3xl font-bold text-primary">Farm Setup Summary</h1>
                <p className="text-on-surface-variant">Review all the configured details. You can click Edit on any block to change details.</p>
              </header>

              {/* Review summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Basic Details Card */}
                <div className="bg-white rounded-card p-6 border border-outline-variant shadow-lg relative">
                  <button 
                    onClick={() => setView('WIZARD_STEP1')}
                    className="absolute top-4 right-4 text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <h3 className="font-display text-lg font-bold text-on-surface mb-3 pb-2 border-b border-surface-container-high flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Basic Farm Information
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li><span className="font-semibold text-on-surface-variant">Farm Name:</span> {currentFarm.name || 'Unnamed Farm'}</li>
                    <li><span className="font-semibold text-on-surface-variant">Location:</span> {currentFarm.village}, {currentFarm.district}, {currentFarm.state} (PIN: {currentFarm.pinCode})</li>
                    <li><span className="font-semibold text-on-surface-variant">Land Area:</span> {currentFarm.area} {currentFarm.unit} ({currentFarm.plots} plot(s))</li>
                    <li>
                      <span className="font-semibold text-on-surface-variant block mb-1">Boundary drawn:</span>
                      <span className="inline-block py-1 px-3 rounded-full bg-primary-container/20 text-primary font-bold text-xs">
                        {boundaryPoints.length > 0 ? `${boundaryPoints.length}-point boundary active` : 'No coordinates drawn'}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 2. Crop Details Card */}
                <div className="bg-white rounded-card p-6 border border-outline-variant shadow-lg relative">
                  <button 
                    onClick={() => setView('WIZARD_STEP2')}
                    className="absolute top-4 right-4 text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <h3 className="font-display text-lg font-bold text-on-surface mb-3 pb-2 border-b border-surface-container-high flex items-center gap-2">
                    <span>🌾</span> Crop Cycle
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li><span className="font-semibold text-on-surface-variant">Current Crop:</span> {currentFarm.crop.name.toUpperCase()} (Variety: {currentFarm.crop.variety})</li>
                    <li><span className="font-semibold text-on-surface-variant">Crop Stage:</span> {currentFarm.crop.stage}</li>
                    <li><span className="font-semibold text-on-surface-variant">Sowing Date:</span> {currentFarm.crop.sowingDate}</li>
                    <li><span className="font-semibold text-on-surface-variant">Expected Harvest:</span> {currentFarm.crop.harvestDate}</li>
                    <li><span className="font-semibold text-on-surface-variant">Previous Crop:</span> {currentFarm.crop.previousCrop}</li>
                    <li><span className="font-semibold text-on-surface-variant">Farming Type:</span> {currentFarm.crop.farmingType}</li>
                  </ul>
                </div>

                {/* 3. Soil Details Card */}
                <div className="bg-white rounded-card p-6 border border-outline-variant shadow-lg relative">
                  <button 
                    onClick={() => setView('WIZARD_STEP2')}
                    className="absolute top-4 right-4 text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <h3 className="font-display text-lg font-bold text-on-surface mb-3 pb-2 border-b border-surface-container-high flex items-center gap-2">
                    <span>🧪</span> Soil Quality
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li><span className="font-semibold text-on-surface-variant">Soil Type:</span> {currentFarm.soil.type.toUpperCase()}</li>
                    <li><span className="font-semibold text-on-surface-variant">Soil pH:</span> {currentFarm.soil.ph}</li>
                    <li><span className="font-semibold text-on-surface-variant">Organic Carbon:</span> {currentFarm.soil.carbon}%</li>
                    <li><span className="font-semibold text-on-surface-variant">Macronutrients (N-P-K):</span> {currentFarm.soil.nitrogen} Nitrogen, {currentFarm.soil.phosphorus} Phosphorus, {currentFarm.soil.potassium} Potassium</li>
                    <li><span className="font-semibold text-on-surface-variant">Micronutrients:</span> {currentFarm.soil.micronutrients || 'None'}</li>
                    <li>
                      <span className="font-semibold text-on-surface-variant">Source:</span>{' '}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        currentFarm.soil.source === 'card' ? 'bg-[#f0fdf4] text-[#16a34a]' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {currentFarm.soil.source === 'card' ? 'Soil Health Card OCR' : 'Manual Entry (District Averages)'}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 4. Water & Resources Details Card */}
                <div className="bg-white rounded-card p-6 border border-outline-variant shadow-lg relative">
                  <button 
                    onClick={() => setView('WIZARD_STEP3')}
                    className="absolute top-4 right-4 text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <h3 className="font-display text-lg font-bold text-on-surface mb-3 pb-2 border-b border-surface-container-high flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-primary" /> Water & Machinery Resources
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li><span className="font-semibold text-on-surface-variant">Water Sources:</span> {currentFarm.water.sources.join(', ') || 'None'}</li>
                    <li><span className="font-semibold text-on-surface-variant">Irrigation Methods:</span> {currentFarm.water.irrigationMethods.join(', ') || 'None'}</li>
                    <li><span className="font-semibold text-on-surface-variant">Water Level & Supply:</span> {currentFarm.water.availability} / {currentFarm.water.reliability}</li>
                    <li><span className="font-semibold text-on-surface-variant">Electricity:</span> {currentFarm.water.electricity}</li>
                    <li><span className="font-semibold text-on-surface-variant">Machinery:</span> {currentFarm.machinery.join(', ') || 'None'}</li>
                    <li><span className="font-semibold text-on-surface-variant">Livestock:</span> {currentFarm.livestock.join(', ') || 'None'}</li>
                  </ul>
                </div>

              </div>

              {/* Ready Status Bar */}
              <div className="bg-[#f0fdf4] border border-primary/30 p-4 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="text-xs md:text-sm text-on-surface">
                  <span className="font-bold text-primary block">Farm Setup Status: Fully Ready</span>
                  KisanMitra is ready to deploy your annual crop planner, water budget forecasts, and nutrient requirements.
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-4 border-t border-surface-container-high pt-6">
                <button
                  onClick={() => setView('WIZARD_STEP3')}
                  className="px-6 h-12 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors text-sm font-semibold"
                >
                  Go Back
                </button>
                <button
                  onClick={addAnotherFarmPrompt}
                  className="bg-primary hover:bg-secondary text-white font-bold h-12 px-8 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Register Farm & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* Multiple Farm Prompt */}
          {view === 'MULTI_FARM_PROMPT' && (
            <div className="w-full max-w-[500px]">
              <div className="bg-white rounded-card p-6 md:p-8 border border-outline-variant shadow-2xl relative text-center space-y-6">
                <div className="w-16 h-16 bg-[#f0fdf4] text-primary rounded-full flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-4xl fill">check_circle</span>
                </div>

                <div>
                  <h2 className="font-display text-2xl font-bold text-on-surface">Farm Registered Successfully!</h2>
                  <p className="text-sm text-on-surface-variant mt-2">
                    Your farm, <span className="font-bold text-primary">"{farms[farms.length - 1]?.name}"</span>, is active. Do you own or operate another farm or plot?
                  </p>
                </div>

                {/* Farms List */}
                <div className="bg-surface-container-low p-4 rounded-2xl border text-left text-xs space-y-2">
                  <span className="font-bold text-on-surface-variant block mb-1">Registered Farms ({farms.length})</span>
                  {farms.map((f, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-surface-container-high last:border-0">
                      <span className="font-semibold">{f.name} ({f.area} {f.unit})</span>
                      <span className="text-on-surface-variant">{f.village}, {f.district}</span>
                    </div>
                  ))}
                </div>

                {/* Multi Options */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={startNewFarmRegistration}
                    className="flex-1 bg-white hover:bg-surface-container-low border-2 border-primary text-primary font-bold h-12 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Add Another Farm</span>
                  </button>
                  <button
                    onClick={() => setView('PLANNER')}
                    className="flex-1 bg-primary hover:bg-secondary text-white font-bold h-12 rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Go to Planner</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Annual Farm Planner Dashboard */}
          {/* Annual Farm Planner Dashboard */}
          {view === 'PLANNER' && (
            <DashboardShell
              profile={profile}
              language={language}
              setLanguage={setLanguage}
              languages={LANGUAGES}
              seasonPlanConfirmed={seasonPlanConfirmed}
              farms={farms}
              selectedFarmIndex={selectedFarmIndex}
              setSelectedFarmIndex={setSelectedFarmIndex}
              getFarmDashboardData={farm => translatedDashboardData || getFarmDashboardData(farm)}
              translating={translating}
              isListening={isListening}
              startSpeechRecognition={startSpeechRecognition}
              voiceGuide={voiceGuide}
              setVoiceGuide={setVoiceGuide}
              handleVoiceCommand={handleVoiceCommand}
              activeDashboardTab={activeDashboardTab}
              setActiveDashboardTab={setActiveDashboardTab}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              completedTasks={completedTasks}
              setCompletedTasks={setCompletedTasks}
              voiceAssistantOpen={voiceAssistantOpen}
              setVoiceAssistantOpen={setVoiceAssistantOpen}
              voiceReplies={voiceReplies}
              setVoiceReplies={setVoiceReplies}
              soilHealthCardUploaded={soilHealthCardUploaded}
              soilCardReminderDismissed={soilCardReminderDismissed}
              setSoilCardReminderDismissed={setSoilCardReminderDismissed}
              handleSoilHealthCardUpload={handleSoilHealthCardUpload}
              showAnnualPlanWizard={showAnnualPlanWizard}
              setShowAnnualPlanWizard={setShowAnnualPlanWizard}
              onboardingCarouselIndex={onboardingCarouselIndex}
              setOnboardingCarouselIndex={setOnboardingCarouselIndex}
              onboardingSlides={ONBOARDING_SLIDES}
              wizardSelectedCrop={wizardSelectedCrop}
              setWizardSelectedCrop={setWizardSelectedCrop}
              activeDialogTask={activeDialogTask}
              setActiveDialogTask={setActiveDialogTask}
              selectedRescheduleDate={selectedRescheduleDate}
              setSelectedRescheduleDate={setSelectedRescheduleDate}
              selectedScheme={selectedScheme}
              setSelectedScheme={setSelectedScheme}
              selectedMandiDetails={selectedMandiDetails}
              setSelectedMandiDetails={setSelectedMandiDetails}
              selectedCommunityPost={selectedCommunityPost}
              setSelectedCommunityPost={setSelectedCommunityPost}
              showAllTasksModal={showAllTasksModal}
              setShowAllTasksModal={setShowAllTasksModal}
              startNewFarmRegistration={startNewFarmRegistration}
              setView={setView}
              setFarms={setFarms}
              setMobileNumber={setMobileNumber}
              setJwtToken={setJwtToken}
              setDecodedToken={setDecodedToken}
              setSeasonPlanConfirmed={setSeasonPlanConfirmed}
              crops={CROPS}
              setCurrentFarm={setCurrentFarm}
              setBoundaryPoints={setBoundaryPoints}
              setEditingFarmIndex={setEditingFarmIndex}
            />
          )}

        </div>

        {/* Google Account Selector Dialog Simulation */}
        {showGoogleDialog && (
          <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm border border-outline-variant shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-200">
              
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="font-semibold text-sm text-on-surface">Sign in with Google</span>
                </div>
                <button 
                  onClick={() => setShowGoogleDialog(false)}
                  className="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1 rounded-full hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Account Choice list */}
              <div className="py-6 space-y-4">
                <p className="text-xs text-on-surface-variant font-medium">Choose an account to continue to <strong>KisanMitra</strong></p>
                
                {/* Rajesh Kumar Account */}
                <button
                  onClick={() => {
                    const account = {
                      name: "Rajesh Kumar",
                      email: "rajesh.kumar@gmail.com",
                      picture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2"
                    };
                    const token = generateMockJWT(account);
                    setJwtToken(token);
                    setDecodedToken({
                      sub: "google-oauth2|1234567890",
                      ...account,
                      email_verified: true,
                      iat: Math.floor(Date.now() / 1000),
                      exp: Math.floor(Date.now() / 1000) + 3600
                    });
                    // Pre-fill profile name and mock mobile
                    setProfile(p => ({
                      ...p,
                      name: account.name,
                      mobile: "1234567890"
                    }));
                    setShowGoogleDialog(false);
                    setView('LANGUAGE');
                  }}
                  className="w-full flex items-center p-3 rounded-xl border border-outline-variant hover:bg-surface-container-low text-left gap-3 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                    R
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-sm text-on-surface truncate">Rajesh Kumar</h4>
                    <p className="text-xs text-on-surface-variant truncate">rajesh.kumar@gmail.com</p>
                  </div>
                  <span className="text-[10px] bg-primary-container/20 text-primary px-2.5 py-0.5 rounded-full font-bold flex-shrink-0">Test Profile</span>
                </button>
              </div>
              
              <div className="text-[10px] text-on-surface-variant text-center pt-2 border-t border-surface-container-high">
                To create a secure connection, Google will share your profile info with KisanMitra.
              </div>

            </div>
          </div>
        )}

        {/* JWT Inspector Modal */}
        {showJwtInspector && jwtToken && (
          <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl border border-outline-variant shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center pb-4 border-b border-surface-container-high">
                <h3 className="font-display text-lg font-bold text-primary flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-primary" /> Decoded JWT Token & Test Profile
                </h3>
                <button 
                  onClick={() => setShowJwtInspector(false)}
                  className="text-on-surface-variant hover:text-on-surface flex items-center justify-center p-1 rounded-full hover:bg-surface-container"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="py-4 space-y-4 text-xs font-mono">
                <div>
                  <span className="block font-sans font-bold text-on-surface mb-1">Encoded JWT (Header.Payload.Signature):</span>
                  <div className="p-3 bg-surface-container rounded-xl overflow-x-auto break-all max-h-24 overflow-y-auto text-[10px] leading-relaxed">
                    <span className="text-red-600">{jwtToken.split('.')[0]}</span>.
                    <span className="text-blue-600">{jwtToken.split('.')[1]}</span>.
                    <span className="text-green-600">{jwtToken.split('.')[2]}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="block font-sans font-bold text-on-surface mb-1">Decoded Header:</span>
                    <pre className="p-3 bg-red-50 text-red-950 rounded-xl overflow-x-auto leading-relaxed">
{JSON.stringify(decodeJWTHeader(jwtToken), null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="block font-sans font-bold text-on-surface mb-1">Decoded Payload:</span>
                    <pre className="p-3 bg-blue-50 text-blue-950 rounded-xl overflow-x-auto max-h-48 overflow-y-auto leading-relaxed text-[11px]">
{JSON.stringify(decodedToken, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="border-t border-surface-container-high pt-4 flex justify-end">
                <button
                  onClick={() => setShowJwtInspector(false)}
                  className="bg-primary hover:bg-secondary text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors active:scale-95 shadow-sm"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Universal Footer */}
        <footer className="bg-white border-t border-surface-container-high py-4 text-center text-xs text-on-surface-variant">
          <div className="max-w-[1440px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© 2026 KisanMitra Inc. Designed for Indian Farmers.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Terms of Service</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Contact Support</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
