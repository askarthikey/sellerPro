import { createBrowserRouter, RouterProvider, Navigate, redirect } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
import RootLayout from './components/RootLayout';
import StartPage from './components/StartPage';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Home from './components/Home';
import AddProd from './components/AddProd';
import MyProducts from './components/MyProducts';
import ErrorPage from './components/ErrorPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated with improved handling
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Set up event listener for storage changes (helps with cross-tab auth)
    window.addEventListener('storage', checkAuth);
    
    // Listen for custom auth change events
    window.addEventListener('auth-change', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  // Protected route loader function with improved error handling
  const protectedLoader = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      // Store the intended path to redirect back after login
      return redirect('/signin');
    }
    return null;
  };

  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <ErrorPage />, // Using our new ErrorPage component here
      children: [
        {
          path: '/',
          element: isLoading ? (
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : isAuthenticated ? (
            <Navigate to="/home" />
          ) : (
            <Navigate to="/startpage" />
          ),
        },
        {
          path: 'startpage',
          element: isAuthenticated ? <Navigate to="/home" /> : <StartPage />,
        },
        {
          path: 'signup',
          element: isAuthenticated ? <Navigate to="/home" /> : <Signup setIsAuthenticated={setIsAuthenticated} />,
        },
        {
          path: 'signin',
          element: isAuthenticated ? <Navigate to="/home" /> : <Signin setIsAuthenticated={setIsAuthenticated} />,
        },
        {
          path: 'home',
          element: isAuthenticated ? <Home /> : <Navigate to="/signin" />,
          loader: protectedLoader,
        },
        {
          path: 'addprod',
          element: isAuthenticated ? <AddProd /> : <Navigate to="/signin" />,
          loader: protectedLoader,
        },
        {
          path: 'myprod',
          element: isAuthenticated ? <MyProducts /> : <Navigate to="/signin" />,
          loader: protectedLoader,
        },
        {
          // Catch-all route for undefined paths
          path: '*',
          element: <ErrorPage />, // Also use ErrorPage for catch-all routes
        }
      ]
    }
  ]);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    }>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;