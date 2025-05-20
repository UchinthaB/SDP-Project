const pool = require("../config/db");
const PDFDocument = require('pdfkit');
const { format } = require('date-fns');

// Get daily sales report
const getDailySalesReport = async (req, res) => {
    try {
        const { date } = req.query;
        
        // Get daily summary
        const summaryQuery = `
          SELECT 
            COALESCE(SUM(total_amount), 0) as total_revenue,
            COUNT(*) as total_orders
          FROM orders
          WHERE DATE(created_at) = ? AND status = 'completed'
        `;
        
        const bestSellersQuery = `
          SELECT 
            p.id as product_id,
            p.name as product_name,
            j.name as juice_bar_name,
            p.price,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.unit_price * oi.quantity) as total_sales
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN orders o ON oi.order_id = o.order_id
          JOIN juice_bars j ON o.juice_bar_id = j.juice_bar_id
          WHERE DATE(o.created_at) = ? AND o.status = 'completed'
          GROUP BY p.id, p.name, j.name, p.price
          ORDER BY total_quantity DESC
          LIMIT 10
        `;
        
        const salesByLocationQuery = `
          SELECT 
            j.juice_bar_id,
            j.name as juice_bar_name,
            COUNT(o.order_id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_revenue
          FROM juice_bars j
          LEFT JOIN orders o ON j.juice_bar_id = o.juice_bar_id 
            AND DATE(o.created_at) = ?
            AND o.status = 'completed'
          GROUP BY j.juice_bar_id, j.name
        `;

        const [summary, bestSellers, salesByLocation] = await Promise.all([
          pool.query(summaryQuery, [date]),
          pool.query(bestSellersQuery, [date]),
          pool.query(salesByLocationQuery, [date])
        ]);

        // MySQL2 returns results in [rows, fields] format
        res.json({
          date,
          summary: summary[0][0],         // Get first row from first element
          bestSellers: bestSellers[0],    // Get all rows from first element
          salesByLocation: salesByLocation[0]  // Get all rows from first element
        });
    } catch (error) {
        console.error('Error generating daily report:', error);
        res.status(500).json({ error: 'Failed to generate daily report' });
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
        
        const summaryQuery = `
          SELECT 
            COALESCE(SUM(total_amount), 0) as total_revenue,
            COUNT(*) as total_orders
          FROM orders
          WHERE DATE(created_at) BETWEEN ? AND ?
            AND status = 'completed'
        `;
        
        const salesByDayQuery = `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as total_orders,
            COALESCE(SUM(total_amount), 0) as total_revenue
          FROM orders
          WHERE DATE(created_at) BETWEEN ? AND ?
            AND status = 'completed'
          GROUP BY DATE(created_at)
          ORDER BY date
        `;

        const [summary, salesByDay] = await Promise.all([
          pool.query(summaryQuery, [startDate, endDate]),
          pool.query(salesByDayQuery, [startDate, endDate])
        ]);

        res.json({
          startDate,
          endDate,
          summary: summary[0][0],     // Get first row from first element
          salesByDay: salesByDay[0]   // Get all rows from first element
        });
    } catch (error) {
        console.error('Error generating weekly report:', error);
        res.status(500).json({ error: 'Failed to generate weekly report' });
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

// Helper function to get report data without sending response
const getReportData = async (reportType, req) => {
  const { date, startDate, endDate, year, month } = req.query;
  
  switch (reportType) {
    case 'daily': {
      const summaryQuery = `
        SELECT 
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COUNT(*) as total_orders
        FROM orders
        WHERE DATE(created_at) = ? AND status = 'completed'
      `;
      
      const [summary] = await pool.query(summaryQuery, [date]);
      return {
        date,
        summary: summary[0],
        totalSales: summary[0].total_revenue,
        itemsSold: summary[0].total_orders
      };
    }
    case 'weekly': {
      const summaryQuery = `
        SELECT 
          DATE(created_at) as date,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COUNT(*) as total_orders
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
          AND status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY date
      `;
      
      const [summary] = await pool.query(summaryQuery, [startDate, endDate]);
      return summary;
    }
    // Add other cases as needed
    default:
      throw new Error('Invalid report type');
  }
};

// Generate PDF report
const generatePdfReport = async (req, res) => {
  try {
    const { reportType } = req.params;
    const { date } = req.query;

    // Get report data first
    const [rows] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders
      WHERE DATE(created_at) = ? AND status = 'completed'
      GROUP BY DATE(created_at)
    `, [date]);

    // Create PDF document
    const doc = new PDFDocument();
    const fileName = `sales_report_${reportType}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    // Pipe PDF document to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20)
       .text('Sales Report', { align: 'center' })
       .moveDown();

    // Add content
    doc.fontSize(12);

    if (rows && rows.length > 0) {
      const reportData = rows[0];
      const totalRevenue = Number(reportData.total_revenue);
      const totalOrders = Number(reportData.total_orders);

      doc.text(`Date: ${format(new Date(date), 'yyyy-MM-dd')}`)
         .moveDown()
         .text(`Total Revenue: Rs.${totalRevenue.toFixed(2)}`)
         .text(`Total Orders: ${totalOrders}`)
         .text(`Average Order Value: Rs.${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}`);
    } else {
      doc.text('No sales data available for this date.')
         .moveDown()
         .text(`Date: ${format(new Date(date), 'yyyy-MM-dd')}`)
         .text('Total Revenue: Rs.0.00')
         .text('Total Orders: 0')
         .text('Average Order Value: Rs.0.00');
    }

    // End the PDF document
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    // Only send error response if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF report' });
    }
  }
};

module.exports = {
    getDailySalesReport,
    getWeeklySalesReport,
    getMonthlySalesReport,
    getCustomRangeSalesReport,
    generatePdfReport
};