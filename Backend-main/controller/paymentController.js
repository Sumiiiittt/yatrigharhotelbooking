const express = require("express");
require("dotenv").config();
const stripe = require("stripe")("your_real_stripe_secret_key_here"); 

const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body; // Added paymentMethod field in request

    // If payment method is 'cod', handle accordingly (no Stripe payment)
    if (paymentMethod === "cod") {
      return res.status(200).json({
        message: "Booking confirmed with Cash on Delivery. Please pay on delivery.",
      });
    }

    // If payment method is 'card', proceed with Stripe payment intent
    if (paymentMethod === "card") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount, // amount in cents (e.g., $10 = 1000)
        currency,
        payment_method_types: ["card"],
      });

      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    }

    // If an invalid payment method is passed, respond with an error
    return res.status(400).json({
      message: "Invalid payment method. Please choose 'card' or 'cod'.",
    });
    
  } catch (error) {
    console.error("Stripe Payment Error:", error);
    return res.status(500).json({ message: "Payment failed", error: error.message });
  }
};

module.exports = { createPaymentIntent };