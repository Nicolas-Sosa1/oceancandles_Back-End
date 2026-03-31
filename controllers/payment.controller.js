import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import dotenv from 'dotenv';
import Order from '../models/order.model.js'; 

dotenv.config();

const client = new MercadoPagoConfig({ 
    accessToken: process.env.TU_ACCESS_TOKEN_DE_TEST 
});

export const createPreference = async (req, res) => {
    try {
        const preference = new Preference(client);

        const items = req.body.items.map(item => ({
            id: String(item._id),
            title: String(item.name).trim(),
            quantity: Number(item.qty),
            unit_price: Number(item.price),
            currency_id: "ARS"
        }));

        const totalAmount = items.reduce(
            (acc, item) => acc + (item.unit_price * item.quantity), 
            0
        );

        const newOrder = new Order({
            items: items,
            total: totalAmount,
            status: 'pending',
            userId: req.user.id 
        });

        await newOrder.save();

        const response = await preference.create({
            body: {
                items: items,
                back_urls: {
                    success: "https://oceancandles.vercel.app/payment-success",
                    failure: "https://oceancandles.vercel.app/cart",
                    pending: "https://oceancandles.vercel.app/cart"
                },
                notification_url: "https://oceancandles-back-end.onrender.com/api/checkout/webhook",

                external_reference: newOrder._id.toString()
            }
        });

        newOrder.paymentId = response.id;
        await newOrder.save();

        res.json({ init_point: response.init_point });

    } catch (error) {
        console.error("Error MP:", error.message);
        res.status(500).json({ error: "Error al crear preferencia" });
    }
};

export const confirmPayment = async (req, res) => {
    try {
        const { preference_id, status } = req.body;

        const order = await Order.findOne({ paymentId: preference_id });

        if (!order) return res.status(404).json({ error: "Orden no encontrada" });

        order.status = status;
        await order.save();

        res.json({ message: "Orden actualizada", order });

    } catch (error) {
        res.status(500).json({ error: "Error al confirmar" });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id; 

        const orders = await Order.find({ userId }).sort({ date: -1 });

        res.json(orders);

    } catch (error) {
        console.error("Error al obtener órdenes:", error);
        res.status(500).json({ error: "Error al obtener órdenes" });
    }
};

export const webhookMercadoPago = async (req, res) => {
    try {
        console.log("Webhook recibido:", req.body);

        if (req.body.type === "payment") {
            const paymentId = req.body.data.id;

            const payment = new Payment(client);
            const data = await payment.get({ id: paymentId });

            console.log("Pago completo:", data);

            const orderId = data.external_reference;

            const order = await Order.findById(orderId);

            if (!order) {
                console.log("Orden no encontrada");
                return res.sendStatus(200);
            }

            order.status = data.status;
            await order.save();

            console.log("Orden actualizada:", order.status);
        }

        res.sendStatus(200);

    } catch (error) {
        console.error("Error en webhook:", error.message);
        res.sendStatus(500);
    }
};