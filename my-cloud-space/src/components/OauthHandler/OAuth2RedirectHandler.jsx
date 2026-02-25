import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { fetchUserData } from '../../service/authService';


const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthToken, setUserData } = useContext(AppContext);

  useEffect(() => {
    const handleOAuth2Redirect = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (token && email) {
        try {
          // Store token
          localStorage.setItem('token', token);
          localStorage.setItem('email', email);
          setAuthToken(token);

          // Fetch user data
          const userInfo = await fetchUserData(email, token);
          if (userInfo.status === 202) {
            setUserData(userInfo.data);
            toast.success('Successfully logged in with OAuth2!');
            navigate('/dashboard');
          } else {
            toast.error('Failed to fetch user data');
            navigate('/login');
          }
        } catch (error) {
          console.error('OAuth2 redirect error:', error);
          toast.error('Authentication failed');
          navigate('/login');
        }
      } else {
        toast.error('Invalid OAuth2 response');
        navigate('/login');
      }
    };

    handleOAuth2Redirect();
  }, [searchParams, navigate, setAuthToken, setUserData]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing login...</p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;