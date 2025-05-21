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

    // Fetch all required data for the report
    const [orderSummary] = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue
      FROM orders
      WHERE DATE(created_at) = ? AND status = 'completed'
      GROUP BY DATE(created_at)
    `, [date]);

    console.log('Order Summary:', orderSummary);

    // Fetch best selling products
    const [bestSellers] = await pool.query(`
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
    `, [date]);

    console.log('Best Sellers:', bestSellers);  

    // Fetch sales by location
    const [salesByLocation] = await pool.query(`
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
    `, [date]);

    console.log('Sales by Location:', salesByLocation); 


    // Create PDF document
    const doc = new PDFDocument();
    const fileName = `sales_report_${reportType}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    // Pipe PDF document to response
    doc.pipe(res);

    // Create the PDF content
    createPdfContent(doc, orderSummary, bestSellers, salesByLocation, date);

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

// Helper function to format PDF content with improved UI
const createPdfContent = (doc, orderSummary, bestSellers, salesByLocation, date) => {
  // Set document properties
  doc.info.Title = 'Sales Report';
  doc.info.Author = 'Juice Bar Management System';
  
  // Define colors for better styling
  const colors = {
    primary: '#2E7D32',    // Dark green
    secondary: '#4CAF50',  // Light green
    accent: '#8BC34A',     // Lime
    text: '#212121',       // Almost black
    lightText: '#757575',  // Gray
    divider: '#BDBDBD',    // Light gray
    white: '#FFFFFF'       // White
  };
  
  // Define reusable styles
  const styles = {
    header: {
      fontSize: 24,
      color: colors.primary,
      font: 'Helvetica-Bold'
    },
    subheader: {
      fontSize: 18,
      color: colors.primary,
      font: 'Helvetica-Bold'
    },
    normal: {
      fontSize: 12,
      color: colors.text,
      font: 'Helvetica'
    },
    small: {
      fontSize: 10,
      color: colors.lightText,
      font: 'Helvetica'
    },
    tableHeader: {
      fontSize: 11,
      color: colors.white,
      font: 'Helvetica-Bold'
    },
    tableRow: {
      fontSize: 10,
      color: colors.text,
      font: 'Helvetica'
    }
  };
  
  // Helper function to draw a rounded rectangle
  const drawRoundedRect = (x, y, width, height, radius, fillColor) => {
    doc.roundedRect(x, y, width, height, radius)
       .fillAndStroke(fillColor, fillColor);
  };
  
  // Helper function to format currency
  const formatCurrency = (value) => {
    return `Rs.${parseFloat(value).toFixed(2)}`;
  };
  
  // Helper function to create section
  const createSection = (title, y) => {
    const sectionY = y || doc.y + 10;
    
    // Draw section header background
    drawRoundedRect(50, sectionY, doc.page.width - 100, 30, 5, colors.primary);
    
    // Add section title
    doc.font(styles.tableHeader.font)
       .fontSize(styles.tableHeader.fontSize)
       .fillColor(styles.tableHeader.color)
       .text(title, 60, sectionY + 10, { width: doc.page.width - 120 });
    
    return sectionY + 40;
  };
  
  // Helper function to draw a table
  const drawTable = (headers, data, colWidths, formatters, startY) => {
    if (!data || data.length === 0) {
      doc.font(styles.normal.font)
         .fontSize(styles.normal.fontSize)
         .fillColor(styles.normal.color)
         .text('No data available for this section.', 50, startY);
      return startY + 30;
    }
    
    const margin = 50;
    const tableWidth = doc.page.width - (margin * 2);
    
    // Calculate column positions
    const colPositions = [];
    let posX = margin;
    colWidths.forEach(width => {
      colPositions.push(posX);
      posX += (width * tableWidth);
    });
    
    // Draw header background
    drawRoundedRect(margin, startY, tableWidth, 25, 3, colors.secondary);
    
    // Draw headers
    doc.font(styles.tableHeader.font)
       .fontSize(styles.tableHeader.fontSize)
       .fillColor(styles.tableHeader.color);
    
    headers.forEach((header, i) => {
      const align = i >= (headers.length / 2) ? 'right' : 'left';
      doc.text(header, colPositions[i], startY + 8, {
        width: colWidths[i] * tableWidth,
        align: align
      });
    });
    
    // Draw rows
    let rowY = startY + 30;
    const rowHeight = 25;
    
    data.forEach((row, rowIndex) => {
      // Check if we need a new page
      if (rowY + rowHeight > doc.page.height - 50) {
        doc.addPage();
        rowY = 50;
        
        // Redraw header on new page
        drawRoundedRect(margin, rowY - 30, tableWidth, 25, 3, colors.secondary);
        
        doc.font(styles.tableHeader.font)
           .fontSize(styles.tableHeader.fontSize)
           .fillColor(styles.tableHeader.color);
        
        headers.forEach((header, i) => {
          const align = i >= (headers.length / 2) ? 'right' : 'left';
          doc.text(header, colPositions[i], rowY - 22, {
            width: colWidths[i] * tableWidth,
            align: align
          });
        });
        
        rowY += 5;
      }
      
      // Draw alternating row background for better readability
      if (rowIndex % 2 === 0) {
        drawRoundedRect(margin, rowY, tableWidth, rowHeight, 0, '#f5f5f5');
      }
      
      // Draw cell data
      doc.font(styles.tableRow.font)
         .fontSize(styles.tableRow.fontSize)
         .fillColor(styles.tableRow.color);
      
      formatters.forEach((formatter, i) => {
        const value = formatter(row);
        const align = i >= (formatters.length / 2) ? 'right' : 'left';
        doc.text(value, colPositions[i], rowY + 8, {
          width: colWidths[i] * tableWidth,
          align: align
        });
      });
      
      rowY += rowHeight;
    });
    
    return rowY + 15;
  };
  
  // Add logo and title
  doc.font(styles.header.font)
     .fontSize(styles.header.fontSize)
     .fillColor(styles.header.color);
  
  // Draw a background header bar
  drawRoundedRect(0, 0, doc.page.width, 60, 0, colors.primary);
  
  // Title on the header bar
  doc.font(styles.header.font)
     .fontSize(styles.header.fontSize)
     .fillColor(colors.white)
     .text('SALES REPORT', 50, 20, { align: 'center' });
  
  // Add date under header
  doc.font(styles.normal.font)
     .fontSize(styles.normal.fontSize)
     .fillColor(styles.normal.color)
     .text(`Report Date: ${format(new Date(date), 'MMMM dd, yyyy')}`, 50, 70, { align: 'center' });
  
  // Create a summary card
  let yPos = 100;
  
  if (orderSummary && orderSummary.length > 0) {
    const reportData = orderSummary[0];
    const totalRevenue = parseFloat(reportData.total_revenue) || 0;
    const totalOrders = parseInt(reportData.total_orders) || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Draw summary card background
    drawRoundedRect(50, yPos, doc.page.width - 100, 100, 10, '#f5f5f5');
    
    // Draw summary metrics
    const metrics = [
      { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
      { label: 'Total Orders', value: totalOrders.toString() },
      { label: 'Average Order Value', value: formatCurrency(avgOrderValue) }
    ];
    
    const metricWidth = (doc.page.width - 100) / metrics.length;
    
    metrics.forEach((metric, i) => {
      const xPos = 50 + (i * metricWidth);
      
      // Draw background circle for the metric
      doc.circle(xPos + (metricWidth / 2), yPos + 40, 30)
         .fill(colors.secondary);
      
      // Draw value in the circle
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .fillColor(colors.white)
         .text(metric.value, xPos, yPos + 35, { 
           width: metricWidth, 
           align: 'center' 
         });
      
      // Draw label below the circle
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor(colors.text)
         .text(metric.label, xPos, yPos + 75, {
           width: metricWidth,
           align: 'center'
         });
    });
    
    yPos += 120;
  } else {
    // Draw empty summary card
    drawRoundedRect(50, yPos, doc.page.width - 100, 50, 10, '#f5f5f5');
    
    doc.font(styles.normal.font)
       .fontSize(styles.normal.fontSize)
       .fillColor(styles.normal.color)
       .text('No sales data available for this date.', 50, yPos + 15, { 
         width: doc.page.width - 100, 
         align: 'center' 
       });
    
    yPos += 70;
  }
  
  // Best selling products section
  yPos = createSection('Best Selling Products', yPos);
  
  // Draw best sellers table
  const bestSellersHeaders = ['Rank', 'Product', 'Juice Bar', 'Unit Price', 'Qty', 'Total Sales'];
  const bestSellersWidths = [0.07, 0.23, 0.23, 0.15, 0.12, 0.2]; // Proportions of table width
  const bestSellersFormatters = [
    row => (bestSellers.indexOf(row) + 1).toString(),
    row => row.product_name || '',
    row => row.juice_bar_name || '',
    row => formatCurrency(row.price || 0),
    row => (parseInt(row.total_quantity) || 0).toString(),
    row => formatCurrency(row.total_sales || 0)
  ];
  
  yPos = drawTable(bestSellersHeaders, bestSellers, bestSellersWidths, bestSellersFormatters, yPos);
  
  // Add a new page if we're close to the bottom
  if (yPos > doc.page.height - 200) {
    doc.addPage();
    yPos = 50;
  }
  
  // Sales by location section
  yPos = createSection('Sales by Location', yPos);
  
  // Calculate total revenue from all locations
  const totalRevenue = salesByLocation.reduce((total, loc) => 
    total + parseFloat(loc.total_revenue || 0), 0);
  
  // Draw sales by location table
  const locationHeaders = ['Juice Bar', 'Orders', 'Revenue', 'Avg. Order Value', '% of Total'];
  const locationWidths = [0.3, 0.15, 0.2, 0.2, 0.15]; // Proportions of table width
  const locationFormatters = [
    row => row.juice_bar_name || '',
    row => (parseInt(row.total_orders) || 0).toString(),
    row => formatCurrency(row.total_revenue || 0),
    row => {
      const orders = parseInt(row.total_orders) || 0;
      const revenue = parseFloat(row.total_revenue) || 0;
      return formatCurrency(orders > 0 ? revenue / orders : 0);
    },
    row => {
      const revenue = parseFloat(row.total_revenue) || 0;
      const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
      return `${percentage.toFixed(2)}%`;
    }
  ];
  
  yPos = drawTable(locationHeaders, salesByLocation, locationWidths, locationFormatters, yPos);
  
  // Add footer with page numbers
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    
    // Draw footer line
    doc.moveTo(50, doc.page.height - 40)
       .lineTo(doc.page.width - 50, doc.page.height - 40)
       .stroke(colors.divider);
    
    // Add footer text
    doc.font(styles.small.font)
       .fontSize(styles.small.fontSize)
       .fillColor(styles.lightText)
       .text(`Report generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 50, doc.page.height - 30, {
         align: 'left',
         width: 200
       })
       .text(`Page ${i + 1} of ${totalPages}`, doc.page.width - 150, doc.page.height - 30, {
         align: 'right',
         width: 100
       });
  }
};

module.exports = {
    getDailySalesReport,
    getWeeklySalesReport,
    getMonthlySalesReport,
    getCustomRangeSalesReport,
    createPdfContent,
    generatePdfReport
};