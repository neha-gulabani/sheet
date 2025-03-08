export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

export const getLocalColumns = (tableId) => {
  const data = localStorage.getItem(`table_columns_${tableId}`);
  return data ? JSON.parse(data) : [];
};

export const setLocalColumns = (tableId, columns) => {
  localStorage.setItem(`table_columns_${tableId}`, JSON.stringify(columns));
};