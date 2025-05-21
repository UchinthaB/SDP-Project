import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import ProductRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import salesReportRoutes from './routes/salesReportRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', ProductRoutes); // Assuming you have user routes as well
app.use('/api/cart', cartRoutes); // Assuming you have user routes as well
app.use('/uploads', express.static('uploads'));
app.use('/api/employees', employeeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', salesReportRoutes); // Changed from '/api/sales' to '/api/reports'
app.use('/api/messages', messageRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
