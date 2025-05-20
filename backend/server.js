const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const ProductRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const orderRoutes = require('./routes/orderRoutes');
const salesReportRoutes = require('./routes/salesReportRoutes');
const messageRoutes = require('./routes/messageRoutes');

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
