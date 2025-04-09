
import React, { useState } from 'react';
import { useTender } from '@/context/TenderContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Filter, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const TendersList: React.FC = () => {
  const { tenders } = useTender();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get unique categories for filter
  const categories = ['all', ...Array.from(new Set(tenders.map(tender => tender.category)))];

  // Filter tenders based on search and filters
  const filteredTenders = tenders.filter(tender => {
    const matchesSearch = tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tender.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || tender.category === categoryFilter;
    
    const matchesStatus = statusFilter === 'all' || tender.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tenders</h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? "Manage and monitor all tenders in the system." 
              : "Browse and bid on available tender opportunities."
            }
          </p>
        </div>
        
        {isAdmin && (
          <Link to="/tenders/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Tender
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenders..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="w-40">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="awarded">Awarded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Tender List */}
      <div className="space-y-4">
        {filteredTenders.length > 0 ? (
          filteredTenders.map(tender => (
            <Card key={tender.id} className="overflow-hidden tender-card">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/tenders/${tender.id}`} className="text-lg font-medium hover:text-primary">
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
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tender.requirements.map((req, i) => (
                      <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-full">
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-muted py-3 px-4 flex justify-end space-x-2">
                  <Link to={`/tenders/${tender.id}`}>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </Link>
                  {!isAdmin && tender.status === 'active' && (
                    <Link to={`/tenders/${tender.id}/bid`}>
                      <Button size="sm">Place Bid</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No tenders found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TendersList;
