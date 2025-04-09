
import React from 'react';
import { useTender } from '@/context/TenderContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart4, FileText, TrendingUp, Wallet, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { tenders, bids } = useTender();

  // Calculate statistics
  const activeTenders = tenders.filter(tender => tender.status === 'active').length;
  const totalBids = bids.length;
  const totalValue = tenders.reduce((sum, tender) => sum + tender.value, 0);
  const averageBidsPerTender = totalBids / (tenders.length || 1);

  // Find tenders with most bids
  const tenderBidCounts = tenders.map(tender => ({
    tender,
    bidCount: bids.filter(bid => bid.tenderId === tender.id).length
  }));

  const mostActiveTenders = [...tenderBidCounts]
    .sort((a, b) => b.bidCount - a.bidCount)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Tenders</p>
                <h3 className="text-2xl font-bold mt-1">{activeTenders}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bids</p>
                <h3 className="text-2xl font-bold mt-1">{totalBids}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <h3 className="text-2xl font-bold mt-1">${totalValue.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Bids Per Tender</p>
                <h3 className="text-2xl font-bold mt-1">{averageBidsPerTender.toFixed(1)}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <BarChart4 className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Tenders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Active Tenders</CardTitle>
            <CardDescription>Tenders with the highest number of bids</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mostActiveTenders.map(({ tender, bidCount }) => (
                <div key={tender.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <Link to={`/tenders/${tender.id}`} className="font-medium hover:text-primary">
                      {tender.title}
                    </Link>
                    <div className="text-sm text-muted-foreground">
                      {tender.category}
                    </div>
                  </div>
                  <Badge>{bidCount} bids</Badge>
                </div>
              ))}

              {mostActiveTenders.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No active tenders with bids yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest bids and tender updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bids.slice(0, 4).map(bid => {
                const tender = tenders.find(t => t.id === bid.tenderId);
                return (
                  <div key={bid.id} className="flex items-start space-x-3 border-b pb-2 last:border-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{bid.vendorName}</span> placed a bid on{" "}
                        <Link to={`/tenders/${bid.tenderId}`} className="font-medium hover:text-primary">
                          {tender?.title || "Unknown Tender"}
                        </Link>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${bid.amount.toLocaleString()} • {new Date(bid.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}

              {bids.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activity to display
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/tenders/new">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Create New Tender
              </Button>
            </Link>
            <Link to="/vendors">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Vendors
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" className="w-full justify-start">
                <BarChart4 className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
