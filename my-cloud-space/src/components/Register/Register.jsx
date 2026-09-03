import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { registerUser } from '../../service/authService';
import { toErrorMessage } from '../../service/apiClient';

const Register = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((current) => ({ ...current, [name]: value }));
    setFormError('');
  };

  const validate = () => {
    if (data.username.trim().length < 3) {
      return 'Username must be at least 3 characters.';
    }
    if (data.password.length < 8) {
      return 'Password must be at least 8 characters.';
    }
    if (data.password !== data.confirmPassword) {
      return 'The two passwords do not match.';
    }
    return '';
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await registerUser({
        email: data.email.trim(),
        username: data.username.trim(),
        password: data.password,
      });
      toast.success('Account created. Please sign in.');
      navigate('/login');
    } catch (error) {
      const message = toErrorMessage(error, 'Unable to create your account.');
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join us today</p>
          </div>

          <form onSubmit={onSubmitHandler}>
            {formError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3" role="alert">
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-800">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={data.username}
                onChange={onChangeHandler}
                autoComplete="username"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 block w-full px-4 py-3 transition-all"
                placeholder="johndoe"
                minLength={3}
                required
              />
            </div>

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

            <div className="mb-5">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-800">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={data.password}
                onChange={onChangeHandler}
                autoComplete="new-password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 block w-full px-4 py-3 transition-all"
                placeholder="••••••••"
                minLength={8}
                required
              />
              <p className="mt-1.5 text-xs text-gray-500">At least 8 characters.</p>
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-800">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={onChangeHandler}
                autoComplete="new-password"
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-sm text-center font-medium text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:underline font-semibold"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
