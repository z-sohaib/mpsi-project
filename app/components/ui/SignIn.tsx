import React, { useState, useEffect } from 'react';
import { useNavigate } from '@remix-run/react';

// Define proper types for Google authentication
interface GoogleAccountsType {
  id: {
    initialize: (config: GoogleInitializeConfig) => void;
    prompt: (options?: GooglePromptOptions) => void;
  };
}

interface GoogleType {
  accounts: GoogleAccountsType;
}

interface GoogleInitializeConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GooglePromptOptions {
  moment?: string;
  prompt?: string;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

// Update window interface instead of using any
declare global {
  interface Window {
    google: GoogleType;
  }
}

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }

    // Load Google script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [navigate]);

  const handleGoogleSignIn = () => {
    if (!window.google || !window.google.accounts) {
      setError('Google services not available.');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: 'YOUR_GOOGLE_CLIENT_ID',
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.prompt(); // Show the popup
  };

  const handleCredentialResponse = (response: GoogleCredentialResponse) => {
    const credential = response.credential;
    if (credential) {
      localStorage.setItem('token', credential); // Optionally store the Google JWT
      navigate('/dashboard', { replace: true });
    } else {
      setError('Google authentication failed.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(
        'https://itms-mpsi.onrender.com/api/login/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || 'Email ou mot de passe incorrect.');
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Erreur réseau :', err);
      setError('Erreur de connexion au serveur.');
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md rounded-2xl border-2 border-blue-500 bg-white p-6 shadow-lg'>
        <h2 className='mb-2 text-center text-xl'>
          <span className='text-gray-900'>Bienvenue à la plateforme</span>{' '}
          <span className='text-blue-500'>de maintenance de ESI</span>
        </h2>
        <h3 className='mb-6 text-center text-3xl font-bold'>Sign in</h3>
        <p className='mb-4 text-center text-gray-600'>
          Use your google@esi.dz account
        </p>

        <button
          onClick={handleGoogleSignIn}
          className='mb-4 flex w-full items-center justify-center rounded-lg border-none bg-transparent p-0 py-2'
        >
          <img
            src='/google.png'
            alt='Sign in with Google'
            className='h-10 w-auto object-contain transition-transform hover:scale-105 hover:shadow-lg'
          />
        </button>

        <div className='my-4 text-center text-gray-400'>or</div>

        <form className='space-y-4' onSubmit={handleLogin}>
          <div>
            <label
              htmlFor='username'
              className='mb-2 block text-sm font-semibold'
            >
              Username or email address
            </label>
            <input
              id='username'
              type='text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Username or email address'
              className='w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label
              htmlFor='password'
              className='mb-2 block text-sm font-semibold'
            >
              Password
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Password'
              className='w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='text-right'>
            <button
              type='button'
              onClick={() => alert('Redirect to password recovery')}
              className='text-sm text-blue-500 hover:underline'
            >
              Forgot Password?
            </button>
          </div>
          {error && <p className='text-center text-sm text-red-500'>{error}</p>}
          <button
            type='submit'
            className='w-full rounded-lg bg-blue-500 py-2 text-white shadow-md transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
