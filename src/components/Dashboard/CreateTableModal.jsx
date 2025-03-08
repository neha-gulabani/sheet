import React, { useState } from 'react';
import { createTable } from '../../services/sheets';

const CreateTableModal = ({ onClose, onTableCreated }) => {
  const [tableName, setTableName] = useState('');
  const [columnCount, setColumnCount] = useState(2);
  const [columns, setColumns] = useState([
    { name: '', type: 'text' },
    { name: '', type: 'text' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleColumnCountChange = (e) => {
    const count = parseInt(e.target.value);
    setColumnCount(count);
    
    // Update columns array
    if (count > columns.length) {
      // Add new columns
      const newColumns = [...columns];
      for (let i = columns.length; i < count; i++) {
        newColumns.push({ name: '', type: 'text' });
      }
      setColumns(newColumns);
    } else if (count < columns.length) {
      // Remove columns
      setColumns(columns.slice(0, count));
    }
  };

  const handleColumnNameChange = (index, value) => {
    const newColumns = [...columns];
    newColumns[index].name = value;
    setColumns(newColumns);
  };

  const handleColumnTypeChange = (index, value) => {
    const newColumns = [...columns];
    newColumns[index].type = value;
    setColumns(newColumns);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!tableName.trim()) {
      return setError('Table name is required');
    }
    
    const invalidColumns = columns.findIndex(col => !col.name.trim());
    if (invalidColumns !== -1) {
      return setError(`Column ${invalidColumns + 1} name is required`);
    }
    
    setLoading(true);
    try {
      const newTable = await createTable(tableName, columns);
      onTableCreated(newTable);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create table');
    } finally {
      setLoading(false);
    }
  };

  const goToNext = () => {
    if (!tableName.trim()) {
      return setError('Table name is required');
    }
    setError('');
    setStep(2);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Table</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {step === 1 ? (
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Table Name
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Enter table name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Number of Columns
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={columnCount}
                onChange={handleColumnCountChange}
              />
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={goToNext}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="max-h-96 overflow-y-auto">
              {columns.map((column, index) => (
                <div key={index} className="mb-4 flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Column {index + 1} Name
                    </label>
                    <input
                      type="text"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={column.name}
                      onChange={(e) => handleColumnNameChange(index, e.target.value)}
                      placeholder={`Column ${index + 1}`}
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Type
                    </label>
                    <select
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={column.type}
                      onChange={(e) => handleColumnTypeChange(index, e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Table'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateTableModal;