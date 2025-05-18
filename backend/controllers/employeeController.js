// controllers/employeeController.js
const employeeModel = require('../models/EmployeeModel');
const emailService = require('../utils/emailService');

exports.addEmployee = async (req, res) => {
    const { username, email, password, contactNumber, description } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    
    try {
        console.log('Attempting to create employee with data:', { username, email, contactNumber, description });
        
        const employeeId = await employeeModel.createEmployee({
            username,
            email,
            password,
            contactNumber,
            description
        });
        
        console.log('Employee created successfully with ID:', employeeId);
        
        // Send welcome email to the new employee
        try {
            await emailService.sendEmail({
                to: email,
                subject: 'Welcome to Juice Bar System - Employee Account',
                text: `Dear ${username},\n\nYour employee account has been created successfully. You can now log in to the Juice Bar system with your credentials.\n\nBest regards,\nThe Juice Bar Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                        <h2 style="color: #166d67;">Welcome to the Juice Bar Team!</h2>
                        <p>Dear ${username},</p>
                        <p>Your employee account has been created successfully.</p>
                        <p>You can now log in to the Juice Bar system with your credentials and start managing orders, products, and customer communications.</p>
                        <p>If you have any questions, please contact the system administrator.</p>
                        <p>Best regards,<br>The Juice Bar Management</p>
                    </div>
                `
            });
            console.log('Welcome email sent to new employee');
        } catch (emailErr) {
            console.error('Error sending welcome email to employee:', emailErr);
            // Don't return error response here, as employee creation was successful
        }
        
        res.status(201).json({ 
            message: 'Employee added successfully',
            employeeId
        });
    } catch (err) {
        console.error('Detailed error adding employee:', {
            message: err.message,
            stack: err.stack,
            code: err.code,
            sqlMessage: err.sqlMessage
        });
        
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already registered.' });
        }
        
        res.status(500).json({ 
            message: 'Server error.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await employeeModel.getAllEmployees();
        res.status(200).json(employees);
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const employee = await employeeModel.getEmployeeById(employeeId);
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        
        res.status(200).json(employee);
    } catch (err) {
        console.error('Error fetching employee details:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const { contactNumber, description } = req.body;
        
        const success = await employeeModel.updateEmployeeDetails(
            employeeId, 
            contactNumber, 
            description || ''
        );
        
        if (!success) {
            return res.status(404).json({ message: 'Employee not found or no changes made.' });
        }
        
        res.status(200).json({ message: 'Employee updated successfully.' });
    } catch (err) {
        console.error('Error updating employee:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;
        
        // Get employee details before deletion for email notification
        const employee = await employeeModel.getEmployeeById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        
        const success = await employeeModel.deleteEmployee(employeeId);
        
        if (success) {
            // Send notification email to the employee about account deletion
            try {
                await emailService.sendEmail({
                    to: employee.email,
                    subject: 'Your Juice Bar System Account Has Been Deactivated',
                    text: `Dear ${employee.username},\n\nYour employee account in the Juice Bar system has been deactivated. If you have any questions, please contact the system administrator.\n\nBest regards,\nThe Juice Bar Management`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                            <h2 style="color: #166d67;">Account Deactivation Notice</h2>
                            <p>Dear ${employee.username},</p>
                            <p>Your employee account in the Juice Bar system has been deactivated.</p>
                            <p>If you have any questions, please contact the system administrator.</p>
                            <p>Best regards,<br>The Juice Bar Management</p>
                        </div>
                    `
                });
                console.log('Account deactivation email sent to employee');
            } catch (emailErr) {
                console.error('Error sending deactivation email to employee:', emailErr);
                // Don't return error response here, as employee deletion was successful
            }
            
            res.status(200).json({ message: 'Employee deleted successfully.' });
        } else {
            res.status(500).json({ message: 'Failed to delete employee.' });
        }
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.sendOrderNotification = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        if (!orderId || !status) {
            return res.status(400).json({ message: 'Order ID and status are required.' });
        }
        
        // Get order details with customer information
        const order = await employeeModel.getOrderById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        
        // Update order status in database
        const updateSuccess = await employeeModel.updateOrderStatus(orderId, status);
        if (!updateSuccess) {
            return res.status(500).json({ message: 'Failed to update order status.' });
        }
        
        // Send email notification to customer
        const emailResult = await emailService.sendOrderStatusEmail(
            order.email,
            order.username,
            order.token_number,
            status
        );
        
        if (emailResult.success) {
            res.status(200).json({ 
                message: 'Order status updated and notification sent to customer',
                emailId: emailResult.messageId
            });
        } else {
            res.status(200).json({ 
                message: 'Order status updated but failed to send email notification',
                error: emailResult.error
            });
        }
    } catch (err) {
        console.error('Error sending order notification:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.sendCustomEmail = async (req, res) => {
    try {
        const { to, subject, text, html } = req.body;
        
        if (!to || !subject || !(text || html)) {
            return res.status(400).json({ message: 'Email recipient, subject, and message (text or HTML) are required.' });
        }
        
        // If customer ID is provided instead of email address
        let emailAddress = to;
        if (to.match(/^\d+$/)) {
            const customer = await employeeModel.getCustomerById(to);
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found.' });
            }
            emailAddress = customer.email;
        }
        
        const result = await emailService.sendEmail({
            to: emailAddress,
            subject,
            text,
            html
        });
        
        if (result.success) {
            res.status(200).json({ 
                message: 'Email sent successfully', 
                messageId: result.messageId 
            });
        } else {
            res.status(500).json({ 
                message: 'Failed to send email', 
                error: result.error 
            });
        }
    } catch (err) {
        console.error('Error sending custom email:', err);
        res.status(500).json({ message: 'Server error.' });
    }
};