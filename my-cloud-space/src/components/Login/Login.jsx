import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../../service/authService';
import { API_BASE_URL, toErrorMessage } from '../../service/apiClient';
import { useApp } from '../../hooks/useApp';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useApp();

  const [data, setData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((current) => ({ ...current, [name]: value }));
    setFormError('');
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setFormError('');
    try {
      const { token, user } = await login({
        email: data.email.trim(),
        password: data.password,
      });

      signIn(token, user);
      toast.success(`Welcome back, ${user.username}`);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (error) {
      const message = toErrorMessage(error, 'Unable to sign in.');
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGithubLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/github`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A3A1A6] via-[#DBCAAE] via-[#FDD597] to-[#F3AC94] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          <form onSubmit={onSubmitHandler}>
            {formError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3" role="alert">
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-800">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={data.email}
                onChange={onChangeHandler}
                autoComplete="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 block w-full px-4 py-3 transition-all"
                placeholder="example@company.com"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-800">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={data.password}
                onChange={onChangeHandler}
                autoComplete="current-password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 block w-full px-4 py-3 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 font-medium rounded-xl text-sm px-5 py-3 transition-all mb-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGithubLogin}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white font-medium rounded-xl px-4 py-3 hover:bg-gray-900 transition-all mb-4"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </button>

            <div className="text-sm text-center font-medium text-gray-600">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:underline font-semibold"
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
