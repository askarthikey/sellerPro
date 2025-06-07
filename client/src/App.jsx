import { createBrowserRouter, RouterProvider, Navigate, redirect } from 'react-router-dom';
import { useState, useEffect, Suspense } from 'react';
import RootLayout from './components/RootLayout';
import StartPage from './components/StartPage';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Home from './components/Home';
import AddProd from './components/AddProd';
import Catalogue from './components/Catalogue';
import Cart from './components/Cart';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Protected route loader function
  const protectedLoader = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      return redirect('/');
    }
    return null;
  };

  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <div>Something went wrong</div>,
      children: [
        {
          path: '/',
          element: isAuthenticated ? <Navigate to="/home" /> : <Navigate to='/startpage'/>,
        },
        {
          path: 'startpage',
          element: <StartPage />
        },
        {
          path: 'signup',
          element: <Signup />
        },
        {
          path: 'signin',
          element: <Signin />
        },
        {
          path: 'home',
          element: isAuthenticated ? <Home /> : <Navigate to="/signin" />,
          loader: protectedLoader
        },
        {
          path: 'products/new',
          element: isAuthenticated ? <AddProd /> : <Navigate to="/signin" />,
          loader: protectedLoader
        },
        {
          path: 'products/bulk-upload',
          element: isAuthenticated ? <AddProd /> : <Navigate to="/signin" />,
          loader: protectedLoader
        },
        {
          path: 'products/manage',
          element: isAuthenticated ? <Catalogue /> : <Navigate to="/signin" />,
          loader: protectedLoader
        },
        {
          path: 'dashboard',
          element: isAuthenticated ? <Home /> : <Navigate to="/signin" />,
          loader: protectedLoader
        },
        {
          path: 'analytics',
          element: isAuthenticated ? <Home /> : <Navigate to="/signin" />,
          loader: protectedLoader
        },
        {
          path: 'activity',
          element: isAuthenticated ? <Home /> : <Navigate to="/signin" />,
          loader: protectedLoader
        },
        {
          path: 'cart',
          element: isAuthenticated ? <Cart /> : <Navigate to="/signin" />,
          loader: protectedLoader
        }
      ]
    }
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;