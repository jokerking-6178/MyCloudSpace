import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    // Add your email submission logic here
  };

  return (
    <div className="bg-[#fcfcfc] text-gray-900">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@1,400;1,600&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Hero Section */}
      <section className="relative w-full h-screen min-h-[800px] flex flex-col">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop" 
            alt="Team Background" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-50 w-full max-w-7xl mx-auto mt-6 px-4">
          <div className="bg-white rounded-full px-6 py-3 flex justify-between items-center shadow-lg">
            <div className="text-xl font-bold text-[#1d2ae6] tracking-wide">MyCloudSpace</div>
            
            <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
              <a href="#" className="hover:text-black">Home </a>
              <a href="#" className="hover:text-black">About Us</a>
              <a href="#" className="hover:text-black">Pricing</a>
              <a href="#" className="hover:text-black">Contact Us</a>
            </div>

            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              className="flex items-center gap-2 text-sm font-semibold hover:opacity-70"
            >
              Login / Register
              <div className="bg-[#1d2ae6] text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </div>
            </a>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-grow flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-end pb-20">
            <div className="text-white max-w-2xl">
              <h1 className="text-5xl lg:text-7xl font-semibold leading-[1.1] mb-6">
                Store Your Data<br/>
                with <span className="font-serif italic font-normal">Confidence , Security</span>
              </h1>
              <p className="text-gray-200 text-lg mb-8 max-w-lg font-light">
                Expert strategic consulting to drive sustainable growth, operational innovation, and lasting business transformation across industries.
              </p>
              
              <button className="bg-white text-black pl-5 pr-2 py-2 rounded-full flex items-center gap-3 font-semibold hover:bg-gray-100 transition">
                Book a Free Call
                <span className="bg-[#1d2ae6] text-white w-8 h-8 rounded-full flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </span>
              </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md ml-auto w-full relative top-12 lg:top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Let's Move Your Business Forward</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Success doesn't happen by chance—it's built through smart strategy, informed decisions.
              </p>
              
              <div className="bg-gray-100 rounded-full p-1.5 pl-5 flex items-center justify-between">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder-gray-400"
                />
                <button 
                  onClick={handleEmailSubmit}
                  className="bg-[#1d2ae6] text-white w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-blue-800 transition"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Landing;