const db = require("../config/db");

// Get daily sales report
const getDailySalesReport = async (date) => {
    // Use current date if no date provided
    const reportDate = date || new Date().toISOString().split('T')[0];
    
    try {
        // Get total sales amount and order count for the specified date
        const [totalSales] = await db.execute(`
            SELECT 
                COUNT(order_id) AS total_orders,
                SUM(total_amount) AS total_revenue
            FROM orders
            WHERE DATE(created_at) = ? 
            AND status IN ('completed', 'ready')
        `, [reportDate]);
        
        // Get best selling products for the specified date
        const [bestSellers] = await db.execute(`
            SELECT 
                p.id AS product_id,
                p.name AS product_name,
                p.price,
                SUM(oi.quantity) AS total_quantity,
                SUM(oi.subtotal) AS total_sales,
                j.name AS juice_bar_name,
                j.juice_bar_id
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN products p ON oi.product_id = p.id
            JOIN juice_bars j ON p.juice_bar_id = j.juice_bar_id
            WHERE DATE(o.created_at) = ?
            AND o.status IN ('completed', 'ready')
            GROUP BY p.id, j.juice_bar_id
            ORDER BY total_quantity DESC
        `, [reportDate]);
        
        // Get sales by juice bar
        const [salesByLocation] = await db.execute(`
            SELECT 
                j.juice_bar_id,
                j.name AS juice_bar_name,
                COUNT(o.order_id) AS total_orders,
                SUM(o.total_amount) AS total_revenue
            FROM orders o
            JOIN juice_bars j ON o.juice_bar_id = j.juice_bar_id
            WHERE DATE(o.created_at) = ?
            AND o.status IN ('completed', 'ready')
            GROUP BY j.juice_bar_id
        `, [reportDate]);
        
        // Get sales by hour of day
        const [salesByHour] = await db.execute(`
            SELECT 
                HOUR(created_at) AS hour,
                COUNT(order_id) AS total_orders,
                SUM(total_amount) AS total_revenue
            FROM orders
            WHERE DATE(created_at) = ?
            AND status IN ('completed', 'ready')
            GROUP BY HOUR(created_at)
            ORDER BY hour
        `, [reportDate]);
        
        return {
            date: reportDate,
            summary: totalSales[0] || { total_orders: 0, total_revenue: 0 },
            bestSellers: bestSellers,
            salesByLocation: salesByLocation,
            salesByHour: salesByHour
        };
    } catch (err) {
        console.error("Database error in getDailySalesReport:", err);
        throw err;
    }
};

// Get weekly sales report
const getWeeklySalesReport = async (startDate, endDate) => {
    try {
        // Calculate default dates if not provided (last 7 days)
        if (!endDate) {
            endDate = new Date().toISOString().split('T')[0];
        }
        
        if (!startDate) {
            const start = new Date();
            start.setDate(start.getDate() - 6); // Last 7 days including today
            startDate = start.toISOString().split('T')[0];
        }
        
        // Get total sales amount and order count for the date range
        const [totalSales] = await db.execute(`
            SELECT 
                COUNT(order_id) AS total_orders,
                SUM(total_amount) AS total_revenue
            FROM orders
            WHERE DATE(created_at) BETWEEN ? AND ?
            AND status IN ('completed', 'ready')
        `, [startDate, endDate]);
        
        // Get sales by day
        const [salesByDay] = await db.execute(`
            SELECT 
                DATE(created_at) AS date,
                COUNT(order_id) AS total_orders,
                SUM(total_amount) AS total_revenue
            FROM orders
            WHERE DATE(created_at) BETWEEN ? AND ?
            AND status IN ('completed', 'ready')
            GROUP BY DATE(created_at)
            ORDER BY date
        `, [startDate, endDate]);
        
        // Get best selling products for the period
        const [bestSellers] = await db.execute(`
            SELECT 
                p.id AS product_id,
                p.name AS product_name,
                p.price,
                SUM(oi.quantity) AS total_quantity,
                SUM(oi.subtotal) AS total_sales,
                j.name AS juice_bar_name,
                j.juice_bar_id
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN products p ON oi.product_id = p.id
            JOIN juice_bars j ON p.juice_bar_id = j.juice_bar_id
            WHERE DATE(o.created_at) BETWEEN ? AND ?
            AND o.status IN ('completed', 'ready')
            GROUP BY p.id, j.juice_bar_id
            ORDER BY total_quantity DESC
            LIMIT 10
        `, [startDate, endDate]);
        
        // Get sales by juice bar
        const [salesByLocation] = await db.execute(`
            SELECT 
                j.juice_bar_id,
                j.name AS juice_bar_name,
                COUNT(o.order_id) AS total_orders,
                SUM(o.total_amount) AS total_revenue
            FROM orders o
            JOIN juice_bars j ON o.juice_bar_id = j.juice_bar_id
            WHERE DATE(o.created_at) BETWEEN ? AND ?
            AND o.status IN ('completed', 'ready')
            GROUP BY j.juice_bar_id
        `, [startDate, endDate]);
        
        return {
            startDate,
            endDate,
            summary: totalSales[0] || { total_orders: 0, total_revenue: 0 },
            salesByDay,
            bestSellers,
            salesByLocation
        };
    } catch (err) {
        console.error("Database error in getWeeklySalesReport:", err);
        throw err;
    }
};

// Get monthly sales report
const getMonthlySalesReport = async (year, month) => {
    try {
        // Use current year and month if not provided
        if (!year || !month) {
            const now = new Date();
            year = year || now.getFullYear();
            month = month || now.getMonth() + 1; // JS months are 0-indexed
        }
        
        // Format month to ensure it's two digits
        const formattedMonth = month.toString().padStart(2, '0');
        
        // Get total sales amount and order count for the month
        const [totalSales] = await db.execute(`
            SELECT 
                COUNT(order_id) AS total_orders,
                SUM(total_amount) AS total_revenue
            FROM orders
            WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
            AND status IN ('completed', 'ready')
        `, [year, month]);
        
        // Get sales by day of month
        const [salesByDay] = await db.execute(`
            SELECT 
                DAY(created_at) AS day,
                COUNT(order_id) AS total_orders,
                SUM(total_amount) AS total_revenue
            FROM orders
            WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
            AND status IN ('completed', 'ready')
            GROUP BY DAY(created_at)
            ORDER BY day
        `, [year, month]);
        
        // Get best selling products for the month
        const [bestSellers] = await db.execute(`
            SELECT 
                p.id AS product_id,
                p.name AS product_name,
                p.price,
                SUM(oi.quantity) AS total_quantity,
                SUM(oi.subtotal) AS total_sales,
                j.name AS juice_bar_name,
                j.juice_bar_id
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN products p ON oi.product_id = p.id
            JOIN juice_bars j ON p.juice_bar_id = j.juice_bar_id
            WHERE YEAR(o.created_at) = ? AND MONTH(o.created_at) = ?
            AND o.status IN ('completed', 'ready')
            GROUP BY p.id, j.juice_bar_id
            ORDER BY total_quantity DESC
            LIMIT 10
        `, [year, month]);
        
        // Get sales by juice bar
        const [salesByLocation] = await db.execute(`
            SELECT 
                j.juice_bar_id,
                j.name AS juice_bar_name,
                COUNT(o.order_id) AS total_orders,
                SUM(o.total_amount) AS total_revenue
            FROM orders o
            JOIN juice_bars j ON o.juice_bar_id = j.juice_bar_id
            WHERE YEAR(o.created_at) = ? AND MONTH(o.created_at) = ?
            AND o.status IN ('completed', 'ready')
            GROUP BY j.juice_bar_id
        `, [year, month]);
        
        // Compare with previous month
        const previousMonth = month === 1 ? 12 : month - 1;
        const previousYear = month === 1 ? year - 1 : year;
        
        const [previousMonthData] = await db.execute(`
            SELECT 
                COUNT(order_id) AS total_orders,
                SUM(total_amount) AS total_revenue
            FROM orders
            WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
            AND status IN ('completed', 'ready')
        `, [previousYear, previousMonth]);
        
        // Calculate growth
        const currentRevenue = totalSales[0]?.total_revenue || 0;
        const previousRevenue = previousMonthData[0]?.total_revenue || 0;
        
        let revenueGrowth = 0;
        if (previousRevenue > 0) {
            revenueGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
        }
        
        return {
            year,
            month,
            summary: totalSales[0] || { total_orders: 0, total_revenue: 0 },
            salesByDay,
            bestSellers,
            salesByLocation,
            comparison: {
                previousMonth: {
                    year: previousYear,
                    month: previousMonth,
                    data: previousMonthData[0] || { total_orders: 0, total_revenue: 0 }
                },
                revenueGrowth: revenueGrowth
            }
        };
    } catch (err) {
        console.error("Database error in getMonthlySalesReport:", err);
        throw err;
    }
};

// Get sales data for a custom date range
const getCustomRangeSalesReport = async (startDate, endDate) => {
    if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
    }
    
    try {
        // Get total sales amount and order count for the date range
        const [totalSales] = await db.execute(`
            SELECT 
                COUNT(order_id) AS total_orders,
                SUM(total_amount) AS total_revenue
            FROM orders
            WHERE DATE(created_at) BETWEEN ? AND ?
            AND status IN ('completed', 'ready')
        `, [startDate, endDate]);
        
        // Get sales by day
        const [salesByDay] = await db.execute(`
            SELECT 
                DATE(created_at) AS date,
                COUNT(order_id) AS total_orders,
                SUM(total_amount) AS total_revenue
            FROM orders
            WHERE DATE(created_at) BETWEEN ? AND ?
            AND status IN ('completed', 'ready')
            GROUP BY DATE(created_at)
            ORDER BY date
        `, [startDate, endDate]);
        
        // Get best selling products for the period
        const [bestSellers] = await db.execute(`
            SELECT 
                p.id AS product_id,
                p.name AS product_name,
                p.price,
                SUM(oi.quantity) AS total_quantity,
                SUM(oi.subtotal) AS total_sales,
                j.name AS juice_bar_name,
                j.juice_bar_id
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN products p ON oi.product_id = p.id
            JOIN juice_bars j ON p.juice_bar_id = j.juice_bar_id
            WHERE DATE(o.created_at) BETWEEN ? AND ?
            AND o.status IN ('completed', 'ready')
            GROUP BY p.id, j.juice_bar_id
            ORDER BY total_quantity DESC
            LIMIT 10
        `, [startDate, endDate]);
        
        // Get sales by juice bar
        const [salesByLocation] = await db.execute(`
            SELECT 
                j.juice_bar_id,
                j.name AS juice_bar_name,
                COUNT(o.order_id) AS total_orders,
                SUM(o.total_amount) AS total_revenue
            FROM orders o
            JOIN juice_bars j ON o.juice_bar_id = j.juice_bar_id
            WHERE DATE(o.created_at) BETWEEN ? AND ?
            AND o.status IN ('completed', 'ready')
            GROUP BY j.juice_bar_id
        `, [startDate, endDate]);
        
        return {
            startDate,
            endDate,
            summary: totalSales[0] || { total_orders: 0, total_revenue: 0 },
            salesByDay,
            bestSellers,
            salesByLocation
        };
    } catch (err) {
        console.error("Database error in getCustomRangeSalesReport:", err);
        throw err;
    }
};

module.exports = {
    getDailySalesReport,
    getWeeklySalesReport,
    getMonthlySalesReport,
    getCustomRangeSalesReport
};