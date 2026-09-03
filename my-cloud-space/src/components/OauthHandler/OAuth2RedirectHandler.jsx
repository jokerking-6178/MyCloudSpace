import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useApp } from '../../hooks/useApp';
import { fetchCurrentUser } from '../../service/authService';
import { setStoredToken, clearStoredToken } from '../../service/apiClient';
import FullPageSpinner from '../common/FullPageSpinner';

const ERROR_MESSAGES = {
  no_email: 'Your provider did not share an email address. Add a public email, or sign up directly.',
  provider_mismatch: 'That email is already registered with a different sign-in method.',
};

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useApp();

  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const completeLogin = async () => {
      const error = searchParams.get('error');
      if (error) {
        toast.error(ERROR_MESSAGES[error] || 'Sign-in failed.');
        navigate('/login', { replace: true });
        return;
      }

      const token = searchParams.get('token');
      if (!token) {
        toast.error('Sign-in failed: no token was returned.');
        navigate('/login', { replace: true });
        return;
      }

      setStoredToken(token);

      try {
        const user = await fetchCurrentUser();
        signIn(token, user);
        toast.success('Signed in successfully');
        navigate('/dashboard', { replace: true });
      } catch {
        clearStoredToken();
        toast.error('Signed in, but your profile could not be loaded. Please try again.');
        navigate('/login', { replace: true });
      }
    };

    completeLogin();
  }, [searchParams, navigate, signIn]);

  return <FullPageSpinner label="Completing sign-in..." />;
};

export default OAuth2RedirectHandler;
