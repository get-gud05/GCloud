import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';

function AppContent() {
  const { token, username, login, logout } = useContext(AuthContext);
  const [form, setForm] = useState('login');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const handleSignup = async () => {
    try {
      const res = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) setForm('login');
    } catch {
      alert('Cannot connect to server');
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await res.json();
      if (res.ok) login(data.token, user);
      else alert(data.message);
    } catch {
      alert('Cannot connect to server');
    }
  };

  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.heading}>{form === 'login' ? 'Login' : 'Sign Up'}</h2>
          <input
            style={styles.input}
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          {form === 'login' ? (
            <button style={styles.button} onClick={handleLogin}>
              Login
            </button>
          ) : (
            <button style={styles.button} onClick={handleSignup}>
              Sign Up
            </button>
          )}
          <p
            style={styles.toggle}
            onClick={() => setForm(form === 'login' ? 'signup' : 'login')}
          >
            {form === 'login' ? 'No account? Sign Up' : 'Have account? Login'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Welcome, {username}!</h2>
        <button style={styles.button} onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    background: 'white',
    padding: '40px 30px',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
    minWidth: '300px',
    textAlign: 'center',
  },
  heading: {
    marginBottom: '20px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px 10px',
    margin: '8px 0',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '12px',
    marginTop: '12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#667eea',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  },
  toggle: {
    marginTop: '12px',
    color: '#667eea',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

// Add hover effect for button
styles.button[':hover'] = {
  backgroundColor: '#5563c1',
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
