import React, { useState, useContext } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const UNIT_OPTIONS = [
  { label: 'Minutes', value: 'minutes', min: 5,  max: 59,   toSeconds: (v) => v * 60        },
  { label: 'Hours',   value: 'hours',   min: 1,  max: 23,   toSeconds: (v) => v * 3600      },
  { label: 'Days',    value: 'days',    min: 1,  max: 100,  toSeconds: (v) => v * 86400     },
];

const ShareableLinkModal = ({ isOpen, onClose, file }) => {
  const { userData }                        = useContext(AppContext);
  const [unit, setUnit]                     = useState(UNIT_OPTIONS[1]); // default: Hours
  const [amount, setAmount]                 = useState(24);
  const [maxDownloads, setMaxDownloads]     = useState('');   // empty = unlimited
  const [generatedLink, setGeneratedLink]   = useState('');
  const [loading, setLoading]               = useState(false);

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    setAmount(newUnit.min);
    setGeneratedLink('');
  };

  const handleAmountChange = (val) => {
    const num = Math.min(Math.max(Number(val), unit.min), unit.max);
    setAmount(isNaN(num) ? unit.min : num);
    setGeneratedLink('');
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const expirySeconds = unit.toSeconds(amount);
      const body = {
        expirySeconds,
        maxDownloads: maxDownloads === '' ? null : parseInt(maxDownloads),
      };

      const res = await axios.post(
        `http://localhost:8081/api/files/${file.id}/share-link?userId=${userData.id}`,
        body,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Backend returns token — build full URL
      const token   = res.data.token;
      const fullUrl = `http://localhost:8081/api/share/download/${token}`;
      setGeneratedLink(fullUrl);
      toast.success('Link generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success('Copied!');
  };

  const handleClose = () => {
    setGeneratedLink('');
    setUnit(UNIT_OPTIONS[1]);
    setAmount(24);
    setMaxDownloads('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={handleClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />

      <div style={{ position: 'relative', zIndex: 10000, width: '100%', maxWidth: '440px' }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">Share via link</h3>
              <p className="text-xs text-gray-400 mt-0.5 max-w-[260px] truncate">{file?.fileName}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Unit tabs */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Link expires after</p>
            <div className="flex gap-2 mb-3">
              {UNIT_OPTIONS.map(u => (
                <button key={u.value} onClick={() => handleUnitChange(u)}
                  className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-all ${
                    unit.value === u.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-purple-300'
                  }`}>
                  {u.label}
                </button>
              ))}
            </div>

            {/* Amount control */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {unit.min}–{unit.max} {unit.label.toLowerCase()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAmountChange(amount - 1)}
                    disabled={amount <= unit.min}
                    className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center font-bold transition-all">
                    −
                  </button>
                  <input
                    type="number"
                    value={amount}
                    min={unit.min}
                    max={unit.max}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="w-16 text-center text-lg font-bold text-purple-700 bg-white border border-purple-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  <button
                    onClick={() => handleAmountChange(amount + 1)}
                    disabled={amount >= unit.max}
                    className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center font-bold transition-all">
                    +
                  </button>
                  <span className="text-sm text-gray-500 w-14">{unit.label.toLowerCase()}</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={unit.min}
                max={unit.max}
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{unit.min}</span>
                <span className="text-purple-600 font-semibold">{amount} {unit.label.toLowerCase()}</span>
                <span>{unit.max}</span>
              </div>
            </div>
          </div>

          {/* Optional max downloads */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Max downloads <span className="text-gray-400 font-normal">(optional — leave empty for unlimited)</span>
            </label>
            <input
              type="number"
              min={1}
              value={maxDownloads}
              onChange={(e) => setMaxDownloads(e.target.value)}
              placeholder="Unlimited"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 focus:outline-none"
            />
          </div>

          {/* Info */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
            <p className="text-xs text-purple-700">
              Anyone with this link can download — no account needed. Expires in{' '}
              <span className="font-semibold">{amount} {unit.label.toLowerCase()}</span>
              {maxDownloads ? ` · Max ${maxDownloads} download${maxDownloads > 1 ? 's' : ''}` : ' · Unlimited downloads'}.
            </p>
          </div>

          {/* Generated link */}
          {generatedLink && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Shareable link — paste in any browser to download</p>
              <div className="flex gap-2 items-center">
                <input
                  readOnly
                  value={generatedLink}
                  className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-600 font-mono"
                />
                <button onClick={handleCopy}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-all flex-shrink-0">
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Generating...</>
              : generatedLink ? 'Regenerate link' : 'Generate link'
            }
          </button>

        </div>
      </div>
    </div>
  );
};

export default ShareableLinkModal;