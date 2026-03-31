import { Router } from "express";
import { createPreference, confirmPayment, getUserOrders, webhookMercadoPago } from "../controllers/payment.controller.js";
import validateToken from "../middleware/validateToken.js"; 

const paymentRoutes = Router();

paymentRoutes.post("/mercadopago", validateToken, createPreference);
paymentRoutes.get("/orders", validateToken, getUserOrders);
paymentRoutes.post("/confirm", confirmPayment);
paymentRoutes.post("/webhook", webhookMercadoPago);

export default paymentRoutes;