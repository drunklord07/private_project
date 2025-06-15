import React from 'react';

interface FooterProps {
  isDarkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isDarkMode }) => {
  return (
    <footer className={`${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border-t px-6 py-3`}>
      <div className="flex justify-between items-center text-sm">
        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Professional Vulnerability Report Generator v2.0
        </div>
        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Powered by Advanced Document Automation
        </div>
      </div>
    </footer>
  );
};

export default Footer;