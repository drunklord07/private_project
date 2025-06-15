import React from 'react';
import { FieldData, PoCImage } from '../types';

interface PreviewPanelProps {
  fields: FieldData[];
  excelData: any;
  pocImages: PoCImage[];
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ fields, excelData, pocImages }) => {
  if (!excelData?.vulnerabilities || !fields.length) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400 p-8">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600\" fill="none\" viewBox="0 0 24 24\" stroke="currentColor">
              <path strokeLinecap="round\" strokeLinejoin="round\" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">Preview will appear here</p>
          <p className="text-sm">Upload an Excel file to begin</p>
        </div>
      </div>
    );
  }

  const includedFields = fields.filter(f => f.include);

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-xl font-semibold">Report Preview</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Preview of your generated report content
        </p>
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
          📊 {excelData.vulnerabilities.length} vulnerabilities • {includedFields.length} fields included • {pocImages.length} PoC images
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-6">
          {/* Report Header Preview */}
          <div className="mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Security Assessment Report
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                Company: [Company Name]
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Assessment Type: [Assessment Type] | Date: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Vulnerabilities Preview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2">
              Identified Vulnerabilities ({excelData.vulnerabilities.length})
            </h2>
            
            {excelData.vulnerabilities.slice(0, 3).map((row: any, rowIndex: number) => (
              <div key={rowIndex} className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                {includedFields.map((field, fieldIndex) => {
                  const value = row[field.name] || 'N/A';
                  const isVulnName = field.name.toLowerCase().includes('vulnerability') && 
                                   field.name.toLowerCase().includes('name');
                  const isSeverity = field.name.toLowerCase().includes('severity');
                  const isStatus = field.name.toLowerCase().includes('status');

                  if (isVulnName) {
                    return (
                      <div key={fieldIndex} className="mb-4">
                        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                          {rowIndex + 1}. {value}
                        </h3>
                      </div>
                    );
                  }

                  if (isSeverity) {
                    const severityColor = value.toLowerCase() === 'critical' ? 'text-red-600' :
                                         value.toLowerCase() === 'high' ? 'text-orange-600' :
                                         value.toLowerCase() === 'medium' ? 'text-yellow-600' :
                                         'text-green-600';
                    
                    return (
                      <div key={fieldIndex} className="mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Severity: </span>
                        <span className={`font-bold ${severityColor}`}>{value}</span>
                      </div>
                    );
                  }

                  if (isStatus) {
                    const statusColor = value.toLowerCase() === 'open' ? 'text-red-600' : 'text-green-600';
                    
                    return (
                      <div key={fieldIndex} className="mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status: </span>
                        <span className={`font-bold ${statusColor}`}>{value}</span>
                      </div>
                    );
                  }

                  return (
                    <div key={fieldIndex} className="mb-4">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                        {field.name}
                      </h4>
                      <div className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-sm">
                        {typeof value === 'string' && value.length > 200 ? (
                          <div>
                            <p className="whitespace-pre-wrap">{value.substring(0, 200)}...</p>
                            <span className="text-blue-500 text-xs mt-2 inline-block">
                              [Content truncated for preview]
                            </span>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Add PoC images preview */}
                {(() => {
                  const vulnNameField = includedFields.find(f => 
                    f.name.toLowerCase().includes('vulnerability') && 
                    f.name.toLowerCase().includes('name')
                  );
                  
                  if (!vulnNameField) return null;
                  
                  const vulnName = row[vulnNameField.name];
                  const vulnImages = pocImages.filter(img => img.vulnerabilityName === vulnName);
                  
                  if (vulnImages.length === 0) return null;
                  
                  return (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">
                        Proof of Concept ({vulnImages.length} image{vulnImages.length !== 1 ? 's' : ''})
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {vulnImages.slice(0, 2).map((image, imgIndex) => (
                          <div key={imgIndex} className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                            <img 
                              src={image.dataUrl} 
                              alt={`PoC for ${vulnName}`}
                              className="w-full h-auto rounded shadow-sm max-h-32 object-contain"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                              Evidence #{imgIndex + 1}
                            </p>
                          </div>
                        ))}
                        {vulnImages.length > 2 && (
                          <div className="text-xs text-blue-500 text-center">
                            +{vulnImages.length - 2} more image{vulnImages.length - 2 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ))}
            
            {excelData.vulnerabilities.length > 3 && (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm">
                  ... and {excelData.vulnerabilities.length - 3} more vulnerabilities
                </p>
                <p className="text-xs mt-1">
                  Complete report will include all vulnerabilities with full details
                </p>
              </div>
            )}
          </div>

          {/* Additional Sections Preview */}
          {excelData.observations && excelData.observations.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2">
                Additional Observations ({excelData.observations.length})
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {excelData.observations.length} observation{excelData.observations.length !== 1 ? 's' : ''} will be included in the final report
                </p>
              </div>
            </div>
          )}

          {excelData.scope && excelData.scope.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2">
                Assessment Scope ({excelData.scope.length} items)
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scope details will be included in the final report
                </p>
              </div>
            </div>
          )}

          {/* Recommendations Preview */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2">
              Recommendations
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Comprehensive recommendations based on assessment findings will be included in the final report
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;