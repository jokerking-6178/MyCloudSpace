package com.MyProject.MyCloudSpace.service;
import com.MyProject.MyCloudSpace.io.RazorpayOrderResponse;
import com.MyProject.MyCloudSpace.io.VerifyData;
import com.razorpay.RazorpayException;

public interface RazorpayService {
    RazorpayOrderResponse createOrder(Double amount, String currency) throws RazorpayException;
    String verifyPayment(VerifyData verificationData);
 }
