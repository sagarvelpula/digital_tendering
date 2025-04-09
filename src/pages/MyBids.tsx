
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTender } from '@/context/TenderContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const MyBids: React.FC = () => {
  const { user } = useAuth();
  const { bids, tenders } = useTender();
  
  const vendorBids = bids.filter(bid => bid.vendorId === user?.id);
  
  // Group bids by status
  const pendingBids = vendorBids.filter(bid => bid.status === 'pending');
  const acceptedBids = vendorBids.filter(bid => bid.status === 'accepted');
  const rejectedBids = vendorBids.filter(bid => bid.status === 'rejected');
  
  const renderBidCard = (bid: any) => {
    const tender = tenders.find(t => t.id === bid.tenderId);
    if (!tender) return null;
    
    return (
      <Card key={bid.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
            <div>
              <Link 
                to={`/tenders/${tender.id}`} 
                className="font-medium hover:text-primary"
              >
                {tender.title}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{tender.category}</Badge>
                <Badge 
                  variant={
                    tender.status === 'active' ? 'default' : 
                    tender.status === 'closed' ? 'secondary' : 
                    'outline'
                  }
                >
                  {tender.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">Bid Amount: ${bid.amount.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                Submitted: {new Date(bid.submittedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          <div className="text-sm text-muted-foreground mb-3">
            <span className="font-medium text-foreground">Your Proposal:</span> {bid.proposal}
          </div>
          
          <div className="flex justify-end mt-2">
            <Link to={`/tenders/${tender.id}`}>
              <Button size="sm" variant="outline">
                View Tender
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bids</h1>
        <p className="text-muted-foreground">
          Track and manage all your bids in one place
        </p>
      </div>
      
      {vendorBids.length === 0 ? (
        <Card>
          <CardContent className="py-10 px-6 text-center">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-1">No bids yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't placed any bids on tenders
            </p>
            <Link to="/tenders">
              <Button>Browse Tenders</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending Bids */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Bids</CardTitle>
              <CardDescription>
                Bids awaiting decision from administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingBids.length > 0 ? (
                <div className="space-y-4">
                  {pendingBids.map(bid => renderBidCard(bid))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No pending bids at this time
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Accepted Bids */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accepted Bids</CardTitle>
              <CardDescription>
                Bids that have been accepted by administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {acceptedBids.length > 0 ? (
                <div className="space-y-4">
                  {acceptedBids.map(bid => renderBidCard(bid))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No accepted bids at this time
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Rejected Bids */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rejected Bids</CardTitle>
              <CardDescription>
                Bids that were not selected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rejectedBids.length > 0 ? (
                <div className="space-y-4">
                  {rejectedBids.map(bid => renderBidCard(bid))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No rejected bids at this time
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MyBids;
