import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { ChevronLeft, ChevronRight, Upload, Clipboard, X } from 'lucide-react';
import { PoCImage, VulnerabilityData } from '../types';

interface ImageUploadWizardProps {
  vulnerabilities: VulnerabilityData[];
  onClose: () => void;
  onComplete: (images: PoCImage[]) => void;
}

const ImageUploadWizard: React.FC<ImageUploadWizardProps> = ({
  vulnerabilities,
  onClose,
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<PoCImage[]>([]);
  const pasteAreaRef = useRef<HTMLDivElement>(null);
  const currentVuln = vulnerabilities[currentIndex];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setImages(prev => [...prev, {
            id: `${Date.now()}-${file.name}`,
            dataUrl,
            vulnerabilityName: currentVuln.name
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [currentVuln]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp']
    },
    multiple: true
  });

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            if (dataUrl) {
              setImages(prev => [...prev, {
                id: `${Date.now()}-pasted-${i}`,
                dataUrl,
                vulnerabilityName: currentVuln.name
              }]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }, [currentVuln]);

  const focusPasteArea = () => {
    pasteAreaRef.current?.focus();
  };

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleNext = () => {
    if (currentIndex < vulnerabilities.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(images);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const currentImages = images.filter(img => img.vulnerabilityName === currentVuln.name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold">
              Upload Evidence for: {currentVuln.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Progress: {currentIndex + 1} of {vulnerabilities.length} vulnerabilities
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* Two distinct upload zones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* File Upload Zone */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Upload size={20} className="text-blue-500" />
                <span>File Upload Zone</span>
              </h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' 
                    : 'border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 bg-blue-25 dark:bg-blue-900 dark:bg-opacity-10'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <Upload size={48} className="mb-4 text-blue-500" />
                  <p className="text-lg font-medium mb-2 text-blue-700 dark:text-blue-300">
                    {isDragActive ? 'Drop images here' : 'Drag & Drop Images'}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Supports: JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>
            </div>

            {/* Paste Zone */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Clipboard size={20} className="text-green-500" />
                <span>Paste Zone</span>
              </h3>
              <div
                ref={pasteAreaRef}
                tabIndex={0}
                onPaste={handlePaste}
                onClick={focusPasteArea}
                className="border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 dark:hover:border-green-500 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-25 dark:bg-green-900 dark:bg-opacity-10"
              >
                <div className="flex flex-col items-center">
                  <Clipboard size={48} className="mb-4 text-green-500" />
                  <p className="text-lg font-medium mb-2 text-green-700 dark:text-green-300">
                    Click & Paste Images
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                    Click here, then press Ctrl+V (Cmd+V on Mac)
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Perfect for screenshots from clipboard
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Images */}
          {currentImages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Uploaded Images ({currentImages.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative border rounded-lg overflow-hidden group bg-gray-50 dark:bg-gray-700 hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={image.dataUrl}
                      alt="PoC"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 rounded-full
                        opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} className="text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                      <p className="text-xs truncate">Evidence #{currentImages.indexOf(image) + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={handleBack}
            disabled={currentIndex === 0}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
              currentIndex === 0
                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentImages.length} image{currentImages.length !== 1 ? 's' : ''} for this vulnerability
          </div>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <span>{currentIndex === vulnerabilities.length - 1 ? 'Finish' : 'Next'}</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadWizard;