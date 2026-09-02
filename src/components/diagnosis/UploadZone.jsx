import React from 'react';
import { Upload, Leaf, MapPin, ShieldAlert, Sparkles } from 'lucide-react';

export function UploadZone({
  farmSource,
  setFarmSource,
  activeFarm,
  manualCrop,
  setManualCrop,
  manualLocation,
  setManualLocation,
  imagePreview,
  handleImageUpload,
  fileInputRef,
  handleDiagnose,
  currentCrop,
  currentLocation
}) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/60 shadow-xs space-y-6">
      {/* 1. Header & Source Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-container pb-5">
        <div>
          <h2 className="font-display font-bold text-xl text-on-surface flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span>AI Crop Disease Diagnosis</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Upload a clear photo of an infected leaf to receive instant diagnosis & dosage calculator.
          </p>
        </div>

        <div className="flex bg-surface-container p-1 rounded-2xl border border-outline-variant/40 shrink-0">
          <button
            type="button"
            onClick={() => setFarmSource('saved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              farmSource === 'saved'
                ? 'bg-white text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Saved Farm
          </button>
          <button
            type="button"
            onClick={() => setFarmSource('manual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              farmSource === 'manual'
                ? 'bg-white text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      {/* 2. Farm Context Input */}
      {farmSource === 'saved' ? (
        <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-on-surface">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">Active Farm:</span>
            <span>{activeFarm?.name || 'Green Field Acres'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">Crop:</span>
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">{currentCrop}</span>
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant">
            <MapPin className="w-3.5 h-3.5" />
            <span>{currentLocation}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Select Crop</label>
            <input
              type="text"
              placeholder="e.g. Wheat, Rice, Potato, Tomato"
              value={manualCrop}
              onChange={(e) => setManualCrop(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Location (District/State)</label>
            <input
              type="text"
              placeholder="e.g. Nashik, Maharashtra"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* 3. Image Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-all rounded-3xl p-8 text-center cursor-pointer flex flex-col items-center justify-center min-h-[220px]"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {imagePreview ? (
          <div className="relative group max-w-xs">
            <img
              src={imagePreview}
              alt="Crop Leaf Preview"
              className="w-full max-h-48 object-cover rounded-2xl shadow-md border border-outline-variant/60"
            />
            <div className="mt-2 text-xs font-bold text-primary">Click to change leaf photo</div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center text-primary mx-auto">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">Click or drag crop leaf photo here</p>
              <p className="text-xs text-on-surface-variant mt-1">Supports JPG, PNG, WEBP files up to 10MB</p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Button */}
      <button
        type="button"
        onClick={handleDiagnose}
        className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
      >
        <Sparkles className="w-4 h-4" />
        <span>Run Disease Diagnosis & Treatment Plan</span>
      </button>
    </div>
  );
}
