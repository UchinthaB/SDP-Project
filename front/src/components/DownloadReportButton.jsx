import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { CloudDownload } from '@mui/icons-material';

const DownloadReportButton = ({ reportType, selectedDate }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        alert("You need to be logged in to download reports");
        return;
      }
      
      // Create the URL for the PDF endpoint
      const baseUrl = "http://localhost:5000/api/reports";
      const url = `${baseUrl}/${reportType}/pdf?date=${selectedDate}`;
      
      // Make authenticated request
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      });
      
      if (!response.ok) {
        // Convert non-ok responses to readable format
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.message || errorJson.error || 'Failed to download report');
        } catch (e) {
          throw new Error(errorText || 'Failed to download report');
        }
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Set the filename based on the response headers or default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `sales_report_${reportType}_${selectedDate}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      alert(`Error downloading report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={handleDownload}
      startIcon={loading ? <CircularProgress size={18} /> : <CloudDownload />}
      disabled={loading}
      fullWidth
      sx={{ mt: 2 }}
    >
      {loading ? 'Downloading...' : 'Download PDF'}
    </Button>
  );
};

export default DownloadReportButton;