
import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-5">
          <span className="text-4xl font-bold">404</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find the page you were looking for.
          The page "{location.pathname}" doesn't exist or may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-center">
          <Link to="/">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link to="/tenders">
            <Button variant="outline">Browse Tenders</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
