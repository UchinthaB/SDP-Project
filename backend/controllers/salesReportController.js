const salesReportModel = require('../models/SalesReportModel');

// Get daily sales report
const getDailySalesReport = async (req, res) => {
    try {
        const { date } = req.query;
        
        // Verify user has permission (owner or admin)
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        
        const report = await salesReportModel.getDailySalesReport(date);
        res.status(200).json(report);
    } catch (err) {
        console.error("Error generating daily sales report:", err);
        res.status(500).json({ message: "Failed to generate sales report" });
    }
};

// Get weekly sales report
const getWeeklySalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Verify user has permission (owner or admin)
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        
        const report = await salesReportModel.getWeeklySalesReport(startDate, endDate);
        res.status(200).json(report);
    } catch (err) {
        console.error("Error generating weekly sales report:", err);
        res.status(500).json({ message: "Failed to generate sales report" });
    }
};

// Get monthly sales report
const getMonthlySalesReport = async (req, res) => {
    try {
        const { year, month } = req.query;
        
        // Verify user has permission (owner or admin)
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        
        const report = await salesReportModel.getMonthlySalesReport(year, month);
        res.status(200).json(report);
    } catch (err) {
        console.error("Error generating monthly sales report:", err);
        res.status(500).json({ message: "Failed to generate sales report" });
    }
};

// Get custom range sales report
const getCustomRangeSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }
        
        // Verify user has permission (owner or admin)
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized access" });
        }
        
        const report = await salesReportModel.getCustomRangeSalesReport(startDate, endDate);
        res.status(200).json(report);
    } catch (err) {
        console.error("Error generating custom range sales report:", err);
        res.status(500).json({ message: "Failed to generate sales report" });
    }
};

module.exports = {
    getDailySalesReport,
    getWeeklySalesReport,
    getMonthlySalesReport,
    getCustomRangeSalesReport
};