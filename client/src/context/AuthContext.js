import { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState('');

  const login = (t, user) => {
    localStorage.setItem('token', t);
    setToken(t);
    setUsername(user);
  };
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUsername('');
  };

  return (
    <AuthContext.Provider value={{ token, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
