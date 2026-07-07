import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { useUploadDiagnosis } from '../hooks/useDiagnosis';
import { useDiagnosisContext } from '../context/DiagnosisContext';

const DEFAULT_FARM_ID = 'FARM-001';

const CROPS = ['Wheat', 'Corn', 'Cotton', 'Maize', 'Potato', 'Rice', 'Tomato'];

const DiagnosisHome: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    selectedCrop, setSelectedCrop,
    uploadedImage, setUploadedImage,
    setPredictionData, setCaseId, setGeminiTreatment,
  } = useDiagnosisContext();

  const [farmTab, setFarmTab] = useState<'saved' | 'manual'>('manual');
  const [inputTab, setInputTab] = useState<'image' | 'symptoms'>('image');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');

  const { mutate, isPending } = useUploadDiagnosis();

  // Convert file to base64 data URL so it persists after DiagnosisHome unmounts
  useEffect(() => {
    if (!selectedFile) {
      setUploadedImage(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string ?? null);
    };
    reader.readAsDataURL(selectedFile);
  }, [selectedFile, setUploadedImage]);

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must be under 10MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDiagnose = () => {
    setErrorMsg(null);
    if (!selectedCrop) {
      setErrorMsg('Please select a crop before diagnosing.');
      return;
    }
    if (inputTab === 'image' && !selectedFile) {
      setErrorMsg('Please upload a crop image before diagnosing.');
      return;
    }

    mutate({ file: selectedFile!, farmId: DEFAULT_FARM_ID, crop: selectedCrop.toLowerCase() }, {
      onSuccess: (data) => {
        // Clear stale Gemini treatment so fresh data is fetched for this new disease
        setGeminiTreatment(null);
        setPredictionData(data);
        setCaseId(data.case_details.case_id);
        navigate(`/diagnosis/results/${data.case_details.case_id}`);
      },
      onError: (err) => {
        setErrorMsg(err.message || 'Failed to upload image for prediction.');
      },
    });
  };

  return (
    <>
      <Navigation />
      <main className="p-margin-mobile md:p-margin-desktop max-w-[1280px] mx-auto pt-16 md:pt-12 pb-32">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">healing</span>
            Disease Diagnosis
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden max-w-2xl">
          <div className="p-6 md:p-8">
            {/* Provide Information */}
            <h2 className="font-headline-md text-on-surface mb-1">Provide Information</h2>
            <p className="font-body-md text-on-surface-variant mb-5">Select a farm or enter details manually, then provide an image or symptoms.</p>

            {/* Farm Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-outline-variant mb-6">
              <button
                onClick={() => setFarmTab('saved')}
                className={`flex-1 py-3 font-button text-sm transition-colors ${farmTab === 'saved' ? 'bg-surface-container-high text-on-surface' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                Use a Saved Farm
              </button>
              <button
                onClick={() => setFarmTab('manual')}
                className={`flex-1 py-3 font-button text-sm transition-colors ${farmTab === 'manual' ? 'bg-surface-container-high text-on-surface' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                Enter Details Manually
              </button>
            </div>

            {/* Crop Name dropdown */}
            <div className="mb-6">
              <label className="block font-label-lg text-on-surface mb-1.5">
                Crop Name<span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full h-[52px] px-4 pr-10 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition font-body-md appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Crop</option>
                  {CROPS.map(c => (
                    <option key={c} value={c.toLowerCase()}>{c}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[22px]">expand_more</span>
              </div>
            </div>

            {/* Image / Symptoms Tabs */}
            <div className="flex rounded-xl overflow-hidden border border-outline-variant mb-5">
              <button
                onClick={() => setInputTab('image')}
                className={`flex-1 py-3 font-button text-sm transition-colors ${inputTab === 'image' ? 'bg-surface-container-high text-on-surface' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                Image Upload
              </button>
              <button
                onClick={() => setInputTab('symptoms')}
                className={`flex-1 py-3 font-button text-sm transition-colors ${inputTab === 'symptoms' ? 'bg-surface-container-high text-on-surface' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                Describe Symptoms
              </button>
            </div>

            {/* Input Content */}
            {inputTab === 'image' ? (
              <div
                className="border-2 border-dashed border-outline-variant rounded-xl min-h-[260px] flex flex-col items-center justify-center bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {isPending ? (
                  <LoadingOverlay />
                ) : uploadedImage ? (
                  <div className="w-full flex flex-col items-center p-4">
                    <div className="rounded-xl overflow-hidden mb-4 shadow-md" style={{ maxWidth: 260 }}>
                      <img src={uploadedImage} alt="Uploaded crop" className="w-full object-cover rounded-xl" style={{ maxHeight: 210 }} />
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-5 py-2.5 border border-outline-variant rounded-full bg-surface text-on-surface font-button text-sm hover:bg-surface-container-high transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">upload</span>
                      Change Image
                    </button>
                    <p className="text-xs text-on-surface-variant mt-3">Upload a clear photo of the affected plant part.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 px-4">
                    <span className="material-symbols-outlined text-[52px] text-primary opacity-60 mb-3">cloud_upload</span>
                    <h4 className="font-headline-md text-[18px] text-on-surface mb-1">Drag and drop your photo here</h4>
                    <p className="font-body-md text-on-surface-variant mb-6 text-sm max-w-xs text-center">Ensure the leaf or affected area is clearly visible and well-lit.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-[48px] px-6 bg-surface text-primary border border-outline rounded-full font-button text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">folder_open</span>
                        Browse Files
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-[48px] px-6 bg-surface text-primary border border-outline rounded-full font-button text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                        Take Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe the symptoms you see on your crop: leaf color, spots, wilting, etc."
                rows={6}
                className="w-full px-4 py-3 border border-outline-variant rounded-xl bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition font-body-md resize-none"
              />
            )}

            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleChange}
              accept="image/*"
            />

            {/* Error message — outside the upload zone so it never overlaps the image */}
            {errorMsg && (
              <div className="mt-3 bg-error-container text-on-error-container px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                {errorMsg}
              </div>
            )}

            {/* Diagnose Button */}
            <div className="mt-5">
              <button
                onClick={handleDiagnose}
                disabled={isPending}
                className="h-[52px] px-8 bg-primary text-on-primary rounded-xl font-button flex items-center gap-2 shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[22px]">biotech</span>
                {isPending ? 'Diagnosing...' : 'Diagnose Problem'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button (Voice Assistant) */}
      <button
        aria-label="Speak to Assistant"
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 w-16 h-16 bg-secondary-container text-on-secondary-container rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 z-50 group"
      >
        <span className="material-symbols-outlined text-[32px] group-hover:animate-pulse">mic</span>
      </button>
    </>
  );
};

export default DiagnosisHome;
