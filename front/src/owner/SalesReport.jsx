import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./salesReport.css";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import {
  AttachMoney,
  TrendingUp,
  BarChart,
  DateRange,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  ShoppingBasket,
  Store,
  CalendarToday
} from "@mui/icons-material";
import { 
  LineChart, 
  Line, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import OwnerSidebar from "./OwnerSidebar";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#6B88FF'];

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(amount);
};

const SalesReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState("daily");
  const [reportData, setReportData] = useState(null);
  
  // Filter state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6); // Last 7 days
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Load report on component mount
  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/");
        return;
      }
      
      let url = "";
      
      switch (reportType) {
        case "daily":
          url = `/api/reports/daily?date=${selectedDate}`;
          break;
        case "weekly":
          url = `/api/reports/weekly?startDate=${startDate}&endDate=${endDate}`;
          break;
        case "monthly":
          url = `/api/reports/monthly?year=${selectedYear}&month=${selectedMonth}`;
          break;
        case "custom":
          url = `/api/reports/custom?startDate=${startDate}&endDate=${endDate}`;
          break;
        default:
          url = "/api/reports/daily";
      }
      
      const response = await fetch(`http://localhost:5000${url}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch report: ${response.status}`);
      }
      
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error("Error fetching sales report:", err);
      setError(err.message || "Failed to fetch sales report");
    } finally {
      setLoading(false);
    }
  };

  const handleReportTypeChange = (event, newValue) => {
    setReportType(newValue);
  };
  
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };
  
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };
  
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };
  
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };
  
  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };
  
  const handleGenerateReport = () => {
    fetchReport();
  };
  
  // Generate years array for the dropdown (last 5 years)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };
  
  // Generate months array for the dropdown
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  // Prepare data for charts
  const prepareSalesByLocationData = () => {
    if (!reportData || !reportData.salesByLocation) return [];
    return reportData.salesByLocation.map(item => ({
      name: item.juice_bar_name,
      value: parseFloat(item.total_revenue)
    }));
  };
  
  const prepareSalesByDayData = () => {
    if (!reportData) return [];
    
    if (reportType === 'daily' && reportData.salesByHour) {
      return reportData.salesByHour.map(item => ({
        name: `${item.hour}:00`,
        revenue: parseFloat(item.total_revenue),
        orders: parseInt(item.total_orders)
      }));
    } else if ((reportType === 'weekly' || reportType === 'custom') && reportData.salesByDay) {
      return reportData.salesByDay.map(item => ({
        name: new Date(item.date).toLocaleDateString(),
        revenue: parseFloat(item.total_revenue),
        orders: parseInt(item.total_orders)
      }));
    } else if (reportType === 'monthly' && reportData.salesByDay) {
      return reportData.salesByDay.map(item => ({
        name: `${item.day}`,
        revenue: parseFloat(item.total_revenue),
        orders: parseInt(item.total_orders)
      }));
    }
    
    return [];
  };

return (
  <OwnerSidebar>
    <Box className="sales-report-container">
      <div className="report-header">
        <h1>Sales Reports</h1>
        {/* Removed the "Back to Dashboard" button */}
      </div>

      <Paper className="report-tabs">
        <Tabs
          value={reportType}
          onChange={handleReportTypeChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab value="daily" label="Daily" icon={<CalendarToday />} />
          <Tab value="weekly" label="Weekly" icon={<DateRange />} />
          <Tab value="monthly" label="Monthly" icon={<BarChart />} />
          <Tab value="custom" label="Custom Range" icon={<DateRange />} />
        </Tabs>
        
        <div className="filter-section">
          {/* Daily Report Filter */}
          {reportType === "daily" && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  id="date"
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleGenerateReport}
                  startIcon={<Refresh />}
                  fullWidth
                >
                  Generate
                </Button>
              </Grid>
            </Grid>
          )}
          
          {/* Monthly Report Filter */}
          {reportType === "monthly" && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="month-select-label">Month</InputLabel>
                  <Select
                    labelId="month-select-label"
                    id="month-select"
                    value={selectedMonth}
                    label="Month"
                    onChange={handleMonthChange}
                  >
                    {months.map((month) => (
                      <MenuItem key={month.value} value={month.value}>
                        {month.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="year-select-label">Year</InputLabel>
                  <Select
                    labelId="year-select-label"
                    id="year-select"
                    value={selectedYear}
                    label="Year"
                    onChange={handleYearChange}
                  >
                    {getYearOptions().map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleGenerateReport}
                  startIcon={<Refresh />}
                  fullWidth
                >
                  Generate
                </Button>
              </Grid>
            </Grid>
          )}
          
          {/* Weekly Report Filter */}
          {reportType === "weekly" && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4} md={3}>
                <TextField
                  id="start-date"
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <TextField
                  id="end-date"
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleGenerateReport}
                  startIcon={<Refresh />}
                  fullWidth
                >
                  Generate
                </Button>
              </Grid>
            </Grid>
          )}
          
          {/* Custom Range Filter */}
          {reportType === "custom" && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4} md={3}>
                <TextField
                  id="custom-start-date"
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <TextField
                  id="custom-end-date"
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleGenerateReport}
                  startIcon={<Refresh />}
                  fullWidth
                >
                  Generate
                </Button>
              </Grid>
            </Grid>
          )}
        </div>
      </Paper>
      
      {loading ? (
        <div className="loading-container">
          <CircularProgress size={60} />
        </div>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      ) : !reportData ? (
        <div className="empty-message">
          <p>Select report parameters and click Generate to view data</p>
        </div>
      ) : (
        <Box>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card className={`stat-card primary-card`}>
                <CardContent>
                  <Typography color="inherit" variant="subtitle2" sx={{ opacity: 0.7 }}>
                    Total Revenue
                  </Typography>
                  <Typography color="inherit" variant="h4" component="div" sx={{ my: 1 }}>
                    {formatCurrency(reportData.summary?.total_revenue || 0)}
                  </Typography>
                  {reportType === 'monthly' && reportData.comparison && (
                    <div className={reportData.comparison.revenueGrowth > 0 ? 'growth-positive' : 'growth-negative'}>
                      {reportData.comparison.revenueGrowth > 0 ? (
                        <ArrowUpward className="growth-icon" />
                      ) : (
                        <ArrowDownward className="growth-icon" />
                      )}
                      <span>
                        {Math.abs(reportData.comparison.revenueGrowth).toFixed(2)}% from previous month
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card className={`stat-card success-card`}>
                <CardContent>
                  <Typography color="inherit" variant="subtitle2" sx={{ opacity: 0.7 }}>
                    Total Orders
                  </Typography>
                  <Typography color="inherit" variant="h4" component="div" sx={{ my: 1 }}>
                    {reportData.summary?.total_orders || 0}
                  </Typography>
                  <Typography color="inherit" variant="body2">
                    {reportType === 'daily' 
                      ? `For ${new Date(reportData.date).toLocaleDateString()}`
                      : reportType === 'monthly'
                        ? `For ${months.find(m => m.value === parseInt(reportData.month))?.label} ${reportData.year}`
                        : `From ${new Date(reportData.startDate).toLocaleDateString()} to ${new Date(reportData.endDate).toLocaleDateString()}`
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card className={`stat-card info-card`}>
                <CardContent>
                  <Typography color="inherit" variant="subtitle2" sx={{ opacity: 0.7 }}>
                    Average Order Value
                  </Typography>
                  <Typography color="inherit" variant="h4" component="div" sx={{ my: 1 }}>
                    {reportData.summary?.total_orders > 0 
                      ? formatCurrency(reportData.summary.total_revenue / reportData.summary.total_orders) 
                      : formatCurrency(0)
                    }
                  </Typography>
                  <Typography color="inherit" variant="body2">
                    Per order
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card className={`stat-card warning-card`}>
                <CardContent>
                  <Typography color="inherit" variant="subtitle2" sx={{ opacity: 0.7 }}>
                    {reportType === 'daily' ? 'Juice Bars Active' : 'Peak Sales'}
                  </Typography>
                  <Typography color="inherit" variant="h4" component="div" sx={{ my: 1 }}>
                    {reportType === 'daily' 
                      ? reportData.salesByLocation?.length || 0
                      : prepareSalesByDayData().length > 0 
                        ? prepareSalesByDayData().reduce((max, item) => 
                            item.revenue > max.revenue ? item : max, 
                            { revenue: 0 }
                          ).name
                        : 'N/A'
                    }
                  </Typography>
                  <Typography color="inherit" variant="body2">
                    {reportType === 'daily' 
                      ? 'Locations with sales' 
                      : 'Day with highest sales'
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Sales Trend Chart */}
            <Grid item xs={12} md={8}>
              <div className="chart-container">
                <div className="chart-header">
                  <h2>
                    {reportType === 'daily' 
                      ? "Sales by Hour" 
                      : reportType === 'monthly' 
                        ? "Daily Sales for the Month"
                        : "Sales Trend"}
                  </h2>
                  <p>
                    {reportType === 'daily' 
                      ? `For ${new Date(reportData.date).toLocaleDateString()}`
                      : reportType === 'monthly'
                        ? `${months.find(m => m.value === parseInt(reportData.month))?.label} ${reportData.year}`
                        : `From ${new Date(reportData.startDate).toLocaleDateString()} to ${new Date(reportData.endDate).toLocaleDateString()}`
                    }
                  </p>
                </div>
                <div className="chart-content">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={prepareSalesByDayData()}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" name="Revenue (Rs)" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#82ca9d" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Grid>
            
            {/* Sales by Location Pie Chart */}
            <Grid item xs={12} md={4}>
              <div className="chart-container">
                <div className="chart-header">
                  <h2>Sales by Location</h2>
                  <p>Revenue by Juice Bar</p>
                </div>
                <div className="chart-content">
                  {reportData.salesByLocation?.length === 0 ? (
                    <div className="empty-message">
                      <p>No location data available</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareSalesByLocationData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {prepareSalesByLocationData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </Grid>
          </Grid>
          
          {/* Best Selling Products Table */}
          <div className="table-card">
            <div className="table-header">
              <h2>Best Selling Products</h2>
              <p>Products ranked by quantity sold</p>
            </div>
            <CardContent>
              {reportData.bestSellers?.length === 0 ? (
                <div className="empty-message">
                  <p>No sales data available for this period</p>
                </div>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>Product</TableCell>
                        <TableCell>Juice Bar</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Quantity Sold</TableCell>
                        <TableCell align="right">Total Sales</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.bestSellers?.map((product, index) => (
                        <TableRow key={`${product.product_id}-${product.juice_bar_id}`} className={index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{product.product_name}</TableCell>
                          <TableCell>{product.juice_bar_name}</TableCell>
                          <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                          <TableCell align="right">{product.total_quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(product.total_sales)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </div>
          
          {/* Sales by Location Table */}
          <div className="table-card">
            <div className="table-header">
              <h2>Sales by Location</h2>
              <p>Detailed revenue data for each juice bar</p>
            </div>
            <CardContent>
              {reportData.salesByLocation?.length === 0 ? (
                <div className="empty-message">
                  <p>No location data available for this period</p>
                </div>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Juice Bar</TableCell>
                        <TableCell align="right">Total Orders</TableCell>
                        <TableCell align="right">Total Revenue</TableCell>
                        <TableCell align="right">Average Order Value</TableCell>
                        <TableCell align="right">% of Total Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.salesByLocation?.map((location, index) => (
                        <TableRow key={location.juice_bar_id} className={index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                          <TableCell>{location.juice_bar_name}</TableCell>
                          <TableCell align="right">{location.total_orders}</TableCell>
                          <TableCell align="right">{formatCurrency(location.total_revenue)}</TableCell>
                          <TableCell align="right">
                            {location.total_orders > 0 
                              ? formatCurrency(location.total_revenue / location.total_orders)
                              : formatCurrency(0)
                            }
                          </TableCell>
                          <TableCell align="right">
                            {reportData.summary?.total_revenue > 0 
                              ? `${((location.total_revenue / reportData.summary.total_revenue) * 100).toFixed(2)}%`
                              : '0%'
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </div>
        </Box>
      )}
    </Box>
  </OwnerSidebar>
);}

export default SalesReport;