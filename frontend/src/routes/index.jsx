import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import OnboardingPage from '../pages/onboarding-page/onboarding.page.js';
import HomePage from '../pages/home-page/home.page.js';
import LoadingPage from '../pages/loading-page/loading.page.js';
import LoginPage from '../pages/login-page/login.page.js';
import SearchPage from '../pages/search-page/search-page.js';
import ProfilePage from '../pages/profile-page/profile.page.js';

function AuthHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token');
    
    console.log('URL params:', window.location.search);
    console.log('Token found:', token);

    if (token) {
      localStorage.setItem('spotify_token', token);
      console.log('Token saved to localStorage');
      window.history.replaceState({}, document.title, '/');
      navigate('/onboarding');
    } else {
      const stored = localStorage.getItem('spotify_token');
      console.log('Stored token:', stored);
      if (stored) {
        navigate('/onboarding');
      } else {
        navigate('/login');
      }
    }
  }, []);

  return null;
}


function NotFound() {
  return (
    <div style={{ padding: 20 }}>
      <h2>404 — Page not found</h2>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthHandler />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/loading" element={<LoadingPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;