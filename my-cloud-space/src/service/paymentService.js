import axios from  'axios'

const API_URL= 'http://localhost:8081/api/payments'

export const createOrder = async (amount, currency = "INR", token) => {
    try {
        const response = await axios.post(`${API_URL}/create-order`,
            { amount, currency },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response;
    } catch (error) {
        console.error("Error creating payment order:", error);
        throw new Error(error.response?.data?.message || "Failed to create payment order");
    }
}

export const savePayment = async(paymentData, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/save`,
            paymentData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response;
    } catch (error) {
        console.error("Error saving payment:", error);
        throw new Error(error.response?.data?.message || "Failed to save payment");
    }
}

export const verifyPayment = async (verificationData, token) => {
    try {
        const response = await axios.post(
            `${API_URL}/verify`,
            verificationData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response;
    } catch (error) {
        console.error("Error verifying payment:", error);
        throw new Error(error.response?.data?.message || "Payment verification failed");
    }
}

export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        // Check if script is already loaded
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
}

export const initializeRazorpay = (options) =>  {
    if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
    }
    return new window.Razorpay(options);
}

