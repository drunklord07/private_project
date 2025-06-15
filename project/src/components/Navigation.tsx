import React from 'react';
import { FileText, History, Settings, Menu, Sun, Moon } from 'lucide-react';

interface NavigationProps {
  currentView: 'editor' | 'history' | 'templates';
  onViewChange: (view: 'editor' | 'history' | 'templates') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  isDarkMode,
  toggleTheme
}) => {
  return (
    <div className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'} border-r border-gray-200 dark:border-gray-700`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={onToggleCollapse}
          className={`p-2 rounded-lg ${
            isDarkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-200 text-gray-700'
          } transition-colors`}
        >
          <Menu size={20} />
        </button>
      </div>
      
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-4`}>
        <div className="space-y-2">
          <button
            onClick={() => onViewChange('editor')}
            className={`w-full p-3 rounded-lg flex items-center transition-colors ${
              currentView === 'editor'
                ? 'bg-blue-600 text-white'
                : isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
            }`}
            title={isCollapsed ? "Report Editor" : undefined}
          >
            <FileText size={20} />
            {!isCollapsed && <span className="ml-3">Report Editor</span>}
          </button>
          
          <button
            onClick={() => onViewChange('history')}
            className={`w-full p-3 rounded-lg flex items-center transition-colors ${
              currentView === 'history'
                ? 'bg-blue-600 text-white'
                : isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
            }`}
            title={isCollapsed ? "Report History" : undefined}
          >
            <History size={20} />
            {!isCollapsed && <span className="ml-3">Report History</span>}
          </button>
          
          <button
            onClick={() => onViewChange('templates')}
            className={`w-full p-3 rounded-lg flex items-center transition-colors ${
              currentView === 'templates'
                ? 'bg-blue-600 text-white'
                : isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-700'
            }`}
            title={isCollapsed ? "Templates" : undefined}
          >
            <Settings size={20} />
            {!isCollapsed && <span className="ml-3">Templates</span>}
          </button>
        </div>
      </nav>

      {/* Dark Mode Toggle at Bottom */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} py-4 border-t border-gray-200 dark:border-gray-700`}>
        <button 
          onClick={toggleTheme}
          className={`w-full p-3 rounded-lg flex items-center transition-colors ${
            isDarkMode 
              ? 'hover:bg-gray-700 text-gray-300' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title={isCollapsed ? (isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode") : undefined}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!isCollapsed && (
            <span className="ml-3">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Navigation;