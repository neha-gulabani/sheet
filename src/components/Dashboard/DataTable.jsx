import React, { useState, useEffect } from 'react';
import { getTableData } from '../../services/sheets';
import { connectToSocket } from '../../services/sheets';
import { getLocalColumns, setLocalColumns } from '../../utils/localStorage';

const DataTable = ({ tableId }) => {
  const [sheetData, setSheetData] = useState({ columns: [], rows: [] });
  const [dynamicColumns, setDynamicColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumn, setNewColumn] = useState({ name: '', type: 'text' });

  // Load data and set up real-time connection
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTableData(tableId);
        setSheetData(data);
        
        // Load dynamic columns from localStorage
        const savedColumns = getLocalColumns(tableId);
        setDynamicColumns(savedColumns);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch table data');
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time connection
    const cleanupSocket = connectToSocket(tableId, (updatedData) => {
      setSheetData(updatedData);
    });

    return () => {
      cleanupSocket();
    };
  }, [tableId]);

  const addDynamicColumn = () => {
    if (!newColumn.name.trim()) {
      return;
    }

    const updatedColumns = [...dynamicColumns, { ...newColumn }];
    setDynamicColumns(updatedColumns);
    setLocalColumns(tableId, updatedColumns);
    setNewColumn({ name: '', type: 'text' });
    setShowAddColumn(false);
  };

  const renderCellValue = (row, columnName, columnType) => {
    if (columnType === 'date') {
      try {
        const date = new Date(row[columnName]);
        return date.toLocaleDateString();
      } catch {
        return row[columnName] || '';
      }
    }
    return row[columnName] || '';
  };

  const renderDynamicCellValue = (rowIndex, column) => {
    // For dynamic columns, we don't have actual data, just placeholder
    if (column.type === 'date') {
      return (
        <input 
          type="date" 
          className="w-full p-1 border rounded" 
          defaultValue="" 
        />
      );
    }
    return (
      <input 
        type="text" 
        className="w-full p-1 border rounded" 
        placeholder={`Enter ${column.name}`} 
        defaultValue="" 
      />
    );
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{sheetData.tableName || 'Table Data'}</h2>
        <button
          onClick={() => setShowAddColumn(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Column
        </button>
      </div>

      {/* Add Column Modal */}
      {showAddColumn && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add New Column</h3>
              <button
                onClick={() => setShowAddColumn(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="mb-4">
   

<div className="mb-4"></div>
  <label className="block text-gray-700 text-sm font-bold mb-2">
    Column Name
  </label>
  <input
    type="text"
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    value={newColumn.name}
    onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
    placeholder="Enter column name"
  />
</div>

<div className="mb-6">
  <label className="block text-gray-700 text-sm font-bold mb-2">
    Column Type
  </label>
  <select
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    value={newColumn.type}
    onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value })}
  >
    <option value="text">Text</option>
    <option value="date">Date</option>
  </select>
</div>

<div className="flex justify-end">
  <button
    type="button"
    onClick={addDynamicColumn}
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    disabled={!newColumn.name.trim()}
  >
    Add Column
  </button>
</div>
</div>
</div>
)}

{/* Data Table */}
<div className="bg-white shadow-md rounded-lg overflow-hidden">
<div className="overflow-x-auto">
<table className="min-w-full divide-y divide-gray-200">
<thead className="bg-gray-50">
  <tr>
    {/* Render Google Sheet Columns */}
    {sheetData.columns.map((column, index) => (
      <th
        key={`sheet-${index}`}
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      >
        {column.name}
      </th>
    ))}
    
    {/* Render Dynamic (Dashboard-only) Columns */}
    {dynamicColumns.map((column, index) => (
      <th
        key={`dynamic-${index}`}
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50"
      >
        {column.name} <span className="text-green-600">(Local)</span>
      </th>
    ))}
  </tr>
</thead>
<tbody className="bg-white divide-y divide-gray-200">
  {sheetData.rows.length === 0 ? (
    <tr>
      <td
        colSpan={sheetData.columns.length + dynamicColumns.length}
        className="px-6 py-4 text-center text-gray-500"
      >
        No data available
      </td>
    </tr>
  ) : (
    sheetData.rows.map((row, rowIndex) => (
      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
        {/* Render Google Sheet Cells */}
        {sheetData.columns.map((column, colIndex) => (
          <td
            key={`sheet-${rowIndex}-${colIndex}`}
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
          >
            {renderCellValue(row, column.name, column.type)}
          </td>
        ))}
        
        {/* Render Dynamic (Dashboard-only) Cells */}
        {dynamicColumns.map((column, colIndex) => (
          <td
            key={`dynamic-${rowIndex}-${colIndex}`}
            className="px-6 py-4 whitespace-nowrap text-sm bg-green-50"
          >
            {renderDynamicCellValue(rowIndex, column)}
          </td>
        ))}
      </tr>
    ))
  )}
</tbody>
</table>
</div>
</div>
</div>
);
};

export default DataTable;
      