import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, ImageRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { FieldData, PoCImage, ReportConfig } from '../types';

const getSeverityColor = (severity: string): string => {
  const severityLower = severity.toLowerCase();
  switch (severityLower) {
    case 'critical':
      return '800000'; // maroon
    case 'high':
      return 'FF0000'; // red
    case 'medium':
      return 'DAA520'; // mustard
    case 'low':
      return '90EE90'; // light green
    default:
      return '000000'; // black
  }
};

const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();
  return statusLower === 'open' ? 'FF0000' : '90EE90';
};

export const generateWordDocument = async (
  data: { 
    vulnerabilities: any[],
    observations: any[],
    scope: any[]
  }, 
  fields: FieldData[], 
  pocImages: PoCImage[],
  config: ReportConfig
) => {
  const includedFields = fields.filter(field => field.include);
  
  if (includedFields.length === 0 || !data.vulnerabilities.length) {
    throw new Error('No fields selected or no data available');
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 24 // 12pt
          }
        }
      }
    },
    sections: [{
      properties: {},
      children: await generateDocumentContent(data, includedFields, pocImages, config)
    }]
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `vulnerability_report_${config.reportType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.docx`);
};

const generateDocumentContent = async (
  data: { 
    vulnerabilities: any[],
    observations: any[],
    scope: any[]
  },
  fields: FieldData[],
  pocImages: PoCImage[],
  config: ReportConfig
) => {
  let content: Paragraph[] = [];

  // Title
  content.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Vulnerability Assessment Report',
          font: 'Arial',
          size: 36, // 18pt
          bold: true
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 400,
        before: 400
      }
    })
  );

  // Company and Assessment Type
  content.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Company: ${config.companyName}`,
          font: 'Arial',
          size: 24 // 12pt
        })
      ],
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Assessment Type: ${config.assessmentType}`,
          font: 'Arial',
          size: 24 // 12pt
        })
      ],
      spacing: { after: 400 }
    })
  );

  // Scope Table
  if (data.scope && data.scope.length > 0) {
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Scope',
            font: 'Arial',
            size: 32, // 16pt
            bold: true
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 300 }
      })
    );
    // Add scope table content here
  }

  // Vulnerabilities
  content.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Identified Vulnerabilities',
          font: 'Arial',
          size: 32, // 16pt
          bold: true
        })
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 }
    })
  );

  const vulnerabilityNameField = fields.find(f => 
    f.name.toLowerCase().includes('vulnerability') && 
    f.name.toLowerCase().includes('name')
  );

  for (let rowIndex = 0; rowIndex < data.vulnerabilities.length; rowIndex++) {
    const row = data.vulnerabilities[rowIndex];
    const vulnName = vulnerabilityNameField ? row[vulnerabilityNameField.name] : null;
    
    if (rowIndex > 0) {
      content.push(
        new Paragraph({
          children: [new PageBreak()]
        })
      );
    }

    // Find severity and status fields
    const severityField = fields.find(f => f.name.toLowerCase().includes('severity'));
    const statusField = fields.find(f => f.name.toLowerCase().includes('status'));
    const severity = severityField ? row[severityField.name] : null;
    const status = statusField ? row[statusField.name] : null;

    // Vulnerability Name
    if (vulnName) {
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: vulnName.toString(),
              font: 'Arial',
              size: 28, // 14pt
              bold: true
            })
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 240,
            after: 120
          }
        })
      );
    }

    // Severity and Status
    if (severity || status) {
      content.push(
        new Paragraph({
          children: [
            ...(severity ? [
              new TextRun({
                text: 'Severity: ',
                font: 'Arial',
                size: 24,
                bold: true
              }),
              new TextRun({
                text: severity,
                font: 'Arial',
                size: 24,
                color: getSeverityColor(severity)
              })
            ] : [])
          ],
          spacing: {
            before: 120,
            after: 120
          }
        })
      );

      if (status) {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Status: ',
                font: 'Arial',
                size: 24,
                bold: true
              }),
              new TextRun({
                text: status,
                font: 'Arial',
                size: 24,
                color: getStatusColor(status)
              })
            ],
            spacing: {
              before: 120,
              after: 240
            }
          })
        );
      }
    }

    // Other fields (excluding name, severity, status, and PoC)
    for (const field of fields) {
      if (!field.include) continue;
      if (
        field.name === vulnerabilityNameField?.name ||
        field.name === severityField?.name ||
        field.name === statusField?.name ||
        field.name.toLowerCase().includes('poc') ||
        field.name.toLowerCase().includes('proof')
      ) continue;

      const value = row[field.name] || 'N/A';
      
      content.push(
        new Paragraph({
          children: [
            new TextRun({
              text: field.name,
              font: 'Arial',
              size: 24, // 12pt
              bold: true
            })
          ],
          spacing: {
            before: 240,
            after: 80
          }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: value.toString(),
              font: 'Arial',
              size: 20 // 10pt
            })
          ],
          spacing: {
            after: 160
          }
        })
      );
    }

    // Add PoC images at the end of the vulnerability section
    if (vulnName) {
      const vulnImages = pocImages.filter(img => img.vulnerabilityName === vulnName.toString());
      
      if (vulnImages.length > 0) {
        content.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Proof of Concept',
                font: 'Arial',
                size: 26, // 13pt
                bold: true
              })
            ],
            heading: HeadingLevel.HEADING_3,
            spacing: {
              before: 240,
              after: 120
            }
          })
        );

        for (const image of vulnImages) {
          try {
            const response = await fetch(image.dataUrl);
            const blob = await response.blob();
            const buffer = await blob.arrayBuffer();

            content.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: buffer,
                    transformation: {
                      width: 500,
                      height: 300
                    }
                  })
                ],
                spacing: {
                  before: 120,
                  after: 120
                }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Evidence for: ${vulnName.toString()}`,
                    font: 'Arial',
                    size: 18, // 9pt
                    italics: true
                  })
                ],
                spacing: {
                  after: 240
                }
              })
            );
          } catch (error) {
            console.error('Error processing image:', error);
            content.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Error: Failed to include image',
                    font: 'Arial',
                    size: 20,
                    color: 'FF0000'
                  })
                ],
                spacing: {
                  before: 120,
                  after: 120
                }
              })
            );
          }
        }
      }
    }
  }

  // Observations
  if (data.observations && data.observations.length > 0) {
    content.push(
      new Paragraph({
        children: [new PageBreak()]
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Additional Observations',
            font: 'Arial',
            size: 32, // 16pt
            bold: true
          })
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 }
      })
    );
    // Add observations content here
  }

  return content;
};