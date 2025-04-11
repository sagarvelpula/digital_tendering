
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, FileText } from 'lucide-react';
import { Tender } from '@/context/TenderContext';

interface RecommendedTendersProps {
  tenders: Tender[];
  isLoading?: boolean;
}

const RecommendedTenders: React.FC<RecommendedTendersProps> = ({ tenders, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[120px] bg-muted/40 animate-pulse rounded-md"></div>
        <div className="h-[120px] bg-muted/40 animate-pulse rounded-md"></div>
      </div>
    );
  }

  if (tenders.length === 0) {
    return (
      <div className="text-center py-6 bg-muted/20 rounded-md">
        <p className="text-muted-foreground">No recommendations available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tenders.map(tender => (
        <Card key={tender.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <Link to={`/tenders/${tender.id}`} className="text-lg font-medium hover:text-primary">
                    {tender.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{tender.category}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${tender.value.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-1 flex items-center justify-end">
                    <Clock className="h-3 w-3 mr-1" />
                    Due: {new Date(tender.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground mt-3 text-sm line-clamp-2">
                {tender.description}
              </p>
            </div>
            
            <div className="bg-muted py-2 px-4 flex justify-end space-x-2">
              <Link to={`/tenders/${tender.id}`}>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </Link>
              <Link to={`/tenders/${tender.id}/bid`}>
                <Button size="sm">Place Bid</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecommendedTenders;
