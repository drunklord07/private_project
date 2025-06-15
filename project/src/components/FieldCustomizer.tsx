import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { FieldData } from '../types';
import { ChevronUp, ChevronDown, X, GripVertical } from 'lucide-react';

interface FieldCustomizerProps {
  fields: FieldData[];
  onRemoveField: (id: string) => void;
  onMoveField: (id: string, direction: 'up' | 'down') => void;
  onToggleInclusion: (id: string) => void;
}

const FieldCustomizer: React.FC<FieldCustomizerProps> = ({
  fields,
  onRemoveField,
  onMoveField,
  onToggleInclusion
}) => {
  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-xl font-semibold mb-1">Field Customization</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Drag to reorder fields, remove fields you don't need, or use the arrows to adjust positions.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-lg mb-2">No fields available</p>
            <p>Upload an Excel file to customize fields</p>
          </div>
        ) : (
          <Droppable droppableId="fields-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {fields.map((field, index) => (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-4 rounded-lg transition-all ${
                          field.include 
                            ? snapshot.isDragging
                              ? 'bg-blue-600 shadow-lg'
                              : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                            : snapshot.isDragging
                              ? 'bg-gray-600 shadow-lg'
                              : 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing flex-shrink-0">
                              <GripVertical size={20} className="text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-white truncate">{field.name}</h3>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              onClick={() => onMoveField(field.id, 'up')}
                              disabled={index === 0}
                              className={`p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors ${
                                index === 0 ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <ChevronUp size={20} className="text-white" />
                            </button>
                            
                            <button
                              onClick={() => onMoveField(field.id, 'down')}
                              disabled={index === fields.length - 1}
                              className={`p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors ${
                                index === fields.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <ChevronDown size={20} className="text-white" />
                            </button>
                            
                            <button
                              onClick={() => onToggleInclusion(field.id)}
                              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                field.include 
                                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                                  : 'bg-red-500 hover:bg-red-600 text-white'
                              }`}
                            >
                              {field.include ? 'Included' : 'Excluded'}
                            </button>
                            
                            <button
                              onClick={() => onRemoveField(field.id)}
                              className="p-1 rounded bg-red-500 hover:bg-red-600 transition-colors"
                            >
                              <X size={20} className="text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    </div>
  );
};

export default FieldCustomizer;