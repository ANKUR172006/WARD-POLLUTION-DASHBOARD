import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { WardData } from '../types';
import { mockWards } from '../data/mockData';
import { getAQIColor } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedWard, setSelectedWard] = useState<string>('all');

  const wardOptions = [{ id: 'all', name: 'All Wards' }, ...mockWards];

  // Generate mock historical data
  const generateHistoricalData = () => {
    const days = selectedPeriod === 'daily' ? 7 : selectedPeriod === 'weekly' ? 4 : 12;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        avgAQI: Math.floor(Math.random() * 150) + 150,
        maxAQI: Math.floor(Math.random() * 200) + 200,
        minAQI: Math.floor(Math.random() * 100) + 100,
      };
    });
  };

  const historicalData = generateHistoricalData();

  const wardComparisonData = mockWards.map(ward => ({
    name: ward.name.split(' - ')[0],
    aqi: ward.aqi,
    pm25: ward.pollutants.pm25,
    pm10: ward.pollutants.pm10,
  }));

  const totalAlerts = mockWards.reduce((sum, ward) => sum + ward.alerts.length, 0);
  const avgAQI = Math.round(mockWards.reduce((sum, ward) => sum + ward.aqi, 0) / mockWards.length);
  const worstWard = mockWards.reduce((worst, ward) => ward.aqi > worst.aqi ? ward : worst);

  /**
   * Export/Download Functionality
   * 
   * GOVERNANCE RELEVANCE:
   * Report export enables data sharing with stakeholders, policy documentation,
   * and evidence-based decision making. CSV format supports further analysis,
   * while PDF format provides presentable reports for municipal meetings.
   */
  
  // Helper function to escape CSV values
  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExportCSV = () => {
    try {
      // Filter wards based on selection
      const wardsToExport = selectedWard === 'all' 
        ? mockWards 
        : mockWards.filter(w => w.id === selectedWard);

      // Generate CSV content with proper escaping
      const headers = ['Ward', 'AQI', 'Category', 'PM2.5 (μg/m³)', 'PM10 (μg/m³)', 'NO2 (μg/m³)', 'SO2 (μg/m³)', 'CO (mg/m³)', 'Alerts'];
      const rows = wardsToExport.map(ward => [
        escapeCSVValue(ward.name),
        ward.aqi,
        ward.category,
        ward.pollutants.pm25,
        ward.pollutants.pm10,
        ward.pollutants.no2,
        ward.pollutants.so2,
        ward.pollutants.co,
        ward.alerts.join('; ') || 'None'
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Add UTF-8 BOM for Excel compatibility
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;
      
      // Create and download CSV file
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `ward_pollution_report_${timestamp}.csv`;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      // Show success message
      console.log('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting CSV. Please try again.');
    }
  };

  const handleExportPDF = () => {
    try {
      // Create a printable version of the report
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to generate PDF report.');
        return;
      }

      const selectedWardName = selectedWard === 'all' 
        ? 'All Wards' 
        : mockWards.find(w => w.id === selectedWard)?.name || 'Selected Ward';

      const wardsToExport = selectedWard === 'all' 
        ? mockWards 
        : mockWards.filter(w => w.id === selectedWard);

      // Pre-compute colors for wards
      const wardColors = wardsToExport.map(ward => getAQIColor(ward.category));

      // Generate HTML content for PDF
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ward Pollution Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      color: #1f2937;
    }
    .header {
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1e40af;
      margin: 0;
      font-size: 28px;
    }
    .header .meta {
      color: #6b7280;
      margin-top: 10px;
      font-size: 14px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .summary-card h3 {
      margin: 0 0 5px 0;
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
    }
    .summary-card p {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: bold;
      color: #374151;
    }
    tr:hover {
      background: #f9fafb;
    }
    .category-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Ward-Wise Pollution Action Report</h1>
    <div class="meta">
      Generated: ${new Date().toLocaleString('en-IN')}<br>
      Period: ${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}<br>
      Wards: ${selectedWardName}
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <h3>Average AQI</h3>
      <p>${avgAQI}</p>
    </div>
    <div class="summary-card">
      <h3>Total Alerts</h3>
      <p>${totalAlerts}</p>
    </div>
    <div class="summary-card">
      <h3>Worst Ward</h3>
      <p style="font-size: 16px;">${worstWard.name.split(' - ')[0]}</p>
      <p style="font-size: 14px; color: #ef4444;">AQI: ${worstWard.aqi}</p>
    </div>
    <div class="summary-card">
      <h3>Total Wards</h3>
      <p>${wardsToExport.length}</p>
    </div>
  </div>

  <h2 style="margin-top: 30px;">Detailed Ward Data</h2>
  <table>
    <thead>
      <tr>
        <th>Ward</th>
        <th>AQI</th>
        <th>Category</th>
        <th>PM2.5</th>
        <th>PM10</th>
        <th>NO₂</th>
        <th>SO₂</th>
        <th>CO</th>
        <th>Alerts</th>
      </tr>
    </thead>
    <tbody>
      ${wardsToExport.map((ward, index) => {
        const color = wardColors[index];
        return `
        <tr>
          <td>${ward.name}</td>
          <td><strong>${ward.aqi}</strong></td>
          <td><span class="category-badge" style="background: ${color}20; color: ${color};">${ward.category}</span></td>
          <td>${ward.pollutants.pm25} μg/m³</td>
          <td>${ward.pollutants.pm10} μg/m³</td>
          <td>${ward.pollutants.no2} μg/m³</td>
          <td>${ward.pollutants.so2} μg/m³</td>
          <td>${ward.pollutants.co} mg/m³</td>
          <td>${ward.alerts.length > 0 ? ward.alerts.join(', ') : 'None'}</td>
        </tr>
      `;
      }).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Ward-Wise Pollution Action Dashboard | Generated by Environmental Monitoring Authority</p>
    <p>This report is for informational purposes only. For official use in policy decision-making.</p>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error generating PDF. Please try again or use browser print function.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Pollution Reports & Analysis
            </h2>
            <p className="text-sm text-gray-600 mt-1">Comprehensive air quality reports and data exports</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Last 7 Days</option>
              <option value="weekly">Last 4 Weeks</option>
              <option value="monthly">Last 12 Months</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {wardOptions.map(ward => (
                <option key={ward.id} value={ward.id}>{ward.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Average AQI</p>
          <p className="text-2xl font-bold text-gray-900">{avgAQI}</p>
          <p className="text-xs text-gray-500 mt-1">Across all wards</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Total Alerts</p>
          <p className="text-2xl font-bold text-red-600">{totalAlerts}</p>
          <p className="text-xs text-gray-500 mt-1">Active warnings</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Worst Ward</p>
          <p className="text-lg font-bold text-gray-900">{worstWard.name.split(' - ')[0]}</p>
          <p className="text-xs text-gray-500 mt-1">AQI: {worstWard.aqi}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Trend</p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <p className="text-lg font-bold text-red-600">+12%</p>
          </div>
          <p className="text-xs text-gray-500 mt-1">vs last period</p>
        </div>
      </div>

      {/* Historical Trend Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Historical AQI Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avgAQI" stroke="#3b82f6" strokeWidth={2} name="Average AQI" />
            <Line type="monotone" dataKey="maxAQI" stroke="#ef4444" strokeWidth={2} name="Maximum AQI" />
            <Line type="monotone" dataKey="minAQI" stroke="#10b981" strokeWidth={2} name="Minimum AQI" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Ward Comparison */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ward-wise AQI Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={wardComparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="aqi" fill="#3b82f6" name="AQI" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pm25" fill="#ef4444" name="PM2.5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pm10" fill="#f59e0b" name="PM10" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Ward Report Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Detailed Ward Report</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Ward</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">AQI</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">PM2.5</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">PM10</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">NO₂</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {mockWards.map((ward) => (
                <tr key={ward.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{ward.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{
                        backgroundColor: getAQIColor(ward.category) + '20',
                        color: getAQIColor(ward.category),
                      }}
                    >
                      {ward.aqi}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{ward.category}</td>
                  <td className="py-3 px-4 text-gray-700">{ward.pollutants.pm25} μg/m³</td>
                  <td className="py-3 px-4 text-gray-700">{ward.pollutants.pm10} μg/m³</td>
                  <td className="py-3 px-4 text-gray-700">{ward.pollutants.no2} μg/m³</td>
                  <td className="py-3 px-4">
                    {ward.alerts.length > 0 ? (
                      <span className="text-red-600 font-medium">{ward.alerts.length}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
