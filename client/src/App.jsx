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
          element: isAuthenticated ? <Home/>:<StartPage />,
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
          path: 'addprod',
          element: isAuthenticated ? <AddProd /> : <Navigate to="/signin" />,
          loader: protectedLoader
        },
        {
          path: 'myprod',
          element: isAuthenticated ? <MyProducts /> : <Navigate to="/signin" />,
          loader: protectedLoader
        },
        {
          // Catch all route for undefined paths
          path: '*',
          element: isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/startpage" />
        }
      ]
    }
  ]);

  return (
    <Suspense fallback={ <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;