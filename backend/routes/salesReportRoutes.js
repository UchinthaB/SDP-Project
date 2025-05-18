const express = require("express");
const router = express.Router();
const salesReportController = require("../controllers/salesReportController");
const authenticateToken = require("../middleware/authMiddleware");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get daily sales report
router.get("/daily", salesReportController.getDailySalesReport);

// Get weekly sales report
router.get("/weekly", salesReportController.getWeeklySalesReport);

// Get monthly sales report
router.get("/monthly", salesReportController.getMonthlySalesReport);

// Get custom range sales report
router.get("/custom", salesReportController.getCustomRangeSalesReport);

module.exports = router;