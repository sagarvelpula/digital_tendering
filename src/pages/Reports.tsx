
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  PieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Download, ArrowDown, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchTenders, fetchBids } from '@/lib/supabase-helpers';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const generateCSV = (data: any[], headers: string[]) => {
  const headerRow = headers.join(',');
  const rows = data.map(item => 
    headers.map(header => JSON.stringify(item[header] || '')).join(',')
  );
  return [headerRow, ...rows].join('\n');
};

const downloadCSV = (data: string, filename: string) => {
  const blob = new Blob([data], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState('tenders');

  const { data: tenders = [] } = useQuery({
    queryKey: ['tenders'],
    queryFn: fetchTenders
  });

  const { data: bids = [] } = useQuery({
    queryKey: ['bids'],
    queryFn: fetchBids
  });

  // Process data for charts
  const processDateData = () => {
    const monthData: Record<string, number> = {};
    tenders.forEach(tender => {
      const date = new Date(tender.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthData[month] = (monthData[month] || 0) + 1;
    });

    return Object.keys(monthData).map(month => ({
      month,
      count: monthData[month]
    })).sort((a, b) => a.month.localeCompare(b.month));
  };

  const processCategoryData = () => {
    const categoryData: Record<string, number> = {};
    tenders.forEach(tender => {
      const category = tender.category || 'Uncategorized';
      categoryData[category] = (categoryData[category] || 0) + 1;
    });

    return Object.keys(categoryData).map(category => ({
      name: category,
      value: categoryData[category]
    }));
  };

  const processVendorData = () => {
    const vendorData: Record<string, number> = {};
    bids.forEach(bid => {
      const vendorName = bid.vendorName || 'Unknown';
      vendorData[vendorName] = (vendorData[vendorName] || 0) + 1;
    });

    return Object.entries(vendorData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const processBidValueData = () => {
    const bidData: Record<string, number> = {};
    bids.forEach(bid => {
      const month = new Date(bid.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
      bidData[month] = (bidData[month] || 0) + bid.amount;
    });

    return Object.keys(bidData).map(month => ({
      month,
      value: bidData[month]
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  };

  const handleExportCSV = () => {
    let data: any[] = [];
    let headers: string[] = [];
    let filename = '';

    if (activeTab === 'tenders') {
      data = tenders;
      headers = ['id', 'title', 'category', 'status', 'value', 'deadline', 'createdAt'];
      filename = 'tenders-report.csv';
    } else if (activeTab === 'vendors') {
      data = processVendorData();
      headers = ['name', 'value'];
      filename = 'vendors-report.csv';
    } else if (activeTab === 'bids') {
      data = bids;
      headers = ['id', 'vendorName', 'tenderId', 'amount', 'status', 'submittedAt'];
      filename = 'bids-report.csv';
    }

    const csv = generateCSV(data, headers);
    downloadCSV(csv, filename);
  };

  const tenderTimeData = processDateData();
  const categoryData = processCategoryData();
  const vendorData = processVendorData();
  const bidValueData = processBidValueData();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports Dashboard</h1>
        <Button onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export as CSV
        </Button>
      </div>

      <Tabs defaultValue="tenders" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-[400px]">
          <TabsTrigger value="tenders">Tenders</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="bids">Bids</TabsTrigger>
        </TabsList>

        <TabsContent value="tenders" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tenders Over Time</CardTitle>
                <CardDescription>Monthly tender creation trend</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {tenderTimeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tenderTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="Number of Tenders" 
                        stroke="#8884d8" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No tender data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tenders by Category</CardTitle>
                <CardDescription>Distribution across categories</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500">No category data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Active Vendors</CardTitle>
              <CardDescription>Vendors with the most bids</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {vendorData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Number of Bids" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">No vendor activity data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bids" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Bid Value Over Time</CardTitle>
              <CardDescription>Monthly bid value trend</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {bidValueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bidValueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Bid Value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-500">No bid value data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
