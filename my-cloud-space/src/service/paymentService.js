import apiClient from './apiClient';
export const getPaymentConfig = async () => {
  const response = await apiClient.get('/payments/config');
  return response.data;
};

export const getQuote = async (storageGb) => {
  const response = await apiClient.get('/payments/quote', { params: { storageGb } });
  return response.data;
};

export const createOrder = async (storageGb, currency = 'INR') => {
  const response = await apiClient.post('/payments/create-order', { storageGb, currency });
  return response.data;
};

export const verifyPayment = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const response = await apiClient.post('/payments/verify', {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  });
  return response.data;
};

export const getMyTiers = async () => {
  const response = await apiClient.get('/payments/tiers');
  return response.data;
};

export const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const initializeRazorpay = (options) => {
  if (!window.Razorpay) {
    throw new Error('Razorpay SDK not loaded');
  }
  return new window.Razorpay(options);
};
