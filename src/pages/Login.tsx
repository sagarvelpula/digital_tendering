
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'vendor'>('vendor');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error is handled in the AuthContext with toast
      setError('Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo logins - these need to be actual users in your Supabase Auth
  const loginAsDemoUser = async (demoEmail: string, demoPassword: string) => {
    setIsLoading(true);
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    try {
      await login(demoEmail, demoPassword);
      navigate('/');
    } catch (err) {
      setError('Demo login failed. You need to create these users in Supabase first.');
    } finally {
      setIsLoading(false);
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
            <CardTitle>Log In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </Button>
              <div className="text-sm text-center">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Register
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-8 space-y-4">
          <div className="text-center text-sm text-gray-600">
            Demo Accounts (Click to auto-fill)
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => loginAsDemoUser('admin@tenderflow.com', 'password123')}
              className="flex-1 text-xs hover:bg-primary hover:text-primary-foreground"
              disabled={isLoading}
            >
              Demo Admin
            </Button>
            <Button 
              variant="outline" 
              onClick={() => loginAsDemoUser('vendor@company.com', 'password123')}
              className="flex-1 text-xs hover:bg-primary hover:text-primary-foreground"
              disabled={isLoading}
            >
              Demo Vendor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
