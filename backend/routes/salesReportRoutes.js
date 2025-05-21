import express from "express";
const router = express.Router();
import salesReportController from "../controllers/salesReportController.js";
import {generatePdfReport} from "../controllers/salesReportController.js";
import authenticateToken from "../middleware/authMiddleware.js";

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get reports
router.get("/daily", salesReportController.getDailySalesReport);
router.get("/weekly", salesReportController.getWeeklySalesReport);
router.get("/monthly", salesReportController.getMonthlySalesReport);
router.get("/custom", salesReportController.getCustomRangeSalesReport);

// Download reports
// PDF report routes
router.get('/:reportType/pdf', salesReportController.generatePdfReport);

export default router;