import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadDiagnosis } from '../hooks/useDiagnosis';
import { useDiagnosisContext } from '../context/DiagnosisContext';
import { LoadingOverlay } from './LoadingOverlay';

interface UploadWorkspaceProps {
  farmId: string;
}

const UploadWorkspace: React.FC<UploadWorkspaceProps> = ({ farmId }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    selectedCrop, setSelectedCrop, 
    uploadedImage, setUploadedImage, 
    setPredictionData, setCaseId 
  } = useDiagnosisContext();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { mutate, isPending } = useUploadDiagnosis();

  // Create preview URL when file is selected
  useEffect(() => {
    if (!selectedFile) {
      setUploadedImage(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setUploadedImage(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile, setUploadedImage]);

  const handleFileSelect = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg("Please upload a valid image file (JPG, PNG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size must be under 10MB.");
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
      setErrorMsg("Please select a crop type before diagnosing.");
      return;
    }
    if (!selectedFile) {
      setErrorMsg("Please upload a crop image before diagnosing.");
      return;
    }

    mutate({ file: selectedFile, farmId, crop: selectedCrop }, {
      onSuccess: (data) => {
        setPredictionData(data);
        setCaseId(data.case_details.case_id);
        navigate(`/diagnosis/results/${data.case_details.case_id}`);
      },
      onError: (err) => {
        setErrorMsg(err.message || "Failed to upload image for prediction.");
      }
    });
  };

  const handleClear = () => {
    setSelectedFile(null);
    setErrorMsg(null);
  };

  return (
    <div className="lg:col-span-2">
      <h3 className="font-headline-md text-headline-md-mobile text-on-surface mb-4">Upload Workspace</h3>
      <div 
        className={`border-2 border-dashed ${errorMsg ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[400px] transition-colors duration-200 hover:bg-surface-container-low relative`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {isPending ? (
          <LoadingOverlay />
        ) : (
          <>
            {errorMsg && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg mb-6 text-sm font-medium w-full max-w-md flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]" data-icon="error">error</span>
                {errorMsg}
              </div>
            )}

            {!uploadedImage ? (
              <div className="flex flex-col items-center justify-center h-full">
                <span className="material-symbols-outlined text-[48px] text-primary mb-4 opacity-70" data-icon="cloud_upload">cloud_upload</span>
                <h4 className="font-headline-md text-[20px] text-on-surface mb-2">Drag and drop your photo here</h4>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-sm">Ensure the leaf or affected area is clearly visible and well-lit.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <button 
                    className="h-[56px] px-8 bg-surface text-primary border border-outline rounded-full font-button text-button flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all duration-200 active:scale-95"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="material-symbols-outlined" data-icon="folder_open">folder_open</span>
                    Browse Files
                  </button>
                  <button 
                    className="h-[56px] px-8 bg-surface text-primary border border-outline rounded-full font-button text-button flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-all duration-200 active:scale-95"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="material-symbols-outlined" data-icon="photo_camera">photo_camera</span>
                    Take Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full">
                <div className="relative group rounded-xl overflow-hidden shadow-md mb-6 w-full max-w-md aspect-video bg-surface-variant">
                  <img src={uploadedImage} alt="Crop Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-12 h-12 bg-surface text-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                      title="Replace Image"
                    >
                      <span className="material-symbols-outlined text-[24px]" data-icon="edit">edit</span>
                    </button>
                    <button 
                      onClick={handleClear}
                      className="w-12 h-12 bg-error-container text-on-error-container rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                      title="Remove Image"
                    >
                      <span className="material-symbols-outlined text-[24px]" data-icon="delete">delete</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <select 
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="flex-1 h-[56px] px-6 bg-surface text-primary border border-outline rounded-full font-button text-button focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm appearance-none flex items-center min-w-[150px]"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23154212%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
                  >
                    <option value="" disabled>Select Crop</option>
                    <option value="wheat">Wheat</option>
                    <option value="corn">Corn</option>
                    <option value="cotton">Cotton</option>
                    <option value="maize">Maize</option>
                    <option value="potato">Potato</option>
                    <option value="rice">Rice</option>
                    <option value="tomato">Tomato</option>
                  </select>

                  <button 
                    className="h-[56px] px-8 bg-primary text-on-primary rounded-full font-button text-button flex items-center justify-center gap-2 hover:bg-primary-container hover:text-on-primary-container shadow-md transition-all duration-200 active:scale-95 whitespace-nowrap"
                    onClick={handleDiagnose}
                  >
                    <span className="material-symbols-outlined" data-icon="analytics">analytics</span>
                    Diagnose
                  </button>
                </div>
              </div>
            )}

            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleChange}
              accept="image/*"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UploadWorkspace;
