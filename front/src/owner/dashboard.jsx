import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Tabs, 
  Tab, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Divider, 
  CircularProgress, 
  Alert
} from "@mui/material";
import { 
  DateRange, 
  CalendarToday, 
  BarChart, 
  Refresh, 
  ArrowUpward, 
  ArrowDownward 
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
import "./dashboard.css";
import OwnerSidebar from "./OwnerSidebar";

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#6B88FF'];

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'LKR',
    minimumFractionDigits: 2
  }).format(amount);
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Report state
  const [reportType, setReportType] = useState("daily");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  useEffect(() => {
    // Check if user is logged in and is an owner
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }

    const user = JSON.parse(userData);
    if (user.user.role !== "owner") {
      navigate("/");
      return;
    }

    setUser(user.user);
  }, [navigate]);

  useEffect(() => {
    fetchReport();
  }, [reportType]); // Refetch when report type changes

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
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
  
  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
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
        revenue: parseFloat(item.total_revenue || 0),
        orders: parseInt(item.total_orders || 0)
      }));
    } else if ((reportType === 'weekly' || reportType === 'custom') && reportData.salesByDay) {
      return reportData.salesByDay.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: parseFloat(item.total_revenue || 0),
        orders: parseInt(item.total_orders || 0)
      }));
    } else if (reportType === 'monthly' && reportData.salesByDay) {
      return reportData.salesByDay.map(item => ({
        name: `${item.day}`,
        revenue: parseFloat(item.total_revenue || 0),
        orders: parseInt(item.total_orders || 0)
      }));
    }
    
    return [];
  };
  
  // Get best selling products
  const getBestSellingProducts = () => {
    if (!reportData || !reportData.bestSellers) return [];
    return reportData.bestSellers.slice(0, 5); // Top 5 products
  };

  return (
    <OwnerSidebar>
      <Box className="dashboard-content">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h3" component="h1">
            Owner Dashboard
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {user ? `Welcome, ${user.username}!` : 'Welcome to the Owner Dashboard!'}
          </Typography>
        </Box>

        {/* Sales Overview Section */}
        <Box sx={{ mb: 4 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Sales Overview
            </Typography>
            
            {/* Report Type Tabs */}
            <Tabs
              value={reportType}
              onChange={handleReportTypeChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab value="daily" label="Daily" icon={<CalendarToday />} />
              <Tab value="weekly" label="Weekly" icon={<DateRange />} />
              <Tab value="monthly" label="Monthly" icon={<BarChart />} />
              <Tab value="custom" label="Custom Range" icon={<DateRange />} />
            </Tabs>
            
            {/* Filter Controls */}
            <Box sx={{ mb: 3, p: 2, bgcolor: "#f9f9f9", borderRadius: 1 }}>
              {reportType === "daily" && (
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      id="date"
                      label="Select Date"
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
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
              
              {reportType === "monthly" && (
                <Grid container spacing={2} alignItems="flex-end">
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
              
              {(reportType === "weekly" || reportType === "custom") && (
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} sm={4} md={3}>
                    <TextField
                      id="start-date"
                      label="Start Date"
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
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
                      InputLabelProps={{ shrink: true }}
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
            </Box>
            
            {/* Sales Data */}
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress size={60} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            ) : !reportData ? (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <Typography variant="h6" color="textSecondary">
                  Select report parameters and click Generate to view data
                </Typography>
              </Box>
            ) : (
              <>
                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#f1f8e9', boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                          Total Revenue
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ my: 1, fontWeight: 'bold', color: '#2e7d32' }}>
                          {formatCurrency(reportData.summary?.total_revenue || 0)}
                        </Typography>
                        {reportType === 'monthly' && reportData.comparison && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {reportData.comparison.revenueGrowth > 0 ? (
                              <ArrowUpward fontSize="small" sx={{ color: 'success.main' }} />
                            ) : (
                              <ArrowDownward fontSize="small" sx={{ color: 'error.main' }} />
                            )}
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {Math.abs(reportData.comparison.revenueGrowth).toFixed(2)}% from previous month
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#e3f2fd', boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                          Total Orders
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ my: 1, fontWeight: 'bold', color: '#1565c0' }}>
                          {reportData.summary?.total_orders || 0}
                        </Typography>
                        <Typography variant="body2">
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
                    <Card sx={{ height: '100%', bgcolor: '#fff8e1', boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                          Average Order Value
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ my: 1, fontWeight: 'bold', color: '#f57c00' }}>
                          {reportData.summary?.total_orders > 0 
                            ? formatCurrency(reportData.summary.total_revenue / reportData.summary.total_orders) 
                            : formatCurrency(0)
                          }
                        </Typography>
                        <Typography variant="body2">
                          Per order
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', bgcolor: '#fce4ec', boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                          {reportType === 'daily' ? 'Juice Bars Active' : 'Peak Sales'}
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ my: 1, fontWeight: 'bold', color: '#c2185b' }}>
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
                        <Typography variant="body2">
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
                <Grid container spacing={3}>
                  {/* Sales Trend Chart */}
                  <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%', boxShadow: 2 }}>
                      <CardHeader 
                        title={
                          reportType === 'daily' 
                            ? "Sales by Hour" 
                            : reportType === 'monthly' 
                              ? "Daily Sales for the Month"
                              : "Sales Trend"
                        } 
                        subheader={
                          reportType === 'daily' 
                            ? `For ${new Date(reportData.date).toLocaleDateString()}`
                            : reportType === 'monthly'
                              ? `${months.find(m => m.value === parseInt(reportData.month))?.label} ${reportData.year}`
                              : `From ${new Date(reportData.startDate).toLocaleDateString()} to ${new Date(reportData.endDate).toLocaleDateString()}`
                        }
                      />
                      <Divider />
                      <CardContent sx={{ height: 350 }}>
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
                            <RechartsTooltip formatter={(value, name) => name === "Revenue (Rs)" ? formatCurrency(value) : value} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="revenue" name="Revenue (Rs)" fill="#8884d8" />
                            <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#82ca9d" />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Sales by Location Pie Chart */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%', boxShadow: 2 }}>
                      <CardHeader 
                        title="Sales by Location" 
                        subheader="Revenue by Juice Bar" 
                      />
                      <Divider />
                      <CardContent sx={{ height: 350 }}>
                        {!reportData.salesByLocation || reportData.salesByLocation.length === 0 ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography variant="body1" color="textSecondary">
                              No location data available
                            </Typography>
                          </Box>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={prepareSalesByLocationData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={120}
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
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Best Selling Products */}
                  <Grid item xs={12}>
                    <Card sx={{ boxShadow: 2 }}>
                      <CardHeader 
                        title="Best Selling Products" 
                        subheader="Top selling products for the selected period" 
                      />
                      <Divider />
                      <CardContent>
                        {!reportData.bestSellers || reportData.bestSellers.length === 0 ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
                            <Typography variant="body1" color="textSecondary">
                              No sales data available
                            </Typography>
                          </Box>
                        ) : (
                          <Grid container spacing={2}>
                            {getBestSellingProducts().map((product, index) => (
                              <Grid item xs={12} sm={6} md={4} lg={2.4} key={`${product.product_id}-${product.juice_bar_id}`}>
                                <Card 
                                  variant="outlined" 
                                  sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                      transform: 'translateY(-4px)',
                                      boxShadow: 3
                                    }
                                  }}
                                >
                                  <Box sx={{ 
                                    bgcolor: COLORS[index % COLORS.length], 
                                    color: 'white', 
                                    p: 1, 
                                    display: 'flex', 
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                  }}>
                                    <Typography variant="h5" fontWeight="bold">#{index + 1}</Typography>
                                  </Box>
                                  <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" gutterBottom noWrap title={product.product_name}>
                                      {product.product_name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                      {product.juice_bar_name}
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium" color="primary">
                                      {formatCurrency(product.price)} x {product.total_quantity} units
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                                      {formatCurrency(product.total_sales)}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        </Box>
      </Box>
    </OwnerSidebar>
  );
};

export default Dashboard;