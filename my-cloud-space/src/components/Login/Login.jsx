import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchUserData, login } from '../../service/authService';
import {AppContext} from '../context/AppContext'

const Login = () => {
  const navigate = useNavigate();
  const { setAuthToken, setUserData, userData } = useContext(AppContext);

  const [data, setData] = useState({
    email: '',
    password: ''
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await login(data);
      if (response.status === 202) {
        toast.success("Login successful");
        setAuthToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('email', response.data.email);
        try {
          const userInfo = await fetchUserData(response.data.email, response.data.token);
          if (userInfo.status === 202) {
            toast.success("User info fetched successfully");
            setUserData(userInfo.data);
            navigate('/dashboard');
          } else {
            toast.error('Failed to fetch user data');
            navigate('/');
          }
        } catch (error) {
          console.error(error);
          toast.error("Failed to fetch data");
        }
      } else {
        toast.error("Failed to login");
      }
    } catch (error) {
      toast.error("Unable to login");
    }
  };

  // OAuth2 login handlers
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  const handleGithubLogin = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/github';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A3A1A6] via-[#DBCAAE] via-[#FDD597] to-[#F3AC94] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler}>
            {/* Email Input */}
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
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 block w-full px-4 py-3 transition-all"
                placeholder="example@company.com"
                required
              />
            </div>

            {/* Password Input */}
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
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 block w-full px-4 py-3 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-blue-200"
                />
                <label htmlFor="remember" className="ms-2 text-sm font-medium text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 font-medium rounded-xl text-sm px-5 py-3 transition-all mb-4"
            >
              Sign In
            </button>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* OAuth2 Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl px-4 py-3 hover:bg-gray-50 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              {/* GitHub Login */}
              <button
                type="button"
                onClick={handleGithubLogin}
                className="flex items-center justify-center gap-2 bg-gray-800 text-white font-medium rounded-xl px-4 py-3 hover:bg-gray-900 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                GitHub
              </button>
            </div>

            {/* Register Link */}
            <div className="text-sm text-center font-medium text-gray-600">
              Don't have an account?{' '}
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