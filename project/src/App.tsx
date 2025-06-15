import React, { useState } from 'react';
import { ThemeProvider } from './components/ThemeProvider';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import FieldCustomizer from './components/FieldCustomizer';
import ImageUploadWizard from './components/ImageUploadWizard';
import PreviewPanel from './components/PreviewPanel';
import ReportHistory from './components/ReportHistory';
import TemplateManager from './components/TemplateManager';
import Footer from './components/Footer';
import { AssessmentType, FieldData, PoCImage, VulnerabilityData, ReportConfig } from './types';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

type View = 'editor' | 'history' | 'templates';

function App() {
  const [currentView, setCurrentView] = useState<View>('editor');
  const [excelData, setExcelData] = useState<any | null>(null);
  const [fields, setFields] = useState<FieldData[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showImageUpload, setShowImageUpload] = useState<boolean>(false);
  const [pocImages, setPocImages] = useState<PoCImage[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    assessmentType: 'Web Blackbox',
    companyName: '',
    reportType: 'GT'
  });

  const handleExcelData = (data: any[], sheets: { [key: string]: any[] }) => {
    if (data && data.length > 0) {
      const headers = Object.keys(data[0]);
      const fieldData = headers.map((header, index) => ({
        id: `field-${index}`,
        name: header,
        include: true,
      }));
      
      setExcelData({
        vulnerabilities: data,
        observations: sheets['Observations'] || [],
        scope: sheets['Scope'] || []
      });
      setFields(fieldData);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newFields = Array.from(fields);
    const [removed] = newFields.splice(source.index, 1);
    newFields.splice(destination.index, 0, removed);

    setFields(newFields);
  };

  const handleRemoveField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const handleMoveField = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(field => field.id === id);
    if (index === -1) return;

    const newFields = [...fields];
    
    if (direction === 'up' && index > 0) {
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    } else if (direction === 'down' && index < fields.length - 1) {
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    }

    setFields(newFields);
  };

  const toggleFieldInclusion = (id: string) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, include: !field.include } : field
    ));
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleImageUploadComplete = (images: PoCImage[]) => {
    setPocImages(images);
    setShowImageUpload(false);
  };

  const getVulnerabilities = (): VulnerabilityData[] => {
    if (!excelData?.vulnerabilities) return [];

    const vulnNameField = fields.find(f => 
      f.name.toLowerCase().includes('vulnerability') &&
      f.name.toLowerCase().includes('name')
    );

    if (!vulnNameField) return [];

    return excelData.vulnerabilities.map(row => ({
      name: row[vulnNameField.name] || 'Unnamed Vulnerability',
      images: []
    }));
  };

  return (
    <ThemeProvider isDarkMode={isDarkMode}>
      <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} overflow-hidden`}>
        <div className="flex flex-1 min-h-0">
          {/* Navigation */}
          <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 flex-shrink-0`}>
            <Navigation
              currentView={currentView}
              onViewChange={setCurrentView}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex min-w-0">
            {currentView === 'editor' && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex flex-1 min-w-0">
                  {/* Sidebar - Report Generator */}
                  <div className="w-[480px] flex-shrink-0">
                    <Sidebar 
                      excelData={excelData}
                      fields={fields}
                      processing={processing}
                      setProcessing={setProcessing}
                      onExcelDataReceived={handleExcelData}
                      isDarkMode={isDarkMode}
                      onUploadPoCClick={() => setShowImageUpload(true)}
                      pocImages={pocImages}
                      reportConfig={reportConfig}
                      setReportConfig={setReportConfig}
                    />
                  </div>

                  {/* Field Customizer */}
                  <div className="flex-1 min-w-0">
                    <FieldCustomizer 
                      fields={fields}
                      onRemoveField={handleRemoveField}
                      onMoveField={handleMoveField}
                      onToggleInclusion={toggleFieldInclusion}
                    />
                  </div>

                  {/* Preview Panel */}
                  <div className="w-80 flex-shrink-0">
                    <PreviewPanel 
                      fields={fields}
                      excelData={excelData}
                      pocImages={pocImages}
                    />
                  </div>
                </div>
              </DragDropContext>
            )}

            {currentView === 'history' && <ReportHistory />}
            {currentView === 'templates' && <TemplateManager />}
          </div>
        </div>

        <Footer isDarkMode={isDarkMode} />

        {showImageUpload && (
          <ImageUploadWizard
            vulnerabilities={getVulnerabilities()}
            onClose={() => setShowImageUpload(false)}
            onComplete={handleImageUploadComplete}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;