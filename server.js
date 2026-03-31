import express from 'express'
import connectToDb from './config/databaseConnect.js';
import dotenv from 'dotenv'
import cors from 'cors'
import usersRoutes from './routes/users.routes.js';
import productRoutes from './routes/product.routes.js';
import paymentRoutes from './routes/payment.routes.js';

dotenv.config()

const app = express();
const PORT = process.env.PORT2 || 8000;

//MIDDLEWARE
app.use(cors({
    origin: "https://oceancandles.vercel.app"
}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))


connectToDb();

app.use("/api/users", usersRoutes)
app.use("/api/products", productRoutes)
app.use("/api/checkout", paymentRoutes)


app.listen(PORT,()=>{
    console.log(`The server is up and runing on port ${PORT}`)
    })

