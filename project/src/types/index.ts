export interface FieldData {
  id: string;
  name: string;
  include: boolean;
}

export interface PoCImage {
  id: string;
  dataUrl: string;
  vulnerabilityName: string;
}

export interface VulnerabilityData {
  name: string;
  images: PoCImage[];
}

export type AssessmentType = 
  | 'API'
  | 'Web Blackbox'
  | 'Web Grey Box'
  | 'Network'
  | 'Network Architecture'
  | 'Config Review'
  | 'CSPM'
  | 'Source Code';

export interface ReportConfig {
  assessmentType: AssessmentType;
  companyName: string;
  reportType: 'GT' | 'CERT-In';
}

export interface ReportHistoryItem {
  id: string;
  name: string;
  date: string;
  type: 'GT' | 'CERT-In';
  companyName: string;
  assessmentType: AssessmentType;
  filePath: string;
  size: number;
}

export interface TemplateData {
  company: string;
  date: string;
  engagement_type: string;
  scope_table: string;
  vulnerabilities: string;
  observations: string;
  recommendations: string;
}