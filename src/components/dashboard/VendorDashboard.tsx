
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTender } from '@/context/TenderContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { tenders, bids, getRecommendedTenders } = useTender();
  
  // Get vendor-specific data
  const vendorBids = bids.filter(bid => bid.vendorId === user?.id);
  const activeBids = vendorBids.filter(bid => {
    const tender = tenders.find(t => t.id === bid.tenderId);
    return tender && tender.status === 'active';
  });
  
  // Get recommended tenders for this vendor
  const recommendedTenders = user?.id 
    ? getRecommendedTenders(user.id, user.role as string)
    : [];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Bids</p>
                <h3 className="text-2xl font-bold mt-1">{activeBids.length}</h3>
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
                <h3 className="text-2xl font-bold mt-1">{vendorBids.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Tenders</p>
                <h3 className="text-2xl font-bold mt-1">{tenders.filter(t => t.status === 'active').length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Search className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Tenders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommended for You</CardTitle>
          <CardDescription>Tenders that match your profile and bidding history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendedTenders.length > 0 ? (
              recommendedTenders.map(tender => (
                <div key={tender.id} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden tender-card">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Link to={`/tenders/${tender.id}`} className="text-lg font-medium hover:text-primary">
                        {tender.title}
                      </Link>
                      <Badge variant="outline" className="ml-2">{tender.category}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{tender.description}</p>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>Due: {new Date(tender.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="font-medium">${tender.value.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="bg-muted py-3 px-4 flex justify-end">
                    <Link to={`/tenders/${tender.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-1">No recommendations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start bidding on tenders to get personalized recommendations
                </p>
                <Link to="/tenders">
                  <Button>Browse All Tenders</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bids */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Recent Bids</CardTitle>
          <CardDescription>Track the status of your recent bids</CardDescription>
        </CardHeader>
        <CardContent>
          {vendorBids.length > 0 ? (
            <div className="divide-y">
              {vendorBids.slice(0, 5).map(bid => {
                const tender = tenders.find(t => t.id === bid.tenderId);
                return (
                  <div key={bid.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link to={`/tenders/${bid.tenderId}`} className="font-medium hover:text-primary">
                        {tender?.title || "Unknown Tender"}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        Bid Amount: ${bid.amount.toLocaleString()} • {new Date(bid.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        bid.status === 'accepted' ? 'default' : 
                        bid.status === 'rejected' ? 'destructive' : 'outline'
                      }
                    >
                      {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">No bids yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any bids on tenders
              </p>
              <Link to="/tenders">
                <Button>Find Tenders</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/tenders">
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Browse Tenders
              </Button>
            </Link>
            <Link to="/my-bids">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                View My Bids
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;
