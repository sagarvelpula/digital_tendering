
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@/lib/form-schemas';
import { useAuth } from '@/context/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

type ForgotPasswordFormValues = {
  email: string;
};

const ForgotPassword: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError(null);
    
    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
      toast({
        title: "Reset email sent",
        description: "Please check your email for the password reset link",
      });
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again later.");
      toast({
        title: "Failed to send reset email",
        description: err.message || "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="h-10 w-10 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mr-2">
              TMS
            </div>
            <h1 className="text-3xl font-bold text-gray-800">TenderFlow</h1>
          </div>
          <p className="text-gray-600">Streamlined Tender Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              {isSubmitted 
                ? "Please check your email for the reset link"
                : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>
          
          {isSubmitted ? (
            <CardContent className="space-y-4 text-center">
              <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                <p className="text-green-800">
                  A password reset link has been sent to your email address. 
                  Please check your inbox and follow the instructions to reset your password.
                </p>
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full mt-4"
              >
                Back to Login
              </Button>
            </CardContent>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Your email address"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center text-sm text-primary hover:underline"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Back to Login
                  </Link>
                </CardFooter>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
