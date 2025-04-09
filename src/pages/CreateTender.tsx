
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTender } from '@/context/TenderContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const CreateTender: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addTender } = useTender();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [value, setValue] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [requirements, setRequirements] = useState<string[]>([]);
  const [currentRequirement, setCurrentRequirement] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !category || !value || !deadline || requirements.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const newTender = {
      title,
      description,
      category,
      value: parseFloat(value),
      deadline: deadline.toISOString().split('T')[0],
      status: 'active' as const,
      createdBy: user?.id || '',
      requirements,
    };
    
    addTender(newTender);
    toast({
      title: "Tender created",
      description: "The tender has been successfully created",
    });
    navigate('/tenders');
  };
  
  const addRequirement = () => {
    if (currentRequirement.trim() && !requirements.includes(currentRequirement.trim())) {
      setRequirements([...requirements, currentRequirement.trim()]);
      setCurrentRequirement('');
    }
  };
  
  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate('/tenders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tenders
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Tender</CardTitle>
          <CardDescription>
            Fill in the details below to create a new tender opportunity
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tender Title*</Label>
              <Input 
                id="title" 
                placeholder="Enter a clear and descriptive title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Input 
                id="category" 
                placeholder="e.g. IT Services, Construction, Marketing" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Budget Value (USD)*</Label>
                <Input 
                  id="value" 
                  type="number" 
                  placeholder="Enter budget amount" 
                  min="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Submission Deadline*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description*</Label>
              <Textarea 
                id="description" 
                placeholder="Provide a comprehensive description of the tender requirements" 
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Requirements*</Label>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Add a requirement" 
                  value={currentRequirement}
                  onChange={(e) => setCurrentRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <Button type="button" onClick={addRequirement}>Add</Button>
              </div>
              
              {requirements.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                      {req}
                      <button 
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {requirements.length === 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Add at least one requirement for this tender
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="ml-auto">Create Tender</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateTender;
