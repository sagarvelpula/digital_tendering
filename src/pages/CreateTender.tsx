
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTender } from '@/context/TenderContext';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tenderSchema } from '@/lib/form-schemas';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Calendar as CalendarIcon, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type TenderFormValues = {
  title: string;
  description: string;
  category: string;
  value: number;
  deadline: string;
  requirements: string[];
};

const CreateTender: React.FC = () => {
  const navigate = useNavigate();
  const { addTender } = useTender();
  const { user } = useAuth();
  
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  
  const form = useForm<TenderFormValues>({
    resolver: zodResolver(tenderSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      value: 0,
      deadline: '',
      requirements: [],
    }
  });
  
  const { isSubmitting } = form.formState;
  const requirements = form.watch('requirements');

  const onSubmit = async (data: TenderFormValues) => {
    if (!user) {
      setError("You must be logged in to create a tender");
      return;
    }
    
    setError(null);
    
    try {
      await addTender({
        ...data,
        status: 'active',
        createdBy: user.id,
      });
      navigate('/tenders');
    } catch (err: any) {
      setError(err.message || "Failed to create tender. Please try again later.");
    }
  };
  
  const addRequirement = () => {
    if (currentRequirement.trim() && !requirements.includes(currentRequirement.trim())) {
      const updatedRequirements = [...requirements, currentRequirement.trim()];
      form.setValue('requirements', updatedRequirements, { shouldValidate: true });
      setCurrentRequirement('');
    }
  };
  
  const removeRequirement = (index: number) => {
    const updatedRequirements = requirements.filter((_, i) => i !== index);
    form.setValue('requirements', updatedRequirements, { shouldValidate: true });
  };

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      form.setValue('deadline', newDate.toISOString().split('T')[0], { shouldValidate: true });
    }
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

        {error && (
          <div className="px-6 pt-2">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tender Title*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter a clear and descriptive title" 
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. IT Services, Construction, Marketing" 
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Value (INR)*</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter budget amount" 
                          min="0"
                          disabled={isSubmitting}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Submission Deadline*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                              disabled={isSubmitting}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Select a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDateChange}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a comprehensive description of the tender requirements" 
                        rows={6}
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="requirements"
                render={() => (
                  <FormItem>
                    <FormLabel>Requirements*</FormLabel>
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Add a requirement" 
                        value={currentRequirement}
                        onChange={(e) => setCurrentRequirement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                        disabled={isSubmitting}
                      />
                      <Button 
                        type="button" 
                        onClick={addRequirement}
                        disabled={isSubmitting}
                      >
                        Add
                      </Button>
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
                              disabled={isSubmitting}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="ml-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Tender'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CreateTender;
