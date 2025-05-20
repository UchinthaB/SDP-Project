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
  Alert,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  useMediaQuery
} from "@mui/material";
import { 
  DateRange, 
  CalendarToday, 
  BarChart, 
  Refresh, 
  ArrowUpward, 
  ArrowDownward,
  TrendingUp,
  LocalCafe,
  PieChart as PieChartIcon,
  Analytics,
  ReceiptLong
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
  Cell,
  Area,
  AreaChart
} from "recharts";
import { styled } from '@mui/material/styles';
import "./dashboard.css";
import OwnerSidebar from "./OwnerSidebar";

// Enhanced styling for cards and other elements
const StyledCard = styled(Card)(({ theme, color }) => ({
  height: '100%',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
  backgroundColor: color ? alpha(theme.palette[color].light, 0.3) : theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
  }
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  '& .MuiCardHeader-title': {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: theme.palette.text.primary
  },
  '& .MuiCardHeader-subheader': {
    fontSize: '0.85rem',
    color: theme.palette.text.secondary
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: '48px',
  textTransform: 'none',
  fontSize: '0.9rem',
  fontWeight: 500,
  '& .MuiSvgIcon-root': {
    marginBottom: '0 !important',
    marginRight: theme.spacing(1)
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
  padding: theme.spacing(1, 2.5),
  '&:hover': {
    boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem'
  }
}));

const StatValue = styled(Typography)(({ theme, color }) => ({
  fontSize: '1.8rem',
  fontWeight: 700,
  color: color ? theme.palette[color].main : theme.palette.primary.main,
  marginBottom: theme.spacing(0.5),
  marginTop: theme.spacing(1)
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
  marginBottom: theme.spacing(1)
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 350,
  width: '100%',
  paddingBottom: theme.spacing(2)
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(3),
  backgroundColor: alpha(theme.palette.primary.light, 0.05),
  borderRadius: '10px',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
}));

// Colors for the pie chart - more pleasant color scheme
const COLORS = [
  '#4361ee', '#4cc9f0', '#4895ef', '#560bad', '#f72585', 
  '#7209b7', '#3a0ca3', '#4cc9f0', '#48cae4', '#0096c7'
];

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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
      <Box sx={{ 
        backgroundColor: '#f8f9fa', 
        minHeight: '100vh', 
        py: 3,
        px: { xs: 2, md: 3 }
      }}>
        {/* Header Section */}
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: "space-between", 
            alignItems: { xs: "flex-start", sm: "center" }, 
            mb: 4 
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontWeight: 700, 
                color: theme.palette.primary.main,
                mb: 0.5
              }}
            >
              Owner Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {user ? `Welcome back, ${user.username}! Here's your sales overview.` : 'Welcome to the Owner Dashboard!'}
            </Typography>
          </Box>
          
          <Box sx={{ mt: { xs: 2, sm: 0 }, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
              Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Tooltip title="Refresh Data">
              <IconButton 
                color="primary" 
                onClick={fetchReport} 
                size="small"
                sx={{ ml: 1 }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Sales Overview Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            mb: 4,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3
          }}>
            <Analytics sx={{ mr: 1.5, color: theme.palette.primary.main }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600, 
                color: theme.palette.text.primary
              }}
            >
              Sales Overview
            </Typography>
          </Box>
          
          {/* Report Type Tabs */}
          <Tabs
            value={reportType}
            onChange={handleReportTypeChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            sx={{ 
              mb: 3,
              '& .MuiTabs-indicator': {
                height: '3px',
                borderRadius: '2px'
              }
            }}
          >
            <StyledTab value="daily" label="Daily" icon={<CalendarToday />} />
            <StyledTab value="weekly" label="Weekly" icon={<DateRange />} />
            <StyledTab value="monthly" label="Monthly" icon={<BarChart />} />
            <StyledTab value="custom" label="Custom Range" icon={<DateRange />} />
          </Tabs>
          
          {/* Filter Controls */}
          <FilterContainer>
            {reportType === "daily" && (
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    id="date"
                    label="Select Date"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <ActionButton 
                    variant="contained" 
                    color="primary" 
                    onClick={handleGenerateReport}
                    startIcon={<Refresh />}
                    fullWidth
                    disabled={loading}
                  >
                    Generate Report
                  </ActionButton>
                </Grid>
              </Grid>
            )}
            
            {reportType === "monthly" && (
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="month-select-label">Month</InputLabel>
                    <Select
                      labelId="month-select-label"
                      id="month-select"
                      value={selectedMonth}
                      label="Month"
                      onChange={handleMonthChange}
                      sx={{ borderRadius: '8px' }}
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
                  <FormControl fullWidth size="small">
                    <InputLabel id="year-select-label">Year</InputLabel>
                    <Select
                      labelId="year-select-label"
                      id="year-select"
                      value={selectedYear}
                      label="Year"
                      onChange={handleYearChange}
                      sx={{ borderRadius: '8px' }}
                    >
                      {getYearOptions().map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <ActionButton 
                    variant="contained" 
                    color="primary" 
                    onClick={handleGenerateReport}
                    startIcon={<Refresh />}
                    fullWidth
                    disabled={loading}
                  >
                    Generate Report
                  </ActionButton>
                </Grid>
              </Grid>
            )}
            
            {(reportType === "weekly" || reportType === "custom") && (
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4} md={3}>
                  <TextField
                    id="start-date"
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={handleStartDateChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
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
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <ActionButton 
                    variant="contained" 
                    color="primary" 
                    onClick={handleGenerateReport}
                    startIcon={<Refresh />}
                    fullWidth
                    disabled={loading}
                  >
                    Generate Report
                  </ActionButton>
                </Grid>
              </Grid>
            )}
          </FilterContainer>
          
          {/* Sales Data */}
          {loading ? (
            <Box sx={{ 
              display: "flex", 
              flexDirection: "column",
              justifyContent: "center", 
              alignItems: "center",
              p: 8 
            }}>
              <CircularProgress size={56} thickness={4} />
              <Typography variant="body1" sx={{ mt: 2, color: theme.palette.text.secondary }}>
                Loading report data...
              </Typography>
            </Box>
          ) : error ? (
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ 
                mb: 4, 
                borderRadius: '10px',
                '& .MuiAlert-icon': {
                  fontSize: '24px'
                }
              }}
            >
              {error}
            </Alert>
          ) : !reportData ? (
            <Box sx={{ 
              textAlign: "center", 
              py: 8,
              px: 2,
              backgroundColor: alpha(theme.palette.primary.light, 0.05),
              borderRadius: '10px',
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
            }}>
              <BarChart sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.3), mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Select report parameters and click Generate to view data
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                Choose a time period and generate the report to see sales data, revenue metrics, and product performance.
              </Typography>
              <ActionButton 
                variant="contained" 
                color="primary" 
                onClick={handleGenerateReport}
                startIcon={<Refresh />}
              >
                Generate Now
              </ActionButton>
            </Box>
          ) : (
            <>
              {/* Summary Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StyledCard color="success">
                    <CardContent sx={{ p: 3 }}>
                      <StatLabel>Total Revenue</StatLabel>
                      <StatValue color="success">
                        {formatCurrency(reportData.summary?.total_revenue || 0)}
                      </StatValue>
                      {reportType === 'monthly' && reportData.comparison && (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mt: 1, 
                          py: 0.5, 
                          px: 1.5,
                          backgroundColor: alpha(
                            reportData.comparison.revenueGrowth > 0 
                              ? theme.palette.success.main 
                              : theme.palette.error.main, 
                            0.1
                          ),
                          borderRadius: '16px',
                          width: 'fit-content'
                        }}>
                          {reportData.comparison.revenueGrowth > 0 ? (
                            <ArrowUpward fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                          ) : (
                            <ArrowDownward fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                          )}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 'medium',
                              color: reportData.comparison.revenueGrowth > 0 
                                ? theme.palette.success.dark 
                                : theme.palette.error.dark
                            }}
                          >
                            {Math.abs(reportData.comparison.revenueGrowth).toFixed(2)}% from previous
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </StyledCard>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <StyledCard color="primary">
                    <CardContent sx={{ p: 3 }}>
                      <StatLabel>Total Orders</StatLabel>
                      <StatValue color="primary">
                        {reportData.summary?.total_orders || 0}
                      </StatValue>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          color: theme.palette.text.secondary
                        }}
                      >
                        <ReceiptLong sx={{ fontSize: 16, mr: 0.5, opacity: 0.7 }} />
                        {reportType === 'daily' 
                          ? `For ${new Date(reportData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
                          : reportType === 'monthly'
                            ? `For ${months.find(m => m.value === parseInt(reportData.month))?.label} ${reportData.year}`
                            : `${new Date(reportData.startDate).toLocaleDateString()} - ${new Date(reportData.endDate).toLocaleDateString()}`
                        }
                      </Typography>
                    </CardContent>
                  </StyledCard>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <StyledCard color="warning">
                    <CardContent sx={{ p: 3 }}>
                      <StatLabel>Average Order Value</StatLabel>
                      <StatValue color="warning">
                        {reportData.summary?.total_orders > 0 
                          ? formatCurrency(reportData.summary.total_revenue / reportData.summary.total_orders) 
                          : formatCurrency(0)
                        }
                      </StatValue>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: theme.palette.text.secondary
                      }}>
                        <TrendingUp sx={{ fontSize: 16, mr: 0.5, opacity: 0.7 }} />
                        <Typography variant="body2">
                          Per order average
                        </Typography>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <StyledCard color="secondary">
                    <CardContent sx={{ p: 3 }}>
                      <StatLabel>
                        {reportType === 'daily' ? 'Juice Bars Active' : 'Peak Sales Day'}
                      </StatLabel>
                      <StatValue color="secondary">
                        {reportType === 'daily' 
                          ? reportData.salesByLocation?.length || 0
                          : prepareSalesByDayData().length > 0 
                            ? prepareSalesByDayData().reduce((max, item) => 
                                item.revenue > max.revenue ? item : max, 
                                { revenue: 0 }
                              ).name
                            : 'N/A'
                        }
                      </StatValue>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: theme.palette.text.secondary
                      }}>
                        {reportType === 'daily' 
                          ? <LocalCafe sx={{ fontSize: 16, mr: 0.5, opacity: 0.7 }} /> 
                          : <CalendarToday sx={{ fontSize: 16, mr: 0.5, opacity: 0.7 }} />
                        }
                        <Typography variant="body2">
                          {reportType === 'daily' 
                            ? 'Active locations' 
                            : 'Highest revenue day'
                          }
                        </Typography>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              </Grid>
              
              {/* Charts */}
              <Grid container spacing={3}>
                {/* Sales Trend Chart */}
                <Grid item xs={12} md={8}>
                  <StyledCard>
                    <StyledCardHeader 
                      title={
                        reportType === 'daily' 
                          ? "Sales by Hour" 
                          : reportType === 'monthly' 
                            ? "Daily Sales for the Month"
                            : "Sales Trend"
                      } 
                      subheader={
                        reportType === 'daily' 
                          ? `For ${new Date(reportData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                          : reportType === 'monthly'
                            ? `${months.find(m => m.value === parseInt(reportData.month))?.label} ${reportData.year}`
                            : `${new Date(reportData.startDate).toLocaleDateString()} - ${new Date(reportData.endDate).toLocaleDateString()}`
                      }
                      avatar={
                        <Box sx={{ 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          p: 1,
                          borderRadius: '8px'
                        }}>
                          <BarChart color="primary" />
                        </Box>
                      }
                    />
                    <Divider />
                    <CardContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
                      <ChartContainer>
                        <ResponsiveContainer width="100%" height="100%">
                          {reportType === 'daily' ? (
                            // Area chart for daily data
                            <AreaChart
                              data={prepareSalesByDayData()}
                              margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis 
                                dataKey="name" 
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis 
                                yAxisId="left" 
                                orientation="left"
                                axisLine={false}
                                tickLine={false} 
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `Rs ${value}`}
                              />
                              <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                              />
                              <RechartsTooltip 
                                formatter={(value, name) => {
                                  if (name === "revenue") return [formatCurrency(value), "Revenue"];
                                  return [value, "Orders"];
                                }}
                              />
                              <Area 
                                yAxisId="left" 
                                type="monotone" 
                                dataKey="revenue" 
                                name="revenue"
                                fill={alpha(theme.palette.primary.main, 0.2)}
                                stroke={theme.palette.primary.main}
                                activeDot={{ r: 8 }}
                              />
                              <Area 
                                yAxisId="right" 
                                type="monotone" 
                                dataKey="orders" 
                                name="orders"
                                fill={alpha(theme.palette.success.main, 0.2)}
                                stroke={theme.palette.success.main}
                              />
                              <Legend />
                            </AreaChart>
                          ) : (
                            // Bar chart for weekly/monthly data
                            <RechartsBarChart
                              data={prepareSalesByDayData()}
                              margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis 
                                dataKey="name" 
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis 
                                yAxisId="left" 
                                orientation="left" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                                tickFormatter={(value) => `Rs ${value}`}
                              />
                              <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                              />
                              <RechartsTooltip 
                                formatter={(value, name) => {
                                  if (name === "Revenue") return [formatCurrency(value), name];
                                  return [value, name];
                                }}
                              />
                              <Legend />
                              <Bar 
                                yAxisId="left" 
                                dataKey="revenue" 
                                name="Revenue" 
                                fill={theme.palette.primary.main} 
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar 
                                yAxisId="right" 
                                dataKey="orders" 
                                name="Orders" 
                                fill={theme.palette.success.main}
                                radius={[4, 4, 0, 0]}
                              />
                            </RechartsBarChart>
                          )}
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </StyledCard>
                </Grid>
                
                {/* Sales by Location Pie Chart */}
                <Grid item xs={12} md={4}>
                  <StyledCard>
                    <StyledCardHeader 
                      title="Sales by Location" 
                      subheader="Revenue distribution by juice bar" 
                      avatar={
                        <Box sx={{ 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          p: 1,
                          borderRadius: '8px'
                        }}>
                          <PieChartIcon color="primary" />
                        </Box>
                      }
                    />
                    <Divider />
                    <CardContent sx={{ pt: 3 }}>
                      <ChartContainer>
                        {!reportData.salesByLocation || reportData.salesByLocation.length === 0 ? (
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            height: '100%' 
                          }}>
                            <PieChartIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
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
                                label={({ name, percent }) => 
                                  isTablet ? '' : `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={isMobile ? 80 : 110}
                                fill="#8884d8"
                                dataKey="value"
                                animationBegin={200}
                                animationDuration={800}
                              >
                                {prepareSalesByLocationData().map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                    stroke={theme.palette.background.paper}
                                    strokeWidth={2}
                                  />
                                ))}
                              </Pie>
                              <RechartsTooltip 
                                formatter={(value, name, props) => [
                                  formatCurrency(value), 
                                  `${name} (${(props.percent * 100).toFixed(0)}%)`
                                ]}
                              />
                              <Legend 
                                layout={isMobile ? "horizontal" : "vertical"}
                                verticalAlign={isMobile ? "bottom" : "middle"}
                                align={isMobile ? "center" : "right"}
                                iconType="circle"
                                iconSize={10}
                                formatter={(value) => (
                                  <span style={{ color: theme.palette.text.primary, fontSize: '0.75rem' }}>
                                    {value}
                                  </span>
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </ChartContainer>
                    </CardContent>
                  </StyledCard>
                </Grid>
                
                {/* Best Selling Products */}
                <Grid item xs={12}>
                  <StyledCard>
                    <StyledCardHeader 
                      title="Best Selling Products" 
                      subheader="Top selling products for the selected period" 
                      avatar={
                        <Box sx={{ 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          p: 1,
                          borderRadius: '8px'
                        }}>
                          <LocalCafe color="primary" />
                        </Box>
                      }
                    />
                    <Divider />
                    <CardContent>
                      {!reportData.bestSellers || reportData.bestSellers.length === 0 ? (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          py: 5 
                        }}>
                          <LocalCafe sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.2), mb: 2 }} />
                          <Typography variant="body1" color="textSecondary">
                            No sales data available for this period
                          </Typography>
                        </Box>
                      ) : (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          {getBestSellingProducts().map((product, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={2.4} key={`${product.product_id}-${product.juice_bar_id}`}>
                              <Card 
                                sx={{ 
                                  height: '100%', 
                                  display: 'flex', 
                                  flexDirection: 'column',
                                  borderRadius: '12px',
                                  overflow: 'hidden',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                  transition: 'transform 0.2s, box-shadow 0.2s',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.12)'
                                  }
                                }}
                              >
                                <Box sx={{ 
                                  bgcolor: COLORS[index % COLORS.length], 
                                  color: 'white', 
                                  p: 1.5, 
                                  display: 'flex', 
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  gap: 1
                                }}>
                                  <Typography variant="h5" fontWeight="bold">#{index + 1}</Typography>
                                </Box>
                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                  <Typography 
                                    variant="h6" 
                                    gutterBottom 
                                    noWrap 
                                    title={product.product_name}
                                    sx={{ fontSize: '1rem', fontWeight: 600 }}
                                  >
                                    {product.product_name}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    color="textSecondary" 
                                    gutterBottom
                                    sx={{ 
                                      display: 'flex',
                                      alignItems: 'center',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    <LocalCafe sx={{ fontSize: 14, mr: 0.5 }} />
                                    {product.juice_bar_name}
                                  </Typography>
                                  <Box sx={{ 
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mt: 2
                                  }}>
                                    <Typography variant="body2">
                                      {formatCurrency(product.price)} × {product.total_quantity}
                                    </Typography>
                                    <Typography 
                                      variant="h6" 
                                      color="primary" 
                                      sx={{ fontWeight: 600 }}
                                    >
                                      {formatCurrency(product.total_sales)}
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </CardContent>
                  </StyledCard>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      </Box>
    </OwnerSidebar>
  );
};

export default Dashboard;