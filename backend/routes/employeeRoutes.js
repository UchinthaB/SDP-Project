const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authenticateToken = require('../middleware/authMiddleware');

// Middleware to check if user is an owner or employee
const checkUserRole = (req, res, next) => {
    if (req.user && (req.user.role === 'owner' || req.user.role === 'employee')) {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied. Only owners or employees can access this resource.' });
    }
};

// Owner-only routes
router.use('/add', authenticateToken);
router.use('/add', (req, res, next) => {
    if (req.user && req.user.role === 'owner') {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied. Only owners can add employees.' });
    }
});

router.use('/delete', authenticateToken);
router.use('/delete', (req, res, next) => {
    if (req.user && req.user.role === 'owner') {
        next();
    } else {
        return res.status(403).json({ message: 'Access denied. Only owners can delete employees.' });
    }
});

// Apply authentication and role check to appropriate routes
router.use('/list', authenticateToken);
router.use('/list', checkUserRole);

router.use('/:id', authenticateToken);
router.use('/:id', checkUserRole);

router.use('/update', authenticateToken);
router.use('/update', checkUserRole);

router.use('/email', authenticateToken);
router.use('/email', checkUserRole);

router.use('/notify-order', authenticateToken);
router.use('/notify-order', checkUserRole);

// Routes for employee management
router.post('/add', employeeController.addEmployee);
router.get('/list', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.put('/update/:id', employeeController.updateEmployee);
router.delete('/delete/:id', employeeController.deleteEmployee);

// New Email functionality routes
router.post('/notify-order', employeeController.sendOrderNotification);
router.post('/email', employeeController.sendCustomEmail);

module.exports = router;