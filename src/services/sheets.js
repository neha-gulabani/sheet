import { api } from './auth';
import { io } from 'socket.io-client';

let socket;

export const connectToSocket = (tableId, onDataUpdate) => {
  // Close any existing connection
  if (socket) socket.disconnect();

  // Connect to WebSocket server
  socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
    query: { tableId },
    auth: { token: getToken() },
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
  });

  socket.on('data_update', (data) => {
    onDataUpdate(data);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return () => {
    socket.disconnect();
  };
};

export const createTable = async (tableName, columns) => {
  const response = await api.post('/sheets/table', { tableName, columns });
  return response.data;
};

export const getTableData = async (tableId) => {
  const response = await api.get(`/sheets/table/${tableId}`);
  return response.data;
};

export const getUserTables = async () => {
  const response = await api.get('/sheets/tables');
  return response.data;
};