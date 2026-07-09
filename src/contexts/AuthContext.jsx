import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Firebase Configuration (shared with App.jsx)
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

// JWT helpers
const base64UrlEncode = (obj) => {
  const str = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (x) => String.fromCharCode(x)).join("");
  return btoa(binString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const decodeJWT = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const generateMockJWT = (profile) => {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: "demo_" + profile.email.replace(/[^a-zA-Z0-9]/g, '_'),
    name: profile.name,
    email: profile.email,
    picture: profile.picture || '',
    email_verified: true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400
  };
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const mockSignature = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
};

// Demo farm data
const DEMO_PROFILES = {
  rajesh: {
    profile: {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@gmail.com",
      mobile: "9876543210",
      photo: "",
      gender: "Male",
      dob: "1985-04-12",
      state: "Maharashtra",
      district: "Nashik",
      village: "Pimpalgaon",
      pinCode: "422209",
      experience: "15",
      occupation: "Farmer",
      ownership: "Owner",
      farmingMethod: ["Conventional", "Organic"],
      governmentId: "AADHAAR-XXXX-7890"
    },
    farms: [
      {
        name: "Rajesh Wheat Farm",
        state: "Maharashtra",
        district: "Nashik",
        village: "Pimpalgaon",
        pinCode: "422209",
        lat: "20.0059",
        lng: "73.7823",
        boundary: [],
        plots: 2,
        area: "4.5",
        unit: "Acres",
        crop: {
          name: "Wheat",
          variety: "GW 322",
          stage: "Growth",
          sowingDate: "2026-04-10",
          harvestDate: "2026-09-15",
          previousCrop: "Rice",
          farmingType: "Conventional"
        },
        soil: {
          type: "Black Clay",
          source: "card",
          ph: "6.8",
          carbon: "0.62",
          nitrogen: "High",
          phosphorus: "Medium",
          potassium: "Medium",
          micronutrients: "Zinc, Boron"
        },
        water: {
          sources: ["borewell", "canal"],
          irrigationMethods: ["drip"],
          availability: "Good",
          reliability: "Always Available",
          electricity: "Daytime Only",
          pumpType: "Solar",
          pumpCapacity: "5 HP"
        },
        machinery: ["tractor", "sprayer"],
        storage: ["Warehouse"],
        livestock: ["Cow"],
        labor: { type: "Both", count: "3–5" },
        transportation: ["Tractor"],
        internet: "Good",
        smartphone: "Farmer Uses App",
        nearbyRadius: "10 km",
        nearbyFacilities: ["Mandi", "Fertilizer Shop", "KVK"]
      },
      {
        name: "Sugarcane Field B",
        state: "Maharashtra",
        district: "Nashik",
        village: "Ozar",
        pinCode: "422206",
        lat: "20.0890",
        lng: "73.9120",
        boundary: [],
        plots: 1,
        area: "2.8",
        unit: "Acres",
        crop: {
          name: "Sugarcane",
          variety: "Co-86032",
          stage: "Flowering",
          sowingDate: "2025-12-01",
          harvestDate: "2026-11-20",
          previousCrop: "Soybean",
          farmingType: "Conventional"
        },
        soil: {
          type: "Red Loam",
          source: "manual",
          ph: "7.1",
          carbon: "0.48",
          nitrogen: "Medium",
          phosphorus: "High",
          potassium: "Medium",
          micronutrients: "Iron, Manganese"
        },
        water: {
          sources: ["canal"],
          irrigationMethods: ["drip", "flood"],
          availability: "Moderate",
          reliability: "Seasonal",
          electricity: "Daytime Only",
          pumpType: "Electric",
          pumpCapacity: "3 HP"
        },
        machinery: ["tractor", "harvester"],
        storage: ["Cold Storage"],
        livestock: [],
        labor: { type: "Hired", count: "5–10" },
        transportation: ["Tractor", "Truck"],
        internet: "Average",
        smartphone: "Farmer Uses App",
        nearbyRadius: "15 km",
        nearbyFacilities: ["Mandi", "Sugar Factory"]
      }
    ]
  },
  priya: {
    profile: {
      name: "Priya Sharma",
      email: "priya.sharma@gmail.com",
      mobile: "9123456789",
      photo: "",
      gender: "Female",
      dob: "1992-08-25",
      state: "Punjab",
      district: "Ludhiana",
      village: "Khanna",
      pinCode: "141401",
      experience: "8",
      occupation: "Farmer",
      ownership: "Owner",
      farmingMethod: ["Organic"],
      governmentId: "AADHAAR-XXXX-4567"
    },
    farms: [
      {
        name: "Priya Rice Paddy",
        state: "Punjab",
        district: "Ludhiana",
        village: "Khanna",
        pinCode: "141401",
        lat: "30.6942",
        lng: "76.2137",
        boundary: [],
        plots: 3,
        area: "6.2",
        unit: "Acres",
        crop: {
          name: "Rice",
          variety: "Pusa Basmati 1121",
          stage: "Growth",
          sowingDate: "2026-05-20",
          harvestDate: "2026-10-30",
          previousCrop: "Wheat",
          farmingType: "Organic"
        },
        soil: {
          type: "Alluvial",
          source: "card",
          ph: "7.0",
          carbon: "0.72",
          nitrogen: "High",
          phosphorus: "High",
          potassium: "Medium",
          micronutrients: "Zinc, Iron"
        },
        water: {
          sources: ["canal", "borewell"],
          irrigationMethods: ["flood", "sprinkler"],
          availability: "Good",
          reliability: "Always Available",
          electricity: "Full Day",
          pumpType: "Electric",
          pumpCapacity: "7.5 HP"
        },
        machinery: ["tractor", "happyseeder", "cultivator"],
        storage: ["Warehouse", "Cold Storage"],
        livestock: ["Cow", "Buffalo"],
        labor: { type: "Both", count: "5–10" },
        transportation: ["Tractor", "Truck"],
        internet: "Good",
        smartphone: "Farmer Uses App",
        nearbyRadius: "15 km",
        nearbyFacilities: ["Mandi", "KVK", "Fertilizer Shop", "Seed Center"]
      }
    ]
  }
};

const DEFAULT_PROFILE = {
  name: '', email: '', mobile: '', photo: '', gender: '', dob: '',
  state: '', district: '', village: '', pinCode: '', experience: '',
  occupation: 'Farmer', ownership: 'Owner',
  farmingMethod: ['Conventional'], governmentId: ''
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [jwtToken, setJwtToken] = useState(() => localStorage.getItem('km_jwt') || '');
  const [decodedToken, setDecodedToken] = useState(() => {
    const saved = localStorage.getItem('km_decoded_jwt');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('km_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });
  const [isDemo, setIsDemo] = useState(() => localStorage.getItem('km_demo_mode') === 'true');
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const isAuthenticated = !!jwtToken;

  // Sync to localStorage
  useEffect(() => {
    if (jwtToken) {
      localStorage.setItem('km_jwt', jwtToken);
      localStorage.setItem('km_decoded_jwt', JSON.stringify(decodedToken));
    } else {
      localStorage.removeItem('km_jwt');
      localStorage.removeItem('km_decoded_jwt');
    }
  }, [jwtToken, decodedToken]);

  useEffect(() => {
    if (decodedToken?.sub) {
      localStorage.setItem(`km_${decodedToken.sub}_profile`, JSON.stringify(profile));
    }
  }, [profile, decodedToken]);

  useEffect(() => {
    if (isDemo) {
      localStorage.setItem('km_demo_mode', 'true');
    } else {
      localStorage.removeItem('km_demo_mode');
    }
  }, [isDemo]);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !isDemo) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const decoded = decodeJWT(idToken);
          setUser(firebaseUser);
          setJwtToken(idToken);
          setDecodedToken(decoded);
          setProfile(p => ({
            ...p,
            name: p.name || firebaseUser.displayName || '',
            email: p.email || firebaseUser.email || '',
            mobile: p.mobile || (firebaseUser.phoneNumber ? firebaseUser.phoneNumber.replace('+91', '').trim() : ''),
            photo: firebaseUser.photoURL || p.photo || ''
          }));
        } catch (error) {
          console.error("Error fetching Firebase ID Token:", error);
        }
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [isDemo]);

  const login = useCallback(async () => {
    try {
      setAuthError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const { user: firebaseUser } = result;
      const idToken = await firebaseUser.getIdToken();
      const decoded = decodeJWT(idToken);

      setUser(firebaseUser);
      setJwtToken(idToken);
      setDecodedToken(decoded);
      setProfile(p => ({
        ...p,
        name: firebaseUser.displayName || p.name || '',
        email: firebaseUser.email || p.email || '',
        mobile: firebaseUser.phoneNumber ? firebaseUser.phoneNumber.replace('+91', '').trim() : p.mobile || '',
        photo: firebaseUser.photoURL || p.photo || '',
      }));
      return true;
    } catch (err) {
      console.error("Firebase Sign-In Error:", err);
      setAuthError(err);
      return false;
    }
  }, []);

  const demoLogin = useCallback((personaKey = 'rajesh') => {
    const persona = DEMO_PROFILES[personaKey];
    if (!persona) return false;

    const token = generateMockJWT(persona.profile);
    const decoded = decodeJWT(token);

    setJwtToken(token);
    setDecodedToken(decoded);
    setProfile(persona.profile);
    setIsDemo(true);
    setUser(null);

    // Seed demo farms into their specific namespace
    const prefix = `km_demo_${persona.profile.email.replace(/[^a-zA-Z0-9]/g, '_')}_`;
    localStorage.setItem(`${prefix}farms`, JSON.stringify(persona.farms));
    localStorage.setItem(`${prefix}season_confirmed`, 'true');
    localStorage.setItem(`${prefix}selected_farm_index`, '0');
    localStorage.setItem(`${prefix}completed_tasks`, '[]');
    localStorage.setItem(`${prefix}rescheduled_tasks`, '{}');
    localStorage.setItem(`${prefix}active_tab`, 'dashboard');

    return true;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (!isDemo) {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Sign Out Error:", err);
    }

    // Clear auth session data
    localStorage.removeItem('km_jwt');
    localStorage.removeItem('km_decoded_jwt');
    localStorage.removeItem('km_demo_mode');

    // We do NOT clear namespaced keys (farms, profile, etc.) so returning users don't lose data.
    
    setUser(null);
    setJwtToken('');
    setDecodedToken(null);
    setIsDemo(false);
    setProfile(DEFAULT_PROFILE);
    setAuthError(null);
  }, [isDemo]);

  const value = {
    user,
    jwtToken,
    setJwtToken,
    decodedToken,
    setDecodedToken,
    profile,
    setProfile,
    isAuthenticated,
    isDemo,
    isLoading,
    authError,
    setAuthError,
    login,
    demoLogin,
    logout,
    auth,
    DEMO_PROFILES,
    generateMockJWT,
    decodeJWT,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
