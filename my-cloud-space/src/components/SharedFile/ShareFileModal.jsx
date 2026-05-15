import React, { useState, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { shareFile } from '../../service/fileService';
import { AppContext } from '../context/AppContext';

const EXPIRY_OPTIONS = [
  { label: '1 hour',   value: '1h' },
  { label: '6 hours',  value: '6h' },
  { label: '24 hours', value: '24h' },
  { label: '3 days',   value: '3d' },
  { label: '7 days',   value: '7d' },
  { label: '30 days',  value: '30d' },
];

const ShareFileModal = ({ isOpen, onClose, file }) => {
  const { userData }                    = useContext(AppContext);
  const [email, setEmail]               = useState('');
  const [selectedExpiry, setSelectedExpiry] = useState('24h');
  const [loading, setLoading]           = useState(false);
  const [emailError, setEmailError]     = useState('');
  const [success, setSuccess]           = useState(false);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleShare = async () => {
    if (!validateEmail(email)) { setEmailError('Please enter a valid email address'); return; }
    if (email.toLowerCase() === userData?.email?.toLowerCase()) { setEmailError("You can't share a file with yourself"); return; }
    setEmailError('');
    setLoading(true);
    try {
      await shareFile(file.id, userData.id, email);
      setSuccess(true);
      toast.success(`File shared with ${email}`);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('not found') || msg.includes('User to share')) {
        setEmailError('No MyCloudSpace account found with this email');
      } else if (msg.includes('unauthorized')) {
        toast.error('You are not authorized to share this file');
      } else {
        toast.error(msg || 'Failed to share file');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail(''); setSuccess(false); setEmailError('');
    setSelectedExpiry('24h');
    onClose();
  };

  if (!isOpen) return null;

  const expiryLabel = EXPIRY_OPTIONS.find(o => o.value === selectedExpiry)?.label;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }}
      />

      {/* Modal — must be above backdrop */}
      <div style={{ position: 'relative', zIndex: 10000, width: '100%', maxWidth: '440px' }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">Share file</h3>
              <p className="text-xs text-gray-400 mt-0.5 max-w-[260px] truncate">{file?.fileName || file?.name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p className="text-base font-semibold text-gray-800 mb-1">File shared!</p>
              <p className="text-sm text-gray-500 mb-6">
                <span className="font-medium text-gray-700">{email}</span> can now access this file in their "Shared with me" section.
              </p>
              <div className="flex gap-3">
                <button onClick={() => { setEmail(''); setSuccess(false); setEmailError(''); setSelectedExpiry('24h'); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-all">
                  Share with another
                </button>
                <button onClick={handleClose}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm text-white font-medium transition-all">
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Recipient email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <input
                    type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && email && handleShare()}
                    placeholder="colleague@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:ring-2 focus:outline-none transition-all ${
                      emailError ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-gray-200 bg-gray-50 focus:ring-blue-100 focus:border-blue-400 focus:bg-white'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    {emailError}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1.5">The recipient must have a MyCloudSpace account</p>
              </div>

              {/* Expiry */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Link expiry</p>
                <div className="grid grid-cols-3 gap-2">
                  {EXPIRY_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setSelectedExpiry(opt.value)}
                      className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                        selectedExpiry === opt.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Selected: {expiryLabel}</p>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-700 font-medium mb-1">What happens when you share?</p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  The file appears in their "Shared with me" section immediately. Access expires after {expiryLabel}.
                </p>
              </div>

              {/* Button */}
              <button onClick={handleShare} disabled={loading || !email.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Sharing...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                  </svg>Share file</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareFileModal;