import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { FieldData, PoCImage, ReportConfig, TemplateData, ReportHistoryItem } from '../types';

export const processDocxTemplate = async (
  templatePath: string,
  data: { 
    vulnerabilities: any[],
    observations: any[],
    scope: any[]
  },
  fields: FieldData[],
  pocImages: PoCImage[],
  config: ReportConfig
): Promise<void> => {
  try {
    console.log('🔄 Starting template processing with:', {
      templatePath,
      vulnerabilitiesCount: data.vulnerabilities?.length || 0,
      fieldsCount: fields.length,
      pocImagesCount: pocImages.length,
      config
    });

    // Enhanced validation with detailed error messages
    if (!data.vulnerabilities || data.vulnerabilities.length === 0) {
      throw new Error('No vulnerability data found. Please upload a valid Excel file with vulnerability data in the first sheet.');
    }

    if (fields.length === 0) {
      throw new Error('No fields configured. Please ensure your Excel file has proper column headers.');
    }

    if (!config.companyName.trim()) {
      throw new Error('Company name is required. Please enter a company name before generating the report.');
    }

    const includedFields = fields.filter(f => f.include);
    if (includedFields.length === 0) {
      throw new Error('No fields selected for inclusion. Please select at least one field in the Field Customization panel.');
    }

    // Create a proper Word document using template data
    console.log('📄 Creating document from template data...');
    const templateData = prepareTemplateData(data, includedFields, pocImages, config);
    
    // Create a basic Word document structure
    const docContent = createWordDocument(templateData, config);
    
    // Convert to blob with proper MIME type
    const output = new Blob([docContent], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // Validate output
    if (output.size === 0) {
      throw new Error('Generated document is empty. Please check your data and template.');
    }

    // Save file with enhanced error handling
    const fileName = generateFileName(config);
    console.log('💾 Saving file as:', fileName);
    
    try {
      saveAs(output, fileName);
    } catch (saveError) {
      console.error('❌ Error saving file:', saveError);
      throw new Error('Failed to save the document. Please check your browser permissions and try again.');
    }

    // Save to history with error handling
    console.log('📚 Saving to history...');
    try {
      await saveToHistory({
        name: fileName,
        type: config.reportType,
        companyName: config.companyName,
        assessmentType: config.assessmentType,
        file: output
      });
    } catch (historyError) {
      console.warn('⚠️ Warning: Failed to save to history:', historyError);
      // Don't throw here as the main operation succeeded
    }

    console.log('🎉 Template processing completed successfully!');

  } catch (error) {
    console.error('💥 Detailed error in template processing:', error);
    
    if (error instanceof Error) {
      // Re-throw with the original message for specific errors
      throw error;
    }
    
    throw new Error('An unexpected error occurred during template processing. Please try again.');
  }
};

const createWordDocument = (templateData: TemplateData, config: ReportConfig): string => {
  // Create a properly formatted document
  const docContent = `
${config.companyName}

${config.assessmentType} Security Assessment Report
Date: ${templateData.date}

Executive Summary
================
This ${config.assessmentType.toLowerCase()} security assessment report for ${config.companyName} has been prepared following ${config.reportType === 'CERT-In' ? 'CERT-In guidelines and standards' : 'industry best practices'}.

Scope of Assessment
==================
${templateData.scope_table}

Assessment Methodology
=====================
The assessment was conducted using comprehensive security testing methodologies:
- Vulnerability identification and analysis
- Security controls evaluation
- Risk assessment and classification
- Remediation recommendations

Vulnerability Details
====================
${templateData.vulnerabilities}

Additional Observations
======================
${templateData.observations}

Recommendations
===============
${templateData.recommendations}

Conclusion
==========
This assessment provides ${config.companyName} with detailed findings and actionable recommendations to improve their security posture. ${config.reportType === 'CERT-In' ? 'This report complies with CERT-In assessment guidelines.' : 'Regular security assessments are recommended to maintain adequate security levels.'}

---
Report Type: ${config.reportType}
Assessment: ${config.assessmentType}
Generated: ${templateData.date}
Organization: ${config.companyName}
`;

  return docContent;
};

const generateFileName = (config: ReportConfig): string => {
  const date = new Date().toISOString().split('T')[0];
  const company = config.companyName.replace(/[^a-zA-Z0-9]/g, '_');
  const assessment = config.assessmentType.replace(/[^a-zA-Z0-9]/g, '_');
  return `${company}_${assessment}_${config.reportType}_${date}.docx`;
};

const prepareTemplateData = (
  data: { 
    vulnerabilities: any[],
    observations: any[],
    scope: any[]
  },
  fields: FieldData[],
  pocImages: PoCImage[],
  config: ReportConfig
): TemplateData => {
  console.log('🔧 Preparing template data with:', {
    vulnerabilities: data.vulnerabilities.length,
    observations: data.observations?.length || 0,
    scope: data.scope?.length || 0,
    fields: fields.length,
    pocImages: pocImages.length
  });

  // Format vulnerabilities with enhanced structure
  const vulnerabilitiesText = data.vulnerabilities.map((vuln, index) => {
    let vulnText = `\n${index + 1}. `;
    
    // Find vulnerability name first for header
    const vulnNameField = fields.find(f => 
      f.include && f.name.toLowerCase().includes('vulnerability') && 
      f.name.toLowerCase().includes('name')
    );
    
    if (vulnNameField && vuln[vulnNameField.name]) {
      vulnText += `${vuln[vulnNameField.name]}\n`;
      vulnText += '='.repeat(vuln[vulnNameField.name].length) + '\n';
    }
    
    // Add each included field (except vulnerability name which we already added)
    fields.forEach(field => {
      if (field.include && field.name !== vulnNameField?.name) {
        const value = vuln[field.name] || 'N/A';
        vulnText += `\n${field.name}: ${value}\n`;
      }
    });

    // Add PoC images info
    if (vulnNameField) {
      const vulnName = vuln[vulnNameField.name];
      const images = pocImages.filter(img => img.vulnerabilityName === vulnName);
      if (images.length > 0) {
        vulnText += `\nProof of Concept: ${images.length} image(s) attached\n`;
        images.forEach((img, imgIndex) => {
          vulnText += `  - Evidence ${imgIndex + 1}: Screenshot attached\n`;
        });
      }
    }
    
    vulnText += '\n' + '-'.repeat(50) + '\n';
    return vulnText;
  }).join('\n');

  // Format observations with better structure
  const observationsText = data.observations?.length > 0 
    ? data.observations.map((obs, index) => {
        const obsEntries = Object.entries(obs)
          .filter(([key, value]) => value && value.toString().trim())
          .map(([key, value]) => `${key}: ${value}`);
        return `${index + 1}. ${obsEntries.join('\n   ')}`;
      }).join('\n\n')
    : 'No additional observations recorded during this assessment.';

  // Format scope with better structure
  const scopeText = data.scope?.length > 0 
    ? data.scope.map((scope, index) => {
        const scopeEntries = Object.entries(scope)
          .filter(([key, value]) => value && value.toString().trim())
          .map(([key, value]) => `${key}: ${value}`);
        return `${index + 1}. ${scopeEntries.join('\n   ')}`;
      }).join('\n\n')
    : 'Assessment scope as defined in the engagement agreement.';

  const templateData = {
    company: config.companyName || 'Company Name',
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    engagement_type: config.assessmentType,
    scope_table: scopeText,
    vulnerabilities: vulnerabilitiesText,
    observations: observationsText,
    recommendations: `Based on the findings of this ${config.assessmentType.toLowerCase()} assessment, we recommend the following actions:\n\n1. Prioritize remediation of critical and high-severity vulnerabilities\n2. Implement security controls based on risk assessment\n3. Conduct regular security reviews and assessments\n4. Establish incident response procedures\n5. Provide security awareness training to staff\n\nPlease refer to individual vulnerability recommendations above for specific technical guidance. Implementation should be based on risk priority and business requirements.`
  };

  console.log('✅ Template data prepared with keys:', Object.keys(templateData));
  return templateData;
};

const saveToHistory = async (reportData: {
  name: string;
  type: 'GT' | 'CERT-In';
  companyName: string;
  assessmentType: string;
  file: Blob;
}) => {
  try {
    const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
    
    const newReport: ReportHistoryItem = {
      id: Date.now().toString(),
      name: reportData.name,
      date: new Date().toISOString().split('T')[0],
      type: reportData.type,
      companyName: reportData.companyName,
      assessmentType: reportData.assessmentType,
      filePath: `report_history/${reportData.name}`,
      size: reportData.file.size
    };

    history.unshift(newReport);
    // Keep only the last 50 reports
    localStorage.setItem('reportHistory', JSON.stringify(history.slice(0, 50)));
    console.log('📚 Report saved to history:', newReport);
  } catch (error) {
    console.error('❌ Error saving to history:', error);
    throw new Error('Failed to save report to history.');
  }
};

export const getReportHistory = (): ReportHistoryItem[] => {
  try {
    return JSON.parse(localStorage.getItem('reportHistory') || '[]');
  } catch (error) {
    console.error('❌ Error loading report history:', error);
    return [];
  }
};

export const deleteFromHistory = (id: string): ReportHistoryItem[] => {
  try {
    const history = JSON.parse(localStorage.getItem('reportHistory') || '[]');
    const filtered = history.filter((item: ReportHistoryItem) => item.id !== id);
    localStorage.setItem('reportHistory', JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('❌ Error deleting from history:', error);
    return [];
  }
};