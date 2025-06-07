import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useRouteError } from 'react-router-dom';

function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check authentication status on mount
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Handle going back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Determine error status and message
  const errorStatus = error?.status || 404;
  let errorMessage;
  
  switch (errorStatus) {
    case 401:
      errorMessage = "You're not authorized to access this page";
      break;
    case 403:
      errorMessage = "Access to this resource is forbidden";
      break;
    case 404:
      errorMessage = "The page you're looking for doesn't exist";
      break;
    case 500:
      errorMessage = "Server error occurred. Please try again later";
      break;
    default:
      errorMessage = "Something went wrong";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          {/* Error icon */}
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-gray-100 mb-6">
            <svg className="h-16 w-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d={errorStatus === 401 || errorStatus === 403
                  ? "M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" // Lock icon for auth errors
                  : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" // Alert icon for other errors
                }
              />
            </svg>
          </div>

          {/* Error status code */}
          <h1 className="text-5xl font-extrabold text-black mb-2">
            {errorStatus}
          </h1>

          {/* Error title */}
          <p className="text-2xl font-bold text-gray-900 mb-3">
            {errorStatus === 404 ? "Page Not Found" : 
             errorStatus === 401 ? "Unauthorized" : 
             errorStatus === 403 ? "Forbidden" : 
             errorStatus === 500 ? "Server Error" : "Unexpected Error"}
          </p>

          {/* Error message */}
          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={handleGoBack}
              className="inline-flex items-center justify-center px-5 py-2 border border-black text-sm font-medium rounded-md text-black bg-white hover:bg-gray-100"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go back
            </button>

            <Link 
              to={isAuthenticated ? "/home" : "/startpage"} 
              className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {isAuthenticated ? "Go to Dashboard" : "Go to Home Page"}
            </Link>
          </div>
        </div>
      </div>
      <p className="mt-6 text-sm text-gray-500">
        If you continue experiencing issues, please contact support.
      </p>
    </div>
  );
}

export default ErrorPage;