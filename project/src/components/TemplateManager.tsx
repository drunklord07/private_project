import React, { useRef, useState } from 'react';
import { Download, Upload, ChevronDown, ChevronRight, FileText, AlertCircle } from 'lucide-react';

interface Template {
  assessmentType: string;
  gtTemplate: string;
  certInTemplate: string;
}

interface TemplateGroup {
  category: string;
  templates: Template[];
}

const templateGroups: TemplateGroup[] = [
  {
    category: 'Web Security',
    templates: [
      {
        assessmentType: 'Web Blackbox',
        gtTemplate: '/sample_templates/gt/web_blackbox/template.docx',
        certInTemplate: '/sample_templates/certin/web_blackbox/template.docx'
      },
      {
        assessmentType: 'Web Grey Box',
        gtTemplate: '/sample_templates/gt/web_greybox/template.docx',
        certInTemplate: '/sample_templates/certin/web_greybox/template.docx'
      },
      {
        assessmentType: 'API',
        gtTemplate: '/sample_templates/gt/api/template.docx',
        certInTemplate: '/sample_templates/certin/api/template.docx'
      }
    ]
  },
  {
    category: 'Infrastructure',
    templates: [
      {
        assessmentType: 'Network',
        gtTemplate: '/sample_templates/gt/network/template.docx',
        certInTemplate: '/sample_templates/certin/network/template.docx'
      },
      {
        assessmentType: 'Network Architecture',
        gtTemplate: '/sample_templates/gt/network_architecture/template.docx',
        certInTemplate: '/sample_templates/certin/network_architecture/template.docx'
      }
    ]
  },
  {
    category: 'Cloud & Configuration',
    templates: [
      {
        assessmentType: 'Config Review',
        gtTemplate: '/sample_templates/gt/config_review/template.docx',
        certInTemplate: '/sample_templates/certin/config_review/template.docx'
      },
      {
        assessmentType: 'CSPM',
        gtTemplate: '/sample_templates/gt/cspm/template.docx',
        certInTemplate: '/sample_templates/certin/cspm/template.docx'
      }
    ]
  },
  {
    category: 'Application Security',
    templates: [
      {
        assessmentType: 'Source Code',
        gtTemplate: '/sample_templates/gt/source_code/template.docx',
        certInTemplate: '/sample_templates/certin/source_code/template.docx'
      }
    ]
  }
];

const TemplateManager: React.FC = () => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Web Security']);
  const [downloadingTemplate, setDownloadingTemplate] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleDownload = async (templatePath: string, templateName: string) => {
    setDownloadingTemplate(templatePath);
    try {
      console.log('📥 Downloading template:', templatePath);
      
      // Try multiple paths for template download
      const possiblePaths = [
        templatePath,
        templatePath.replace('/sample_templates/', '/public/sample_templates/'),
        `./public${templatePath}`,
        templatePath.replace('/sample_templates/', './sample_templates/')
      ];
      
      let response: Response | null = null;
      let successfulPath = '';
      
      for (const path of possiblePaths) {
        try {
          console.log('🔄 Trying path:', path);
          response = await fetch(path);
          if (response.ok) {
            successfulPath = path;
            console.log('✅ Template found at:', path);
            break;
          }
        } catch (error) {
          console.log('❌ Failed to fetch from:', path);
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Template not found at any of the expected locations. Please ensure the template file exists.`);
      }
      
      // Verify content type and size
      const contentType = response.headers.get('content-type');
      console.log('📄 Content type:', contentType);
      
      const blob = await response.blob();
      console.log('📦 Blob size:', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Template file is empty or corrupted.');
      }
      
      // Create proper download with correct headers
      const url = window.URL.createObjectURL(new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }));
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateName.replace(/[^a-zA-Z0-9]/g, '_')}_template.docx`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ Template downloaded successfully');
      
    } catch (error) {
      console.error('❌ Error downloading template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to download template: ${errorMessage}\n\nPlease check:\n• Template file exists\n• Network connection is stable\n• Browser allows downloads`);
    } finally {
      setDownloadingTemplate(null);
    }
  };

  const handleUpload = (assessmentType: string, type: 'GT' | 'CERT-In', file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.docx')) {
      alert('Please upload a .docx file only.');
      return;
    }
    
    if (file.size === 0) {
      alert('The uploaded file is empty. Please select a valid template file.');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size too large. Please upload a file smaller than 10MB.');
      return;
    }
    
    console.log(`📤 Template upload initiated:`, {
      assessmentType,
      type,
      fileName: file.name,
      fileSize: file.size
    });
    
    // In a real app, this would handle the template upload to the correct folder
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('assessmentType', assessmentType);

    alert(`Template upload functionality would be implemented here.\n\nFile: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nType: ${type}\nAssessment: ${assessmentType}\n\nIn a production environment, this would upload the template to the server and update the template library.`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-8 flex-shrink-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Template Management</h2>
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Template Placeholders</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Templates support the following placeholders: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">
                    COMPANY_NAME, DATE, ENGAGEMENT_TYPE, SCOPE_TABLE, VULNERABILITIES, OBSERVATIONS, RECOMMENDATIONS
                  </code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 pb-8 overflow-y-auto custom-scrollbar">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {templateGroups.map((group) => (
            <div key={group.category} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <button
                onClick={() => toggleCategory(group.category)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-lg font-medium">{group.category}</span>
                {expandedCategories.includes(group.category) ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
              
              {expandedCategories.includes(group.category) && (
                <div className="px-6 pb-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                          <th className="py-2">Assessment Type</th>
                          <th className="py-2 text-center">GT Template</th>
                          <th className="py-2 text-center">CERT-In Template</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {group.templates.map((template) => (
                          <tr key={template.assessmentType} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="py-3 text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <FileText size={16} className="text-gray-400" />
                                <span>{template.assessmentType}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleDownload(template.gtTemplate, `${template.assessmentType}_GT`)}
                                  disabled={downloadingTemplate === template.gtTemplate}
                                  className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors disabled:opacity-50"
                                  title="Download GT template"
                                >
                                  <Download size={18} />
                                </button>
                                <input
                                  type="file"
                                  ref={el => fileInputRefs.current[`${template.assessmentType}-GT`] = el}
                                  className="hidden"
                                  accept=".docx"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleUpload(template.assessmentType, 'GT', file);
                                      e.target.value = ''; // Reset input
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => fileInputRefs.current[`${template.assessmentType}-GT`]?.click()}
                                  className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
                                  title="Upload GT template"
                                >
                                  <Upload size={18} />
                                </button>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleDownload(template.certInTemplate, `${template.assessmentType}_CERT-In`)}
                                  disabled={downloadingTemplate === template.certInTemplate}
                                  className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors disabled:opacity-50"
                                  title="Download CERT-In template"
                                >
                                  <Download size={18} />
                                </button>
                                <input
                                  type="file"
                                  ref={el => fileInputRefs.current[`${template.assessmentType}-CERT-In`] = el}
                                  className="hidden"
                                  accept=".docx"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleUpload(template.assessmentType, 'CERT-In', file);
                                      e.target.value = ''; // Reset input
                                    }
                                  }}
                                />
                                <button
                                  onClick={() => fileInputRefs.current[`${template.assessmentType}-CERT-In`]?.click()}
                                  className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
                                  title="Upload CERT-In template"
                                >
                                  <Upload size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;