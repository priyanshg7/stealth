# KisanMitra: AI-Powered Digital Farming Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📖 Project Overview

**KisanMitra** is an AI-powered digital farming assistant designed specifically for Indian farmers. Its vision is to provide intelligent, trustworthy, and easy-to-use decision support throughout the complete farming lifecycle. From crop planning and daily farm management to disease diagnosis, market intelligence, weather insights, government schemes, and farm progress tracking, KisanMitra serves as a one-stop solution for modern agriculture.

The platform bridges the gap between traditional farming and modern technology by seamlessly integrating artificial intelligence with trusted Government of India datasets and weather services, empowering farmers to make data-driven, informed decisions that maximize yield and profitability.

---

## 📑 Table of Contents
1. [Features](#-features)
2. [AI Components](#-ai-components)
3. [Government APIs & External Services](#-government-apis--external-services)
4. [Technology Stack](#-technology-stack)
5. [Project Architecture](#-project-architecture)
6. [Folder Structure](#-folder-structure)
7. [Installation & Setup Instructions](#-installation--setup-instructions)
8. [Environment Variables](#-environment-variables)
9. [Project Workflow](#-project-workflow)
10. [User Journey](#-user-journey)
11. [Feature Integration](#-feature-integration)
12. [Future Roadmap](#-future-roadmap)
13. [Known Limitations](#-known-limitations)
14. [Security Considerations](#-security-considerations)
15. [Performance Optimizations](#-performance-optimizations)
16. [Testing Strategy](#-testing-strategy)
17. [Contributing Guidelines](#-contributing-guidelines)
18. [License](#-license)
19. [Credits & Acknowledgements](#-credits--acknowledgements)

---

## ✨ Features

### Dashboard
* **Problem Solved:** Farmers need a unified view of their entire farm's status without navigating through multiple complex menus.
* **Usage:** Provides an at-a-glance summary of active crops, today's critical tasks, local weather summary, and recent market price alerts.
* **Data Required:** Active farm profile, location data, selected crop plan, and current date/time.
* **AI/Algorithms:** Prioritization algorithm for daily tasks and personalized alerts.
* **Integration:** Acts as the central hub, pulling aggregated data from Weather, Today's Work, Market Intelligence, and Farm Journey modules.

### Saved Farms & Farm Profiles
* **Problem Solved:** Managing multiple farm plots with different soil types, sizes, and irrigation facilities can be overwhelming.
* **Usage:** Farmers can register multiple farm plots with specific details (soil type, area, location).
* **Data Required:** Geolocation, soil type, total area, primary irrigation method.
* **Integration:** This core profile data feeds into the Seasonal Planner, Annual Planner, and Government Schemes filtering.

### Weather Intelligence
* **Problem Solved:** Unpredictable weather directly impacts farming activities like sowing, fertilizing, and harvesting.
* **Usage:** Displays current weather, 7-day forecast, and extreme weather alerts.
* **Data Required:** Farm geolocation and current date.
* **APIs:** External Weather API.
* **Integration:** Influences "Today's Work" (e.g., rescheduling spraying if rain is predicted) and Market Intelligence (transportation feasibility).

### Seasonal Planner
* **Problem Solved:** Choosing the right crop and variety for a specific season is complex and prone to errors.
* **Usage:** A one-time crop cultivation planner. The farmer inputs their farm details, and the system recommends the best crops and specific varieties for the upcoming season.
* **Data Required:** Farm location, soil type, irrigation, previous crop (for rotation), planting month, climate data, and farmer preferences.
* **AI/Algorithms:** AI-driven crop recommendation engine and variety recommendation logic using Gemini API.
* **Integration:** **Selecting a plan here automatically creates an active crop lifecycle** that powers Today's Work, Farm Journey, Disease Diagnosis, Weather Intelligence, and Market Intelligence.

### Annual Planner
* **Problem Solved:** Long-term crop rotation and year-round farm planning are critical for soil health and sustained income.
* **Usage:** Generates a complete Kharif–Rabi–Zaid crop rotation plan. Allows farmers to choose preferred crops alongside AI-recommended varieties, creating a comprehensive year-long farming schedule.
* **Data Required:** Regional climate history, farm profile, market trends.
* **AI/Algorithms:** Crop rotation optimization algorithm.
* **Integration:** Feeds directly into the Dashboard, Today's Work (scheduling long-term tasks), Farm Journey, Weather, and Market modules, ensuring seamless transitions between seasons.

### Today's Work
* **Problem Solved:** Farmers often lack a structured daily schedule based on scientific crop lifecycles.
* **Usage:** Dynamically generates daily tasks based on the currently active farming plan rather than relying on static reminders.
* **Data Required:** Active crop lifecycle stage, real-time weather, and farm profile.
* **AI/Algorithms:** Dynamic scheduling algorithm that adjusts tasks based on weather delays or early growth.
* **Integration:** Completed tasks automatically update the **Farm Journey**.

### Farm Journey
* **Problem Solved:** Keeping manual records of farm activities, expenditures, and treatments is tedious and often lost.
* **Usage:** Serves as the historical timeline of the farm. Shows completed activities, current crop stage, upcoming tasks, disease history, treatment records, fertilizer applications, and previous crop plans.
* **Data Required:** Task completion logs, disease diagnosis logs, and historical crop data.
* **Integration:** Consolidates data from Today's Work and Disease Diagnosis to build a comprehensive farm ledger.

### Disease Diagnosis
* **Problem Solved:** Identifying crop diseases early and accurately is difficult without immediate access to agricultural experts.
* **Usage:** Farmers upload images of affected plant leaves. The system diagnoses the disease and generates a comprehensive treatment plan.
* **Data Required:** Image of the crop leaf, crop type.
* **AI/Algorithms:** Uses **EfficientNet** deep learning models deployed through **ONNX Runtime** for fast, edge-friendly inference. AI-generated treatment plans include organic remedies, inorganic remedies, fertilizer recovery plans, and treatment schedules.
* **Integration:** Diagnosis events and treatment schedules are automatically integrated into Today's Work and recorded in the Farm Journey.

### Market Intelligence
* **Problem Solved:** Farmers struggle to find the best market prices and often sell to middlemen at a loss.
* **Usage:** Helps farmers decide where and when to sell their crops by showing nearby mandi discovery, MSP comparison, transportation cost estimation, weather suitability for transport, and rule-based price alerts.
* **Data Required:** Crop type, harvest volume, location, current market datasets.
* **APIs:** Trusted Government of India datasets (AGMARKNET, Data.gov).
* **Integration:** Uses Weather data for transport advice. *Note: The application explicitly relies on verified government data and never generates speculative market prices or unsupported AI predictions.*

### Government Schemes
* **Problem Solved:** Many farmers are unaware of or unable to navigate the complex landscape of government subsidies and schemes.
* **Usage:** Automatically filters relevant schemes and subsidies based on the user's profile.
* **Data Required:** Farmer profile information, crop details, location, and landholding size.
* **APIs:** Data.gov scheme datasets.
* **Integration:** Connects with the Farm Profile to ensure only applicable schemes are presented.

### Settings
* **Problem Solved:** Personalization of app experience.
* **Usage:** Manage profile, notification preferences, units of measurement, and language settings.

### Authentication & User Management
* **Problem Solved:** Secure access to personal farm data.
* **Usage:** Secure login via phone number (OTP) or email using Firebase Authentication.

### Voice Support / Multilingual Support
* **Problem Solved:** Literacy and language barriers prevent technology adoption in rural areas.
* **Usage:** Voice-to-text input for searching and multilingual UI support for regional Indian languages.

---

## 🧠 AI Components

KisanMitra leverages artificial intelligence carefully, distinguishing clearly between predictive AI, rule-based logic, and trusted government data:

1. **Crop Recommendation Engine:** Uses predictive AI (Gemini API) and regional datasets to suggest the most viable crops based on complex environmental variables.
2. **Crop Variety Recommendation:** Recommends specific, resilient seed varieties suited for the farmer's exact micro-climate.
3. **Disease Diagnosis using EfficientNet:** A locally/cloud-hosted ONNX model trained on agricultural datasets that performs image classification to detect plant diseases with high accuracy.
4. **AI Treatment Generation:** Combines the diagnosis output with agricultural best practices (via Gemini API) to generate actionable, localized treatment steps (organic/inorganic).
5. **Daily Task Generation:** Rule-based AI that dynamically adjusts the crop lifecycle calendar based on real-time inputs (e.g., weather).
6. **Farming Plan Generation:** Algorithmic planner that constructs the Annual (Kharif/Rabi/Zaid) rotation schedule.
7. **Agricultural Advisory Engine:** Conversational interface (if applicable) powered by LLMs, restricted to trusted agricultural guidelines.

---

## 🏛️ Government APIs & External Services

We prioritize trustworthy information by integrating directly with verified sources:

| Service / Dataset | Purpose within Application |
| :--- | :--- |
| **AGMARKNET Current Daily Mandi Prices** | Provides real-time pricing data for crops at nearby agricultural markets, powering Market Intelligence. |
| **Variety-wise Commodity Prices** | Ensures farmers get accurate pricing estimates for their specific crop variety. |
| **Minimum Support Price (MSP) Dataset** | Allows farmers to compare local mandi prices against the government-mandated baseline. |
| **Cold Storage Dataset** | Helps farmers locate nearby cold storage facilities if market prices are currently unfavorable. |
| **Weather API** | Provides current weather and forecasts for the Dashboard, Today's Work scheduling, and transport planning. |
| **Gemini API** | Powers the dynamic, natural-language generation of crop recommendations and personalized treatment plans based on context. |

---

## 💻 Technology Stack

* **Frontend:** React.js, Vite, Tailwind CSS, Lucide React (Icons), React Router
* **Backend:** Node.js, Express.js (API routing)
* **ML Backend:** Python, ONNX Runtime (for EfficientNet inference), Flask/FastAPI (for ML serving)
* **Database & Auth:** Firebase (Firestore, Authentication)
* **Hosting & Deployment:** Vercel (Frontend), Firebase Functions/Cloud Run (Backend APIs)
* **State Management:** React Context API / Hooks

---

## 🏗️ Project Architecture

KisanMitra utilizes a decoupled, microservices-inspired architecture:

1. **Frontend (React/Vite):** Manages user interactions, state, and UI. Communicates securely with backend services via REST APIs.
2. **Node.js Backend:** Acts as the primary gateway. It handles user requests, interacts with Firebase for CRUD operations (Farm profiles, Task generation), and fetches data from Government APIs.
3. **ML Backend (Python/ONNX):** A dedicated, high-performance microservice. When a user uploads a leaf image, the Node backend forwards it to the ML backend. The ONNX Runtime processes the image through the EfficientNet model and returns the diagnosis.
4. **AI/LLM Integration:** The Node backend securely calls the Gemini API, combining the ONNX diagnosis with prompt engineering to return a formatted treatment plan.
5. **Data Flow (Planners):** When an Annual/Seasonal plan is selected, the Node backend calculates the lifecycle and populates the Firestore database with a schedule. The Frontend listens to these Firestore documents to dynamically update the Dashboard and Today's Work.

---

## 📂 Folder Structure

```text
KisanMitra/
├── api/                    # Serverless functions / backend entry points
├── dataset/                # Scripts or samples for mock data / local DB init
├── ml_backend/             # Python ML service (ONNX Runtime, EfficientNet)
├── public/                 # Static assets (images, icons, manifest)
├── server/                 # Node.js/Express backend service code
├── src/                    # React Frontend source code
│   ├── assets/             # Frontend static assets
│   ├── components/         # Reusable React components (UI elements)
│   ├── pages/              # Main view components (Dashboard, Planner, etc.)
│   ├── context/            # React Context providers for state management
│   ├── utils/              # Helper functions and constants
│   ├── services/           # API call wrappers (Firebase, backend fetchers)
│   ├── App.jsx             # Main application routing
│   └── main.jsx            # React DOM entry point
├── .env.example            # Example environment variables
├── package.json            # Node project dependencies
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite build configuration
```

---

## 🚀 Installation & Setup Instructions

### Prerequisites
* Node.js (v18+)
* Python (v3.9+)
* Firebase Account
* Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/KisanMitra.git
cd KisanMitra
```

### 2. Frontend Setup
```bash
npm install
# Set up environment variables (see below)
npm run dev
```

### 3. Node.js Backend Setup (if running separately)
```bash
cd server
npm install
npm start
```

### 4. ML Backend (Disease Diagnosis Server) Setup
```bash
cd ml_backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
# Alternatively, use the provided batch script for Windows:
# ..\start_ml_backend.bat
python app.py
```

---

## 🔐 Environment Variables

Create a `.env` file in the root and `server` directories as needed. **Never expose actual API keys or secrets in public repositories.**

| Variable | Description |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Firebase configuration API key for frontend auth. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain. |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project identifier. |
| `VITE_WEATHER_API_KEY` | Key for the external weather service API. |
| `GEMINI_API_KEY` | Google Gemini API key used in the backend for AI generation. |
| `ML_BACKEND_URL` | URL pointing to the local/hosted Python ONNX inference server. |
| `GOVT_DATA_API_KEY` | API Key for Data.gov.in / AGMARKNET data access. |

---

## 🔄 Project Workflow

1. **Onboarding:** Farmer registers, creates a farm profile (soil, location, size).
2. **Planning:** Uses Seasonal/Annual planner to select crops.
3. **Execution:** The system generates a timeline. Every day, the farmer checks "Today's Work" and marks tasks as complete.
4. **Monitoring:** Farmer logs completed tasks, which move to the "Farm Journey". Weather updates adjust future tasks.
5. **Intervention:** If crops look sick, farmer uses Disease Diagnosis. Treatment is immediately added to Today's Work.
6. **Harvest & Sale:** At harvest, Market Intelligence helps the farmer decide where to sell based on live AGMARKNET data and transport weather.

---

## 🚶 User Journey

* **Morning:** Opens app, views Dashboard. Checks weather for rain. Looks at Today's Work (e.g., "Apply Urea").
* **Afternoon:** Notices yellowing leaves. Takes a photo. App diagnoses "Nitrogen Deficiency" and suggests a recovery plan. Farmer clicks "Add to Schedule".
* **Evening:** Marks today's tasks as completed. Checks Market Intelligence to see current MSP for upcoming harvest.

---

## 🧩 Feature Integration

KisanMitra is deeply interconnected:
* **Plan → Tasks:** Planners generate the active crop schema, which feeds the Daily Tasks engine.
* **Tasks → Journey:** Daily completion logs build the Farm Journey ledger.
* **Weather → Tasks/Market:** Weather APIs dynamically shift task schedules and advise on crop transport viability.
* **Diagnosis → Journey:** Disease identification logs are permanently stored in the farm's history for future reference.

---

## 🛤️ Future Roadmap

* **IoT Integration:** Connecting with smart soil moisture sensors for automated irrigation alerts.
* **Drone Imagery:** Supporting aerial field scans for large-scale disease detection.
* **B2B Marketplace:** Direct connection with verified buyers, eliminating middlemen entirely.
* **Financial Services:** Integration with micro-lending and crop insurance platforms using Farm Journey data as credit history.

---

## ⚠️ Known Limitations

* **Internet Dependency:** While UI caching exists, real-time AI inference and market data require an active internet connection.
* **Dataset Latency:** Government APIs occasionally experience latency or delayed updates; fallback mechanisms use the last known data.
* **Model Constraints:** The EfficientNet model is highly accurate but limited to the specific crops and diseases present in its training dataset.

---

## 🛡️ Security Considerations

* **Data Privacy:** Farm location and yield data are secured via Firebase Security Rules; users can only access their own farm profiles.
* **API Security:** All sensitive API calls (Gemini, Govt datasets) are routed through the secure backend, preventing key exposure on the frontend.
* **Image Uploads:** Uploaded images for disease diagnosis are processed temporarily and deleted, not used for unauthorized model training.

---

## ⚡ Performance Optimizations

* **ONNX Runtime:** ML inference is optimized using ONNX, ensuring low latency and reduced compute costs compared to standard PyTorch/TensorFlow serving.
* **Lazy Loading:** React components and heavy assets are lazy-loaded to ensure fast time-to-interactive for users on slower mobile networks.
* **NoSQL Structuring:** Firestore database is denormalized for rapid read operations required by the Dashboard and Today's Work views.

---

## 🧪 Testing Strategy

* **Frontend:** Component testing using Jest/React Testing Library to verify UI logic and state changes.
* **Backend:** API endpoint testing using Postman/Supertest to validate data transformations and external API integrations.
* **ML Model:** Evaluated against a reserved validation dataset using standard metrics (Precision, Recall, F1-Score) before ONNX conversion.

---

## 🤝 Contributing Guidelines

We welcome contributions to make KisanMitra better!
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
Please ensure your code follows our linting rules and includes relevant tests.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Credits & Acknowledgements

* **Government of India:** For providing open data platforms (Data.gov.in, AGMARKNET).
* **Google DeepMind / Gemini:** For powering the generative AI advisory capabilities.
* **Open Source Community:** For React, Vite, Tailwind CSS, ONNX Runtime, and the countless other libraries that made this project possible.

---
*Built with ❤️ for the Farmers of India.*
