import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { FieldData, PoCImage, ReportConfig } from '../types';

interface DocumentData {
  vulnerabilities: any[];
  observations: any[];
  scope: any[];
}

export const generateWordReport = async (
  templatePath: string,
  data: DocumentData,
  fields: FieldData[],
  pocImages: PoCImage[],
  config: ReportConfig
): Promise<void> => {
  try {
    console.log('🔄 Starting Word report generation...');
    
    // Validate inputs
    validateInputs(data, fields, config);
    
    // Load template content for structure
    const templateContent = await loadTemplateContent(templatePath);
    
    // Create Word document using docx library
    const doc = await createWordDocument(templateContent, data, fields, pocImages, config);
    
    // Generate and save the document
    const fileName = generateFileName(config);
    await saveWordDocument(doc, fileName);
    
    console.log('✅ Word report generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating Word report:', error);
    throw new Error(`Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const validateInputs = (data: DocumentData, fields: FieldData[], config: ReportConfig): void => {
  if (!data.vulnerabilities || data.vulnerabilities.length === 0) {
    throw new Error('No vulnerability data found. Please upload a valid Excel file.');
  }
  
  if (!fields || fields.length === 0) {
    throw new Error('No fields configured. Please ensure your Excel file has proper headers.');
  }
  
  const includedFields = fields.filter(f => f.include);
  if (includedFields.length === 0) {
    throw new Error('No fields selected. Please select at least one field to include.');
  }
  
  if (!config.companyName.trim()) {
    throw new Error('Company name is required.');
  }
};

const loadTemplateContent = async (templatePath: string): Promise<string> => {
  console.log('📄 Loading template from:', templatePath);
  
  try {
    const response = await fetch(templatePath);
    
    if (!response.ok) {
      throw new Error(`Template not found: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    
    if (!content || content.trim().length === 0) {
      throw new Error('Template file is empty');
    }
    
    console.log('✅ Template loaded successfully, length:', content.length, 'characters');
    return content;
    
  } catch (error) {
    console.error('❌ Failed to load template:', error);
    throw new Error(`Failed to load template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const createWordDocument = async (
  templateContent: string,
  data: DocumentData,
  fields: FieldData[],
  pocImages: PoCImage[],
  config: ReportConfig
): Promise<Document> => {
  console.log('📝 Creating Word document...');
  
  const includedFields = fields.filter(f => f.include);
  const children: Paragraph[] = [];
  
  // Document title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: config.companyName,
          bold: true,
          size: 32,
        }),
      ],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `${config.assessmentType} Security Assessment Report`,
          bold: true,
          size: 28,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Report Type: ${config.reportType}`,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Date: ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`,
          size: 24,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  );

  // Executive Summary
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Executive Summary',
          bold: true,
          size: 28,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `This ${config.assessmentType.toLowerCase()} security assessment report for ${config.companyName} has been prepared following ${config.reportType === 'CERT-In' ? 'CERT-In guidelines and standards' : 'industry best practices'}. The assessment identified ${data.vulnerabilities.length} vulnerabilities and provides comprehensive recommendations for security improvements.`,
          size: 24,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  // Scope section
  if (data.scope && data.scope.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Assessment Scope',
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    data.scope.forEach((item, index) => {
      const scopeEntries = Object.entries(item)
        .filter(([key, value]) => value && value.toString().trim())
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${scopeEntries}`,
              size: 22,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }

  // Vulnerabilities section
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Identified Vulnerabilities (${data.vulnerabilities.length})`,
          bold: true,
          size: 28,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  // Find vulnerability name field
  const vulnNameField = includedFields.find(f => 
    f.name.toLowerCase().includes('vulnerability') && 
    f.name.toLowerCase().includes('name')
  );

  // Process each vulnerability
  for (let i = 0; i < data.vulnerabilities.length; i++) {
    const vuln = data.vulnerabilities[i];
    
    // Vulnerability header
    if (vulnNameField && vuln[vulnNameField.name]) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${i + 1}. ${vuln[vulnNameField.name]}`,
              bold: true,
              size: 26,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    }

    // Add severity and status with colors
    const severityField = includedFields.find(f => f.name.toLowerCase().includes('severity'));
    const statusField = includedFields.find(f => f.name.toLowerCase().includes('status'));

    if (severityField && vuln[severityField.name]) {
      const severity = vuln[severityField.name].toString();
      const severityColor = getSeverityColor(severity);
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Severity: ',
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: severity,
              bold: true,
              size: 24,
              color: severityColor,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    }

    if (statusField && vuln[statusField.name]) {
      const status = vuln[statusField.name].toString();
      const statusColor = getStatusColor(status);
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Status: ',
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: status,
              bold: true,
              size: 24,
              color: statusColor,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    // Add other fields
    for (const field of includedFields) {
      if (
        field.name === vulnNameField?.name ||
        field.name === severityField?.name ||
        field.name === statusField?.name
      ) continue;

      const value = vuln[field.name] || 'N/A';
      
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: field.name,
              bold: true,
              size: 24,
            }),
          ],
          spacing: { before: 150, after: 50 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: value.toString(),
              size: 22,
            }),
          ],
          spacing: { after: 150 },
        })
      );
    }

    // Add PoC images
    if (vulnNameField) {
      const vulnName = vuln[vulnNameField.name];
      const images = pocImages.filter(img => img.vulnerabilityName === vulnName);
      
      if (images.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Proof of Concept',
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );

        for (const image of images) {
          try {
            // Convert data URL to buffer
            const response = await fetch(image.dataUrl);
            const blob = await response.blob();
            const buffer = await blob.arrayBuffer();

            children.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: buffer,
                    transformation: {
                      width: 500,
                      height: 300,
                    },
                  }),
                ],
                spacing: { before: 100, after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Evidence for: ${vulnName}`,
                    italics: true,
                    size: 20,
                  }),
                ],
                spacing: { after: 200 },
              })
            );
          } catch (error) {
            console.error('Error processing image:', error);
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Error: Failed to include image',
                    color: 'FF0000',
                    size: 20,
                  }),
                ],
                spacing: { after: 100 },
              })
            );
          }
        }
      }
    }

    // Add separator between vulnerabilities
    if (i < data.vulnerabilities.length - 1) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '─'.repeat(80),
              size: 20,
            }),
          ],
          spacing: { before: 200, after: 200 },
        })
      );
    }
  }

  // Observations section
  if (data.observations && data.observations.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Additional Observations',
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    data.observations.forEach((obs, index) => {
      const obsEntries = Object.entries(obs)
        .filter(([key, value]) => value && value.toString().trim())
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${obsEntries}`,
              size: 22,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }

  // Recommendations section
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Recommendations',
          bold: true,
          size: 28,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Based on the findings of this ${config.assessmentType.toLowerCase()} assessment, we recommend the following actions:`,
          size: 24,
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '1. IMMEDIATE ACTIONS',
          bold: true,
          size: 24,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '• Address all critical and high-severity vulnerabilities within 30 days\n• Implement temporary mitigations for critical findings\n• Review and update security policies',
          size: 22,
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '2. SHORT-TERM IMPROVEMENTS (1-3 months)',
          bold: true,
          size: 24,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '• Remediate medium-severity vulnerabilities\n• Enhance security monitoring and logging\n• Conduct security awareness training',
          size: 22,
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '3. LONG-TERM STRATEGY (3-12 months)',
          bold: true,
          size: 24,
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '• Implement comprehensive security framework\n• Establish regular security assessment schedule\n• Develop incident response procedures',
          size: 22,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  // Footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `This report was generated on ${new Date().toLocaleDateString()} for ${config.companyName}`,
          size: 20,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Report Type: ${config.reportType} | Assessment: ${config.assessmentType}`,
          size: 20,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Times New Roman',
            size: 24, // 12pt
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });
};

const getSeverityColor = (severity: string): string => {
  const severityLower = severity.toLowerCase();
  switch (severityLower) {
    case 'critical':
      return '800000'; // Dark red
    case 'high':
      return 'FF0000'; // Red
    case 'medium':
      return 'FF8C00'; // Dark orange
    case 'low':
      return '228B22'; // Forest green
    default:
      return '000000'; // Black
  }
};

const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  return statusLower === 'open' ? 'FF0000' : '228B22'; // Red for open, green for closed
};

const saveWordDocument = async (doc: Document, fileName: string): Promise<void> => {
  console.log('💾 Saving Word document:', fileName);
  
  try {
    // Generate the document buffer
    const buffer = await Packer.toBlob(doc);
    
    console.log('📦 Document generated, size:', buffer.size, 'bytes');
    
    // Save the document
    saveAs(buffer, fileName);
    
    console.log('✅ Document saved successfully');
    
  } catch (error) {
    console.error('❌ Error saving document:', error);
    throw new Error('Failed to save document. Please check browser permissions.');
  }
};

const generateFileName = (config: ReportConfig): string => {
  const date = new Date().toISOString().split('T')[0];
  const company = config.companyName.replace(/[^a-zA-Z0-9]/g, '_');
  const assessment = config.assessmentType.replace(/[^a-zA-Z0-9]/g, '_');
  const reportType = config.reportType.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${company}_${assessment}_${reportType}_Report_${date}.docx`;
};

// Helper function to get template path
export const getTemplatePath = (assessmentType: string, reportType: 'GT' | 'CERT-In'): string => {
  const typeMap: { [key: string]: string } = {
    'API': 'api',
    'Web Blackbox': 'web_blackbox',
    'Web Grey Box': 'web_greybox',
    'Network': 'network',
    'Network Architecture': 'network_architecture',
    'Config Review': 'config_review',
    'CSPM': 'cspm',
    'Source Code': 'source_code'
  };

  const folder = reportType.toLowerCase() === 'gt' ? 'gt' : 'certin';
  const type = typeMap[assessmentType] || 'web_blackbox';
  
  return `/sample_templates/${folder}/${type}/template.docx`;
};