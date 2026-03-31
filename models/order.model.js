import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, 
    items: [{
        id: String,
        title: String,
        quantity: Number,
        unit_price: Number
    }],
    total: { type: Number, required: true },
    paymentId: { type: String },
    status: { type: String, default: 'pending' }, 
    date: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;