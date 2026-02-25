import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { createOrder, initializeRazorpay, loadRazorpayScript, savePayment, verifyPayment } from '../../service/paymentService';
import { AppConstants } from '../../service/constants';

const Pricing = ({ isOpen, onClose }) => {
  const { userData, authToken} = useContext(AppContext);
  const [processingPlan, setProcessingPlan] = useState(null);

  const plans = [
    {
      id: 'pro',
      name: 'Pro',
      price: 10000,
      displayPrice: '₹100',
      period: '/mo',
      storage: 50,
      badge: null,
      features: [
        '50GB Cloud Storage',
        'Advanced file search',
        'Priority support',
        '30-day version history',
      ],
      buttonText: 'Get Started',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 20000,
      displayPrice: '₹200',
      period: '/mo',
      storage: 200,
      badge: 'Most Popular',
      features: [
        '200GB Cloud Storage',
        'Everything in Pro',
        '90-day version history',
        'Team collaboration',
        'AI-powered organization',
      ],
      buttonText: 'Get Started',
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: 30000,
      displayPrice: '₹300',
      period: '/mo',
      storage: 1000,
      badge: null,
      features: [
        'Unlimited Storage',
        'Everything in Premium',
        '24/7 Premium support',
        'Advanced security',
        'Custom branding',
        'API access',
      ],
      buttonText: 'Get Started',
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
    }
  ];

  const handleSubscribe = async (plan) => {
    if (!authToken) {
      toast.error('Please login to subscribe');
      return;
    }
    try {
      setProcessingPlan(plan.id);

      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
      }

      const amountInPaise = plan.price

      // Create Razorpay order
      const orderData = await createOrder(amountInPaise, 'INR', authToken);

      // Razorpay payment options
      const options = {
        key: AppConstants.RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MyCloudSpace',
        description: `${plan.name} Plan Subscription`,
        order_id: orderData.id,
        handler: async function (response) {
          await handlePaymentSuccess(response, plan, amountInPaise);
        },
        prefill: {
          name: userData.username || '',
          email: userData.email || '',
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setProcessingPlan(null);
          }
        }
      };

      // Initialize and open Razorpay
      const paymentObject = initializeRazorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('Payment initialization failed:', error);
      toast.error(error.message || 'Failed to initialize payment. Please try again.');
      setProcessingPlan(null);
    }
  };

  const handlePaymentSuccess = async (razorpayResponse, plan, amountInINR) => {
    try {
      // Verify payment signature
      const verificationData = {
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature
      };

      //await verifyPayment(verificationData, authToken);

      const paymentData = {
        userId: userData.id,
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        amount: amountInINR,
        status: 'success'
      };

      await savePayment(paymentData, authToken);

      toast.success(`🎉 Successfully subscribed to ${plan.name} plan! Your storage has been upgraded.`);
      onClose();

    } catch (error) {
      console.error('Payment processing failed:', error);
      toast.error(error.message || 'Payment verification failed. Please contact support.');
    } finally {
      setProcessingPlan(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with smooth blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all duration-300"
        onClick={processingPlan ? null : onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300 my-8">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full p-2 transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={processingPlan !== null}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center pt-8 pb-6 px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Choose Your Plan
            </h2>
            <p className="text-gray-600">
              Unlock premium features and scale your productivity
            </p>
            {userData.maxStorage && (
              <div className="mt-4 inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                Current Storage: {userData.storageUsed || 0}GB / {userData.maxStorage}GB
              </div>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="px-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-gradient-to-b from-white to-gray-50 rounded-xl p-6 transition-all duration-300 ${
                    plan.badge 
                      ? 'shadow-xl border-2 border-blue-500 scale-105 md:-mt-3' 
                      : 'shadow-lg border border-gray-200 hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  {/* Plan Name */}
                  <div className="text-center mb-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline justify-center mt-3">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.displayPrice}
                      </span>
                      <span className="text-gray-500 ml-1 text-base">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <svg
                          className="w-5 h-5 text-green-500 mr-2.5 flex-shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={processingPlan !== null}
                    className={`w-full text-white font-semibold rounded-lg py-3 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonStyle}`}
                  >
                    {processingPlan === plan.id ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      plan.buttonText
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Footer Info */}
            <div className="text-center mt-8 space-y-1.5">
              <p className="text-sm text-gray-600">
                ✨ All plans include a 14-day free trial • Cancel anytime
              </p>
              <p className="text-xs text-gray-500">
                Need enterprise solutions?{' '}
                <button className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                  Contact Sales
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                🔒 Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;
