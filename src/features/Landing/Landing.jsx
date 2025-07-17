import React, { useEffect, useState } from 'react';
import style from "./Landing.module.css";
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Landing = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    email: '',
  });
  const [register, setRegister] = useState(false);

  useEffect(() => {
    checkLoggedIn();
  }, []);

  function checkLoggedIn() {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/tasks');
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (register) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  async function handleLogin() {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('https://taskbackend-jefc.onrender.com/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(data.message || 'Login failed');
        return;
      }

      storeToken(data.token);
      const decodedToken = jwtDecode(data.token);
      localStorage.setItem("userId", decodedToken.id);
      localStorage.setItem("userName", decodedToken.name);
      localStorage.setItem("userEmail", decodedToken.email);
      setIsLoading(false);
      navigate('/tasks');
    } catch (err) {
      setIsLoading(false);
      setError('Something went wrong. Please try again.');
    }
  }

  function storeToken(token) {
    localStorage.setItem('token', token);
  }

  async function handleRegister() {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('https://taskbackend-jefc.onrender.com/api/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(data.message || 'Registration failed');
        return;
      }

      setIsLoading(false);
      setRegister(false);
    } catch (err) {
      setIsLoading(false);
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className={style.container}>
      <div className={style.logo}>
        <img src='/logo.png' alt="App Logo" />
      </div>
      <div className={style.innerContainer}>
        <div className={style.login}>
          <h1>Task Manager</h1>
          <form onSubmit={handleSubmit} className={style.loginForm}>
            {register && (
              <div className={style.inputGroup}>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            )}
            <div className={style.inputGroup}>
              <label htmlFor='email'>Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className={style.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {error && <div className={style.errorMessage}>{error}</div>}

            <button type="submit" className={style.submitButton} disabled={isLoading}>
              {isLoading ? 'Loading...' : (register ? 'Register' : 'Login')}
            </button>
          </form>

          {!register && (
            <div className={style.registerLink}>
              <p>
                Don't have an account?{' '}
                <button onClick={() => setRegister(true)}>Register</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;
