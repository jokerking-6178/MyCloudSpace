import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createOrder, getPaymentConfig, getQuote, initializeRazorpay, loadRazorpayScript, verifyPayment } from '../../service/paymentService';
import { toErrorMessage } from '../../service/apiClient';
import { useApp } from '../../hooks/useApp';

const MIN_GB = 10;
const MAX_GB = 2000;

const QUICK_PICKS = [
  { label: '50 GB', value: 50 },
  { label: '100 GB', value: 100 },
  { label: '250 GB', value: 250 },
  { label: '500 GB', value: 500 },
  { label: '1 TB', value: 1000 },
  { label: '2 TB', value: 2000 },
];

const FEATURES = [
  'Secure cloud storage on AWS S3',
  'File sharing with expiring links',
  'AI-powered document chat (RAG)',
  'Email-based file sharing',
  'Access from any device',
  'Verified payments via Razorpay',
];

const Pricing = ({ isOpen, onClose }) => {
  const { userData, refreshUser } = useApp();
  const [storage, setStorage] = useState(100);
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [processing, setProcessing] = useState(false);

  const usedGb = userData?.storageUsed ? userData.storageUsed / (1024 * 1024 * 1024) : 0;
  const maxGb = userData?.maxStorage ?? 0;

  useEffect(() => {
    if (!isOpen) return undefined;

    let cancelled = false;
    setLoadingQuote(true);

    const timer = setTimeout(async () => {
      try {
        const result = await getQuote(storage);
        if (!cancelled) setQuote(result);
      } catch {
        if (!cancelled) setQuote(null);
      } finally {
        if (!cancelled) setLoadingQuote(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, storage]);

  const handleStorageChange = (value) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    setStorage(Math.min(Math.max(numeric, MIN_GB), MAX_GB));
  };

  const handleSubscribe = async () => {
    setProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load the Razorpay checkout. Check your connection.');
      }

      const config = await getPaymentConfig();

      const order = await createOrder(storage, 'INR');

      const options = {
        key: config.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'MyCloudSpace',
        description: `${order.storageGb} GB Cloud Storage`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            toast.success(result.message || 'Storage added to your account.');
            await refreshUser();
            onClose();
          } catch (error) {
            toast.error(
              toErrorMessage(error, 'We could not verify that payment. Contact support with your order id.'),
            );
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: userData?.username || '',
          email: userData?.email || '',
        },
        theme: { color: '#7C3AED' },
        modal: { ondismiss: () => setProcessing(false) },
      };

      initializeRazorpay(options).open();
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not start the payment.'));
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  const rupees = quote?.amountInRupees;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all duration-300"
        onClick={processing ? undefined : onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose your storage"
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl my-8"
        >
          <button
            onClick={onClose}
            disabled={processing}
            aria-label="Close"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full p-2 transition-all z-10 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center pt-8 pb-5 px-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Choose your storage</h2>
            <p className="text-sm text-gray-500">Pick exactly how much you need — pay only for that</p>
            {maxGb > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                Currently using {usedGb.toFixed(2)} GB of {maxGb} GB
              </div>
            )}
          </div>

          <div className="px-8 py-6 space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick pick</p>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_PICKS.map((pick) => (
                  <button
                    key={pick.value}
                    onClick={() => setStorage(pick.value)}
                    className={`py-2 text-sm font-medium rounded-xl border transition-all ${
                      storage === pick.value
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-purple-300'
                    }`}
                  >
                    {pick.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Custom amount</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStorageChange(storage - 10)}
                    disabled={storage <= MIN_GB}
                    aria-label="Decrease storage"
                    className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center font-bold transition-all"
                  >
                    −
                  </button>
                  <div className="flex items-center gap-1">
                    <label htmlFor="storage-gb" className="sr-only">
                      Storage in GB
                    </label>
                    <input
                      id="storage-gb"
                      type="number"
                      value={storage}
                      min={MIN_GB}
                      max={MAX_GB}
                      onChange={(event) => handleStorageChange(event.target.value)}
                      className="w-20 text-center text-xl font-bold text-purple-700 bg-white border border-purple-200 rounded-xl py-1 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                    <span className="text-sm font-semibold text-gray-500">GB</span>
                  </div>
                  <button
                    onClick={() => handleStorageChange(storage + 10)}
                    disabled={storage >= MAX_GB}
                    aria-label="Increase storage"
                    className="w-7 h-7 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 flex items-center justify-center font-bold transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              <input
                type="range"
                min={MIN_GB}
                max={MAX_GB}
                step={10}
                value={storage}
                onChange={(event) => handleStorageChange(event.target.value)}
                aria-label="Storage amount"
                className="w-full accent-purple-600"
              />

              <div className="flex justify-between text-xs text-gray-400">
                <span>{MIN_GB} GB</span>
                <span className="text-purple-600 font-semibold">{storage} GB selected</span>
                <span>2 TB</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-2xl p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total per month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-0.5">
                    {loadingQuote || rupees === undefined ? (
                      <span className="text-base font-normal text-gray-400">Calculating...</span>
                    ) : (
                      <>
                        ₹{rupees.toLocaleString('en-IN')}
                        <span className="text-sm font-normal text-gray-500"> /mo</span>
                      </>
                    )}
                  </p>
                </div>
                <p className="text-xs text-gray-400">Priced by the server</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2">
              {FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubscribe}
              disabled={processing || loadingQuote || rupees === undefined}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
            >
              {processing ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                `Get ${storage} GB${rupees !== undefined ? ` for ₹${rupees.toLocaleString('en-IN')}/mo` : ''}`
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">Secure payment powered by Razorpay</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;
