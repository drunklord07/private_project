import React from 'react';
import FileUploader from './FileUploader';
import { AssessmentType, FieldData, PoCImage, ReportConfig } from '../types';
import { generateWordReport, getTemplatePath } from '../utils/documentGenerator';
import { generateExcelTemplate } from '../utils/excelGenerator';
import { FileDown, FileText, Image as ImageIcon } from 'lucide-react';

interface SidebarProps {
  excelData: any;
  fields: FieldData[];
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  onExcelDataReceived: (data: any[], sheets: { [key: string]: any[] }) => void;
  isDarkMode: boolean;
  onUploadPoCClick: () => void;
  pocImages: PoCImage[];
  reportConfig: ReportConfig;
  setReportConfig: (config: ReportConfig) => void;
}

const assessmentTypes: AssessmentType[] = [
  'API',
  'Web Blackbox',
  'Web Grey Box',
  'Network',
  'Network Architecture',
  'Config Review',
  'CSPM',
  'Source Code'
];

const Sidebar: React.FC<SidebarProps> = ({
  excelData,
  fields,
  processing,
  setProcessing,
  onExcelDataReceived,
  isDarkMode,
  onUploadPoCClick,
  pocImages,
  reportConfig,
  setReportConfig
}) => {
  const handleGenerateDocument = async (type: 'GT' | 'CERT-In') => {
    console.log('🚀 Starting document generation:', { type, excelData: !!excelData, fieldsCount: fields.length });
    
    // Enhanced validation
    if (!reportConfig.companyName.trim()) {
      alert('❌ Company name is required. Please enter a company name before generating the report.');
      return;
    }

    if (!excelData) {
      alert('❌ Excel file is required. Please upload an Excel file containing vulnerability data.');
      return;
    }

    if (!excelData.vulnerabilities || excelData.vulnerabilities.length === 0) {
      alert('❌ No vulnerability data found. Please ensure your Excel file contains vulnerability data in the first sheet.');
      return;
    }

    if (fields.length === 0) {
      alert('❌ No fields detected. Please ensure your Excel file has proper column headers.');
      return;
    }

    const includedFields = fields.filter(f => f.include);
    if (includedFields.length === 0) {
      alert('❌ No fields selected. Please select at least one field to include in the report using the Field Customization panel.');
      return;
    }

    setProcessing(true);
    
    try {
      const templatePath = getTemplatePath(reportConfig.assessmentType, type);
      
      console.log('📋 Report generation details:', {
        templatePath,
        vulnerabilitiesCount: excelData.vulnerabilities?.length || 0,
        observationsCount: excelData.observations?.length || 0,
        scopeCount: excelData.scope?.length || 0,
        includedFieldsCount: includedFields.length,
        pocImagesCount: pocImages.length,
        companyName: reportConfig.companyName,
        assessmentType: reportConfig.assessmentType,
        reportType: type
      });
      
      // Use the new robust document generator
      await generateWordReport(
        templatePath,
        {
          vulnerabilities: excelData.vulnerabilities,
          observations: excelData.observations || [],
          scope: excelData.scope || []
        },
        fields,
        pocImages,
        {
          ...reportConfig,
          reportType: type
        }
      );
      
      console.log('🎉 Report generated successfully!');
      
      // Show success message
      alert(`✅ ${type} Report Generated Successfully!\n\nThe report has been downloaded to your Downloads folder.\n\nReport Details:\n• Company: ${reportConfig.companyName}\n• Assessment: ${reportConfig.assessmentType}\n• Vulnerabilities: ${excelData.vulnerabilities.length}\n• PoC Images: ${pocImages.length}`);
      
    } catch (error) {
      console.error('💥 Error generating document:', error);
      
      let errorMessage = 'An unexpected error occurred while generating the report.';
      
      if (error instanceof Error) {
        if (error.message.includes('Template not found')) {
          errorMessage = `Template file not found. Please ensure the template exists at the expected location.\n\nTemplate: ${getTemplatePath(reportConfig.assessmentType, type)}`;
        } else if (error.message.includes('Failed to load template')) {
          errorMessage = `Failed to load template file. Please check:\n• Template file exists\n• File is not corrupted\n• Network connection is stable`;
        } else if (error.message.includes('Document generation failed')) {
          errorMessage = `Document generation error: ${error.message}\n\nThis may be due to:\n• Template format issues\n• Missing placeholders\n• Data formatting problems`;
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`❌ Report Generation Failed\n\n${errorMessage}\n\nPlease check:\n• All required fields are filled\n• Excel file contains valid data\n• Template files are available\n• Browser allows downloads\n\nCheck the browser console for detailed technical information.`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      console.log('📥 Downloading Excel template...');
      generateExcelTemplate();
      console.log('✅ Excel template download initiated');
    } catch (error) {
      console.error('❌ Error downloading template:', error);
      alert('Error downloading template. Please try again.');
    }
  };

  const includedFieldsCount = fields.filter(f => f.include).length;
  const isGenerateDisabled = !excelData || processing || includedFieldsCount === 0 || !reportConfig.companyName.trim();

  return (
    <div className={`w-full h-full flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'} border-r border-gray-200 dark:border-gray-700`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h1 className="text-2xl font-bold">Report Generator</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Professional vulnerability report automation
        </p>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto custom-scrollbar">
        <div>
          <label className="block text-sm font-medium mb-2">Assessment Type</label>
          <select
            value={reportConfig.assessmentType}
            onChange={(e) => setReportConfig({
              ...reportConfig,
              assessmentType: e.target.value as AssessmentType
            })}
            className={`w-full p-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
          >
            {assessmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Company Name *</label>
          <input
            type="text"
            value={reportConfig.companyName}
            onChange={(e) => setReportConfig({
              ...reportConfig,
              companyName: e.target.value
            })}
            className={`w-full p-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Upload Excel File</label>
          <FileUploader onFileLoaded={onExcelDataReceived} />
          {excelData && (
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              ✅ {excelData.vulnerabilities?.length || 0} vulnerabilities loaded
              {excelData.observations?.length > 0 && `, ${excelData.observations.length} observations`}
              {excelData.scope?.length > 0 && `, ${excelData.scope.length} scope items`}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDownloadTemplate}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            } transition-colors`}
          >
            <FileDown size={20} />
            <span>Download Excel Template</span>
          </button>

          {excelData && (
            <button
              onClick={onUploadPoCClick}
              className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
                isDarkMode
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-purple-500 hover:bg-purple-600'
              } text-white transition-colors`}
            >
              <ImageIcon size={20} />
              <span>Upload Proof of Concept ({pocImages.length})</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleGenerateDocument('GT')}
            disabled={isGenerateDisabled}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
              isGenerateDisabled
                ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                : isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <FileText size={20} />
            <span>{processing ? 'Generating GT Report...' : 'Generate GT Report'}</span>
          </button>

          <button
            onClick={() => handleGenerateDocument('CERT-In')}
            disabled={isGenerateDisabled}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
              isGenerateDisabled
                ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                : isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <FileText size={20} />
            <span>{processing ? 'Generating CERT-In Report...' : 'Generate CERT-In Report'}</span>
          </button>
        </div>

        {/* Enhanced Status Information */}
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h4 className="text-sm font-medium mb-3">Configuration Status</h4>
          <div className="space-y-2 text-sm">
            <div className={`flex justify-between items-center ${reportConfig.companyName.trim() ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <span>Company Name:</span>
              <span className="font-medium">{reportConfig.companyName.trim() ? '✅ Set' : '❌ Required'}</span>
            </div>
            <div className={`flex justify-between items-center ${excelData ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <span>Excel File:</span>
              <span className="font-medium">{excelData ? '✅ Loaded' : '❌ Required'}</span>
            </div>
            <div className={`flex justify-between items-center ${includedFieldsCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <span>Fields Selected:</span>
              <span className="font-medium">{includedFieldsCount > 0 ? `✅ ${includedFieldsCount} fields` : '❌ None'}</span>
            </div>
            <div className={`flex justify-between items-center ${pocImages.length > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
              <span>PoC Images:</span>
              <span className="font-medium">{pocImages.length > 0 ? `📸 ${pocImages.length} images` : '📷 Optional'}</span>
            </div>
            <div className={`flex justify-between items-center text-blue-600 dark:text-blue-400`}>
              <span>Template:</span>
              <span className="font-medium text-xs">{getTemplatePath(reportConfig.assessmentType, 'GT').split('/').pop()}</span>
            </div>
          </div>
        </div>

        {processing && (
          <div className={`p-4 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-blue-600 bg-blue-900 bg-opacity-20' : 'border-blue-400 bg-blue-50'}`}>
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-300">Generating Report...</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Processing template and formatting content</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;