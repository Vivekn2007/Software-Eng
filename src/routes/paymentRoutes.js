const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const razorpay = require("../config/razorpay");
const { Order, User, Product } = require("./DatabaseSchema");

// ─────────────────────────────────────────────
// POST /payment/create-order
// Called by frontend before opening Razorpay popup
// Body: { amount, productId }
// ─────────────────────────────────────────────
router.post("/create-order", async (req, res) => {
    try {
        const { amount, productId } = req.body;

        // Basic validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const order = await razorpay.orders.create({
            amount: amount * 100,   // Razorpay needs paise (₹499 → 49900)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                productId: productId || ""
            }
        });

        res.json(order);  // sends back order.id to frontend

    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({ message: error.message });
    }
});


// ─────────────────────────────────────────────
// POST /payment/verify-payment
// Called AFTER buyer pays — verifies it's real
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature,
//         productId, sellerId, amount }
// ─────────────────────────────────────────────
router.post("/verify-payment", async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            productId,
            sellerId,
            amount
        } = req.body;

        // ── Step 1: Verify the signature ──────────────────────────────
        // Razorpay signs the payment so we can confirm it's not fake
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            // Signatures don't match → payment is fake or tampered
            return res.status(400).json({
                success: false,
                message: "Payment verification failed. Possible fraud attempt."
            });
        }

        // ── Step 2: Signature matched → payment is real ───────────────
        // Now save the order in your database

        const buyerId = req.session?.userId;   // assumes you store userId in session after login
        const buyerEmail = req.session?.email; // assumes you store email in session after login

        if (!buyerId || !buyerEmail) {
            return res.status(401).json({
                success: false,
                message: "User not logged in"
            });
        }

        await Order.create({
            buyerId,
            productId,
            sellerId,
            buyerEmail,
            amount,
            currency: "inr",
            status: "completed",
            razorpayId: razorpay_payment_id,
        });

        // ── Step 3: Return success to frontend ────────────────────────
        res.json({ success: true, message: "Payment verified and order saved!" });

    } catch (error) {
        console.error("Verify payment error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while verifying payment"
        });
    }
});


// ─────────────────────────────────────────────
// GET /payment/test-payment
// Quick test route — creates a ₹500 order (development only)
// Visit: http://localhost:3000/payment/test-payment
// ─────────────────────────────────────────────
router.get("/test-payment", async (req, res) => {
    try {
        const order = await razorpay.orders.create({
            amount: 50000,  // ₹500 in paise
            currency: "INR"
        });
        res.json(order);
    } catch (error) {
        console.error("Test payment error:", error);
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;