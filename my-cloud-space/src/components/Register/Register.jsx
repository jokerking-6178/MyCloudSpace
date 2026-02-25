import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../service/authService';
import { toast } from 'react-toastify'; // You need to import toast

const Register = () => {
  const navigate = useNavigate(); // Move this to top

  const [data, setData] = useState({
    email: '',
    username: '',
    password: ''
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
    console.log(data)
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    try {
      const response = await registerUser(data)
      if (response.status === 201) {
        toast.success("Registration completed. Please login")
        navigate('/login') // Fixed: was 'navi'
      } else {
        toast.error("Failed to register")
      }
    } catch (error) {
      toast.error("Unable to register")
    }
  }

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

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join us today</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler}>
            {/* Username Input */}
            <div className="mb-5">
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-800">
                Username
              </label>
              <input
                type="text"
                id="username"
                name='username'
                value={data.username}
                onChange={onChangeHandler}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 block w-full px-4 py-3 transition-all"
                placeholder="johndoe"
                required
              />
            </div>

            {/* Email Input */}
            <div className="mb-5">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-800">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name='email'
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
                name='password'
                value={data.password} 
                onChange={onChangeHandler}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-400 block w-full px-4 py-3 transition-all"
                placeholder="••••••••"
                required
                minLength="8"
              />
            </div>

            {/* Terms */}
            <div className="flex items-start mb-6">
              <input
                id="terms"
                type="checkbox"
                className="w-4 h-4 mt-1 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-blue-200"
                required
              />
              <label htmlFor="terms" className="ms-2 text-sm font-medium text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 font-medium rounded-xl text-sm px-5 py-3 transition-all mb-4"
            >
              Create Account
            </button>

            {/* Login Link */}
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