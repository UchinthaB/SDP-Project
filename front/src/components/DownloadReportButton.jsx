import React from 'react';
import { Button } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const DownloadReportButton = ({ reportType, selectedDate }) => {
  const handleDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Format date for API request
      const formattedDate = format(new Date(selectedDate), 'yyyy-MM-dd');
      
      const response = await fetch(
        `http://localhost:5000/api/reports/download/${reportType}?date=${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_report_${reportType}_${formattedDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<DownloadIcon />}
      onClick={handleDownload}
      sx={{ mt: 2 }}
    >
      Download Report
    </Button>
  );
};

export default DownloadReportButton;
