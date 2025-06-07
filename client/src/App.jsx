import { createBrowserRouter, RouterProvider, Navigate, redirect } from 'react-router-dom';
import { useState, useEffect, Suspense } from 'react';
import RootLayout from './components/RootLayout';
import StartPage from './components/StartPage';
import Signup from './components/Signup';
import Signin from './components/Signin';
import Home from './components/Home';
import AddProd from './components/AddProd';
import MyProducts from './components/MyProducts';

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
          path: 'addprod',
          element: isAuthenticated ? <AddProd /> : <Navigate to="/signin" />,
          loader: protectedLoader
        },
        {
          path: 'myprod',
          element: isAuthenticated ? <MyProducts /> : <Navigate to="/signin" />,
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