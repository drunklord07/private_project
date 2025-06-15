import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileLoaded: (data: any[], sheets: { [key: string]: any[] }) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileStats, setFileStats] = useState<{ vulnerabilities: number; observations: number; scope: number } | null>(null);

  const processExcelFile = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);
    setFileStats(null);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Failed to read file');
        }
        
        console.log('📊 Processing Excel file:', file.name, 'Size:', file.size, 'bytes');
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheets: { [key: string]: any[] } = {};
        
        console.log('📋 Found sheets:', workbook.SheetNames);
        
        // Process each sheet with error handling
        workbook.SheetNames.forEach(sheetName => {
          try {
            const worksheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(worksheet);
            sheets[sheetName] = sheetData;
            console.log(`✅ Sheet "${sheetName}": ${sheetData.length} rows`);
          } catch (sheetError) {
            console.warn(`⚠️ Error processing sheet "${sheetName}":`, sheetError);
            sheets[sheetName] = [];
          }
        });
        
        // Main vulnerabilities data is from the first sheet
        const mainData = sheets[workbook.SheetNames[0]];
        
        if (!mainData || mainData.length === 0) {
          throw new Error('No data found in the first sheet. Please ensure your Excel file contains vulnerability data.');
        }
        
        // Validate data structure
        const firstRow = mainData[0];
        const headers = Object.keys(firstRow);
        
        if (headers.length === 0) {
          throw new Error('No column headers found. Please ensure your Excel file has proper column headers.');
        }
        
        console.log('📊 Data validation:', {
          headers: headers.length,
          vulnerabilities: mainData.length,
          observations: sheets['Observations']?.length || 0,
          scope: sheets['Scope']?.length || 0
        });
        
        // Set file statistics
        setFileStats({
          vulnerabilities: mainData.length,
          observations: sheets['Observations']?.length || 0,
          scope: sheets['Scope']?.length || 0
        });
        
        onFileLoaded(mainData, sheets);
        setFileName(file.name);
        
        console.log('✅ Excel file processed successfully');
        
      } catch (error) {
        console.error('❌ Error processing Excel file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setError(`Failed to process Excel file: ${errorMessage}`);
        setFileStats(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
      setIsLoading(false);
    };
    
    reader.readAsBinaryString(file);
  }, [onFileLoaded]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Please upload an Excel file (.xlsx or .xls)');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size too large. Please upload a file smaller than 10MB.');
        return;
      }
      
      // Validate file is not empty
      if (file.size === 0) {
        setError('File is empty. Please upload a valid Excel file.');
        return;
      }
      
      console.log('📁 File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      });
      
      processExcelFile(file);
    }
  }, [processExcelFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' 
            : error
              ? 'border-red-300 dark:border-red-600 hover:border-red-400 dark:hover:border-red-500'
              : fileName
                ? 'border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg font-medium">Processing file...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reading Excel data and validating structure
              </p>
            </>
          ) : fileName ? (
            <>
              <CheckCircle size={48} className="mb-4 text-green-500" />
              <p className="text-lg font-medium mb-1 text-green-700 dark:text-green-300">
                ✅ {fileName}
              </p>
              {fileStats && (
                <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                  📊 {fileStats.vulnerabilities} vulnerabilities, {fileStats.observations} observations, {fileStats.scope} scope items
                </div>
              )}
              <p className="text-sm text-blue-500">Click or drag to replace</p>
            </>
          ) : error ? (
            <>
              <AlertCircle size={48} className="mb-4 text-red-500" />
              <p className="text-lg font-medium mb-1 text-red-700 dark:text-red-300">
                Upload Failed
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Click or drag to try again
              </p>
            </>
          ) : (
            <>
              <Upload size={48} className="mb-4 text-blue-500" />
              <p className="text-lg font-medium mb-1">
                {isDragActive ? 'Drop your Excel file here' : 'Drag & drop your Excel file here'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or click to browse (.xlsx or .xls, max 10MB)
              </p>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 dark:text-red-300 font-medium text-sm">Error</p>
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;