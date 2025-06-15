import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const generateExcelTemplate = () => {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Vulnerabilities sheet
  const vulnData = [
    {
      'Vulnerability Name': 'Cross-Site Scripting (XSS)',
      'Severity': 'High',
      'CVSS Score': '8.2',
      'Description': 'A persistent XSS vulnerability was found in the user profile page.',
      'Affected Systems': 'Web application front-end',
      'Recommendation': 'Implement proper input validation and output encoding.',
      'Status': 'Open'
    },
    {
      'Vulnerability Name': 'SQL Injection',
      'Severity': 'Critical',
      'CVSS Score': '9.8',
      'Description': 'SQL injection vulnerability in the login form allows authentication bypass.',
      'Affected Systems': 'Authentication service, database',
      'Recommendation': 'Use parameterized queries and input validation.',
      'Status': 'Open'
    }
  ];
  
  // Observations sheet
  const observationsData = [
    {
      'Observation': 'Weak Password Policy',
      'Impact': 'Medium',
      'Details': 'The current password policy does not enforce complexity requirements.',
      'Recommendation': 'Implement a strong password policy requiring minimum length and complexity.'
    }
  ];

  // Scope sheet
  const scopeData = [
    {
      'Asset Type': 'Web Application',
      'Asset Name': 'Customer Portal',
      'IP/URL': 'https://customer.example.com',
      'Environment': 'Production'
    }
  ];

  // Add sheets to workbook
  const vulnSheet = XLSX.utils.json_to_sheet(vulnData);
  const observationsSheet = XLSX.utils.json_to_sheet(observationsData);
  const scopeSheet = XLSX.utils.json_to_sheet(scopeData);

  XLSX.utils.book_append_sheet(workbook, vulnSheet, 'Vulnerabilities');
  XLSX.utils.book_append_sheet(workbook, observationsSheet, 'Observations');
  XLSX.utils.book_append_sheet(workbook, scopeSheet, 'Scope');
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save file
  saveAs(blob, 'vulnerability_assessment_template.xlsx');
};