import React, {useState} from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

export default function Login(){
  const [email,setEmail]=useState(''), [password,setPassword]=useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert('Logged in successfully!');
      navigate('/');
      // Refresh the page to update the navigation
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="card">
      <h3>Login</h3>
      <p className="text-secondary mb-4">Sign in to your account to access all features</p>
      <form onSubmit={submit}>
        <div className="mb-4">
          <label className="font-semibold mb-2 block">Email</label>
          <input 
            type="email"
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            required 
            placeholder="Enter your email address"
          />
        </div>
        <div className="mb-4">
          <label className="font-semibold mb-2 block">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required 
            placeholder="Enter your password"
          />
        </div>
        <button className="btn btn-primary w-full" type="submit">Login</button>
      </form>
      <div className="text-center mt-4">
        <p className="text-sm text-muted">
          Don't have an account? <Link to="/register" className="text-primary font-semibold">Register here</Link>
        </p>
      </div>
    </div>
  );
}
