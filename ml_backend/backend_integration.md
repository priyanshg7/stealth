# KisanMitra Backend Integration Guide

This guide details how the primary backend (e.g., NodeJS, Java, or Django) and the Mobile Frontend should interact with the ML Inference Engine via the FastAPI service.

## 1. Engine Configuration
The inference engine exposes a robust HTTP interface running natively on port `8000`. If deploying via Docker, it is exposed on the host's `8000` port. 

All endpoints are prefixed with `/api/v1/`.

## 2. API Endpoints

### 2.1 Health Check (Server Metrics)
**Endpoint:** `GET /api/v1/health`
**Description:** Verifies that the FastAPI server is running and displays the currently cached ONNX models to monitor memory footprints.

**Response:**
```json
{
  "status": "healthy",
  "loaded_models": ["tomato", "potato"],
  "memory_usage_mb": 145.32,
  "version": "1.0.0"
}
```

### 2.2 Model Catalog
**Endpoint:** `GET /api/v1/models`
**Description:** Returns the active model registry containing the highest-accuracy available crops. Use this API on the mobile app to populate the "Crop Dropdown" natively!

**Response:**
```json
{
  "available_models": [
    {
      "crop": "tomato",
      "version": "1.0.0",
      "accuracy": 0.9978,
      "classes_supported": 10
    }
  ]
}
```

### 2.3 Diagnosis Prediction (Core API)
**Endpoint:** `POST /api/v1/diagnosis/predict`
**Description:** The primary inference endpoint. It accepts an image, farm parameters, dynamically lazy-loads the requested crop's ONNX model into memory, predicts the disease, evaluates confidence constraints, and calculates farm dosages and treatment options.

**Headers:**
- `Content-Type: multipart/form-data`

**Form Payload (Body):**
- `image`: [File Blob] (The uploaded JPG/PNG image)
- `crop_name`: (String) e.g., "tomato", "wheat"
- `farm_id`: (String, Optional)
- `farm_size_acres`: (Float, Optional, Default=1.0)

**Response:**
```json
{
  "farm_id": "unknown",
  "disease": "early_blight",
  "confidence": 0.93241,
  "message": "Confident diagnosis.",
  "top_predictions": [
    {
      "disease": "early_blight",
      "confidence": 0.93241
    },
    {
      "disease": "late_blight",
      "confidence": 0.05100
    }
  ],
  "model_version": "1.0.0",
  "inference_time_ms": 34,
  "treatment": {
    "organic_treatment": "Apply neem oil...",
    "chemical_treatment": "Use targeted fungicide...",
    "preventive_measures": "Rotate crops...",
    "medicine": "Standard Fungicide",
    "recovery_time": "7-14 days",
    "dosage_per_acre": "Follow dosage recommendations"
  },
  "dosage": {
    "medicine_quantity_liters": 1.5,
    "water_quantity_liters": 200.0,
    "estimated_cost_usd": 22.5
  }
}
```

### 2.4 Model Hot-Reload
**Endpoint:** `POST /api/v1/reload`
**Description:** If new `.onnx` models are placed in the `/models/onnx` directory and the `/models/metadata/registry.json` is updated, calling this endpoint will drop the active cache and reload the models from disk seamlessly without dropping active user connections.

## 3. Workflow for Backend Services
1. The user takes a picture of a leaf in the KisanMitra Mobile App.
2. The user selects the crop type (e.g. "Wheat") and their farm size in acres.
3. The App creates a `multipart/form-data` payload and POSTs it directly to `/api/v1/diagnosis/predict`.
4. The Inference API returns the full unified JSON payload containing the diagnosis, treatments, and dosage.
5. The App renders the UI instantly without needing further API hops.
