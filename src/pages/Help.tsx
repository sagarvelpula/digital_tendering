
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useMutation } from '@tanstack/react-query';
import { supportFormSchema } from '@/lib/form-schemas';
import { submitSupportMessage } from '@/lib/supabase/users';
import { useAuth } from '@/context/AuthContext';
import * as z from 'zod';
import { AlertCircle, HelpCircle, CheckCircle } from 'lucide-react';

const HelpPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isSubmitted, setIsSubmitted] = useState(false);

  const supportForm = useForm<z.infer<typeof supportFormSchema>>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const submitSupportMutation = useMutation({
    mutationFn: (data: z.infer<typeof supportFormSchema>) => 
      submitSupportMessage(user?.id || '', data.message, data.subject),
    onSuccess: () => {
      toast({
        title: 'Message sent',
        description: 'Your support request has been submitted.',
      });
      supportForm.reset();
      setIsSubmitted(true);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send support message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: z.infer<typeof supportFormSchema>) => {
    submitSupportMutation.mutate(data);
  };

  // FAQ items customized by role
  const adminFaqs = [
    {
      question: "How do I create a new tender?",
      answer: "To create a new tender, navigate to the Tenders page and click on the 'Create New Tender' button. Fill in the required information about the tender including title, description, category, value, and deadline."
    },
    {
      question: "How can I manage vendor accounts?",
      answer: "You can manage vendor accounts from the Vendors page. From there, you can view all registered vendors, ban vendors who violate terms, and review their bid history."
    },
    {
      question: "How do I review bids for a tender?",
      answer: "Navigate to the specific tender detail page and scroll down to the 'Bids' section. Here you can see all bids submitted for this tender, including bid amounts and proposals."
    },
    {
      question: "Can I export data for reporting?",
      answer: "Yes, you can export data from the Reports page. Navigate there and use the 'Export as CSV' button to download tender, vendor, or bid data."
    },
    {
      question: "How do notifications work?",
      answer: "The system automatically sends notifications when vendors submit bids or when a tender status changes. You can view these by clicking the bell icon in the top navigation bar."
    }
  ];

  const vendorFaqs = [
    {
      question: "How do I submit a bid for a tender?",
      answer: "Browse the available tenders on the Tenders page, click on a tender to view its details, then click the 'Place Bid' button. Fill out the bid form with your proposed amount and proposal details."
    },
    {
      question: "How can I see the status of my bids?",
      answer: "Navigate to the 'My Bids' page to see all your submitted bids and their current status (pending, accepted, rejected)."
    },
    {
      question: "How am I notified if my bid is accepted?",
      answer: "You'll receive a notification through the platform (viewable by clicking the bell icon) and potentially an email depending on your notification settings."
    },
    {
      question: "Can I edit my bid after submitting?",
      answer: "No, once a bid is submitted it cannot be edited. You would need to delete the bid and submit a new one, if the tender deadline hasn't passed."
    },
    {
      question: "How can I update my company information?",
      answer: "Go to the Settings page and select the Profile tab. There you can update your name, email, and company information."
    }
  ];

  const faqs = isAdmin ? adminFaqs : vendorFaqs;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Help Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about using the {isAdmin ? "admin" : "vendor"} features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
              <CardDescription>
                Helpful links and documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <HelpCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-medium">User Guide</h3>
                  <p className="text-sm text-gray-600">
                    Comprehensive guide on using all platform features
                  </p>
                  <a href="#" className="text-sm text-blue-500 hover:underline">
                    Download PDF
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <h3 className="font-medium">System Requirements</h3>
                  <p className="text-sm text-gray-600">
                    Technical requirements for optimal platform experience
                  </p>
                  <a href="#" className="text-sm text-blue-500 hover:underline">
                    View Details
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="font-medium">Best Practices</h3>
                  <p className="text-sm text-gray-600">
                    Tips for {isAdmin ? "managing tenders effectively" : "submitting successful bids"}
                  </p>
                  <a href="#" className="text-sm text-blue-500 hover:underline">
                    Learn More
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Need help with something specific? Send us a message.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                  <h3 className="font-medium text-lg">Message Sent!</h3>
                  <p className="text-gray-600">
                    Thank you for contacting support. We'll get back to you as soon as possible.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <Form {...supportForm}>
                  <form onSubmit={supportForm.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={supportForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. Issue with bid submission" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={supportForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please describe your issue in detail..." 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={submitSupportMutation.isPending}
                    >
                      {submitSupportMutation.isPending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
