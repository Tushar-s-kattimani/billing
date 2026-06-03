import React, { useState } from 'react';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const normalizedEmail = email.trim().toLowerCase();
    
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }
      onLoginSuccess();
    } catch (err) {
      let errorMessage = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Account already exists! Please switch to Login mode.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password or account not found. If you are new, try Create Account.';
      }
      setError(errorMessage);
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Pepsi Distributor</h1>
        <h2 className="login-subtitle">Cloud Billing System</h2>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem', padding: '0.75rem'}} disabled={loading}>
            {loading ? 'Authenticating...' : (isRegistering ? 'Create Account' : 'Secure Login')}
          </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '1rem'}}>
          <button 
            type="button" 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
            style={{background: 'none', border: 'none', color: 'var(--pepsi-blue)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem'}}
          >
            {isRegistering ? 'Already have an account? Log in' : 'Need to set up your account? Create one'}
          </button>
        </div>

        <p style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)'}}>
          Secure Cloud Billing System
        </p>
      </div>
    </div>
  );
};

export default Login;
