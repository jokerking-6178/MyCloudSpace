import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { createOrder, initializeRazorpay, loadRazorpayScript, savePayment } from '../../service/paymentService';
import { AppConstants } from '../../service/constants';

const PRICE_PER_GB = 7;   // ₹7 per GB
const MIN_GB       = 10;
const MAX_GB       = 2000;

const QUICK_PICKS = [
  { label: '50 GB',  value: 50   },
  { label: '100 GB', value: 100  },
  { label: '250 GB', value: 250  },
  { label: '500 GB', value: 500  },
  { label: '1 TB',   value: 1000 },
  { label: '2 TB',   value: 2000 },
];

const FEATURES = [
  'Secure cloud storage on AWS S3',
  'File sharing with expiring links',
  'AI-powered document chat (RAG)',
  'Email-based file sharing',
  'Access from any device',
  'Cancel anytime',
];

const Pricing = ({ isOpen, onClose }) => {
  const { userData, authToken } = useContext(AppContext);
  const [storage, setStorage]   = useState(100);
  const [processing, setProcessing] = useState(false);

  const price        = storage * PRICE_PER_GB;           // ₹ per month
  const priceInPaise = price * 100;                      // paise for Razorpay
  const usedGB       = userData?.storageUsed  || 0;
  const maxGB        = userData?.maxStorage   || 0;

  const handleStorageChange = (val) => {
    const num = Math.min(Math.max(Number(val), MIN_GB), MAX_GB);
    setStorage(isNaN(num) ? MIN_GB : num);
  };

  const handleSubscribe = async () => {
    if (!authToken) {
      toast.error('Please login to subscribe');
      return;
    }
    try {
      setProcessing(true);

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      const orderData = await createOrder(priceInPaise, 'INR', authToken);

      const options = {
        key:         AppConstants.RAZORPAY_KEY_ID,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'MyCloudSpace',
        description: `${storage} GB Cloud Storage`,
        order_id:    orderData.id,
        handler: async (response) => {
          try {
            const paymentData = {
              userId:          userData.id,
              razorpayOrderId: response.razorpay_order_id,
              amount:          priceInPaise,
              status:          'success',
              storageGb:       storage,
            };
            await savePayment(paymentData, authToken);
            toast.success(`🎉 ${storage} GB added to your account!`);
            onClose();
          } catch (err) {
            toast.error(err.message || 'Payment verification failed. Contact support.');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name:  userData?.username || '',
          email: userData?.email    || '',
        },
        theme: { color: '#7C3AED' },
        modal: { ondismiss: () => setProcessing(false) },
      };

      const paymentObject = initializeRazorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment initialization failed:', error);
      toast.error(error.message || 'Failed to initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all duration-300"
        onClick={processing ? null : onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl my-8">

          {/* Close */}
          <button
            onClick={onClose}
            disabled={processing}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full p-2 transition-all z-10 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Header */}
          <div className="text-center pt-8 pb-5 px-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose your storage</h2>
            <p className="text-sm text-gray-500">Pick exactly how much you need — pay only for that</p>
            {maxGB > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Currently using {usedGB} GB / {maxGB} GB
              </div>
            )}
          </div>

          <div className="px-8 py-6 space-y-5">

            {/* Quick picks */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick pick</p>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_PICKS.map(q => (
                  <button key={q.value} onClick={() => setStorage(q.value)}
                    className={`py-2 text-sm font-medium rounded-xl border transition-all ${
                      storage === q.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-purple-300'
                    }`}>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider + input */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Custom amount</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleStorageChange(storage - 1)}
                    disabled={storage <= MIN_GB}
                    className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center font-bold transition-all">
                    −
                  </button>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={storage}
                      min={MIN_GB}
                      max={MAX_GB}
                      onChange={(e) => handleStorageChange(e.target.value)}
                      className="w-20 text-center text-xl font-bold text-purple-700 bg-white border border-purple-200 rounded-xl py-1 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                    <span className="text-sm font-semibold text-gray-500">GB</span>
                  </div>
                  <button onClick={() => handleStorageChange(storage + 1)}
                    disabled={storage >= MAX_GB}
                    className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center font-bold transition-all">
                    +
                  </button>
                </div>
              </div>

              <input
                type="range"
                min={MIN_GB}
                max={MAX_GB}
                step={1}
                value={storage}
                onChange={(e) => handleStorageChange(e.target.value)}
                className="w-full accent-purple-600"
              />

              <div className="flex justify-between text-xs text-gray-400">
                <span>{MIN_GB} GB</span>
                <span className="text-purple-600 font-semibold">{storage} GB selected</span>
                <span>2 TB</span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {storage} GB × ₹{PRICE_PER_GB}/GB
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  ₹{price.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="border-t border-purple-100 pt-3 flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total per month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-0.5">
                    ₹{price.toLocaleString('en-IN')}
                    <span className="text-sm font-normal text-gray-500"> /mo</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Per day</p>
                  <p className="text-sm font-semibold text-purple-600">
                    ≈ ₹{(price / 30).toFixed(1)}/day
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-y-2">
              {FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">{f}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={handleSubscribe}
              disabled={processing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-200">
              {processing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Processing...
                </>
              ) : (
                `Get ${storage} GB for ₹${price.toLocaleString('en-IN')}/mo`
              )}
            </button>

            {/* Footer */}
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">
                Need enterprise solutions?{' '}
                <button className="text-blue-600 hover:underline font-medium">Contact Sales</button>
              </p>
              <p className="text-xs text-gray-400">🔒 Secure payment powered by Razorpay</p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;