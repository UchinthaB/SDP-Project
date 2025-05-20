const express = require("express");
const router = express.Router();
const salesReportController = require("../controllers/salesReportController");
const authenticateToken = require("../middleware/authMiddleware");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get reports
router.get("/daily", salesReportController.getDailySalesReport);
router.get("/weekly", salesReportController.getWeeklySalesReport);
router.get("/monthly", salesReportController.getMonthlySalesReport);
router.get("/custom", salesReportController.getCustomRangeSalesReport);

// Download reports
router.get("/download/:reportType", salesReportController.generatePdfReport);

module.exports = router;