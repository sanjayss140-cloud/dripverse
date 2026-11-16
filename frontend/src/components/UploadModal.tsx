import React, { useState, useRef } from 'react';
import { UploadCloud, X, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { WardrobeItem } from '../types';
import { api } from '../api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newItems: WardrobeItem[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analyzedResults, setAnalyzedResults] = useState<WardrobeItem[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    const valid = files.filter((f) => ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type));
    if (valid.length < files.length) {
      setErrorMessage('Some files were ignored because only JPG, PNG, and WEBP are supported.');
    } else {
      setErrorMessage(null);
    }

    setSelectedFiles((prev) => [...prev, ...valid]);
    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress(20);

    try {
      const interval = setInterval(() => {
        setUploadProgress((p) => (p < 85 ? p + 15 : p));
      }, 300);

      const items = await api.uploadWardrobeItems(selectedFiles);
      clearInterval(interval);
      setUploadProgress(100);
      setAnalyzedResults(items);
      onSuccess(items);
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed. Please check image format.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-studio-card border border-studio-border rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-studio-border mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-studio-accentSubtle border border-studio-accent/20 flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-studio-accent" />
            </div>
            <div>
              <h3 className="text-base font-bold text-studio-text font-display">Add to Wardrobe</h3>
              <p className="text-xs text-studio-muted">AI automatically detects category, palette, fabric & style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-studio-muted hover:text-studio-text hover:bg-studio-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-2.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* If Analyzed Results Available: Show AI Insights Summary */}
        {analyzedResults ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-studio-accentSubtle border border-studio-accent/20 flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-studio-text">AI Vision Analysis Complete!</h4>
                <p className="text-[11px] text-studio-muted">
                  {analyzedResults.length} garments categorized with transparent cutouts created.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {analyzedResults.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-studio-secondary border border-studio-border flex items-center space-x-3"
                >
                  <img
                    src={item.clean_image_url || item.image_url}
                    alt={item.name}
                    className="w-14 h-14 object-contain rounded-lg bg-studio-card p-1 border border-studio-border"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-studio-text truncate">{item.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-studio-accentSubtle text-studio-accent font-medium">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-studio-muted">{item.pattern}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-studio-accent hover:bg-studio-accentHover text-white font-semibold text-xs transition-all shadow-studio-sm"
            >
              View Wardrobe
            </button>
          </div>
        ) : (
          /* Normal Upload Dropzone */
          <div className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-studio-border hover:border-studio-accent rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-studio-secondary hover:bg-studio-accentSubtle/30 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-12 h-12 rounded-full bg-studio-accentSubtle border border-studio-accent/20 flex items-center justify-center mb-3 transition-all group-hover:scale-110">
                <UploadCloud className="w-6 h-6 text-studio-accent" />
              </div>
              <p className="text-xs font-semibold text-studio-text">Drag & drop your clothing photos here</p>
              <p className="text-[11px] text-studio-muted mt-1">or click to browse from device (JPG, PNG, WEBP)</p>
            </div>

            {/* Selected Previews Grid */}
            {previews.length > 0 && (
              <div>
                <p className="text-xs font-medium text-studio-text mb-2">Selected ({previews.length})</p>
                <div className="grid grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden bg-studio-secondary border border-studio-border aspect-square">
                      <img src={src} alt="Preview" className="w-full h-full object-contain p-1.5" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(i);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-studio-accent flex items-center space-x-1.5 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing garments & generating cutouts...</span>
                  </span>
                  <span className="text-studio-muted">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-studio-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-studio-accent transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-studio-muted hover:text-studio-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedFiles.length === 0 || isUploading}
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl bg-studio-accent hover:bg-studio-accentHover disabled:opacity-50 text-white font-semibold text-xs flex items-center space-x-2 transition-all shadow-studio-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Process & Save ({selectedFiles.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
