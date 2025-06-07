import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BackendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    categories: {}
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          // Redirect to signin page if not authenticated
          navigate('/signin');
          return;
        }

        // Fetch products data
        const response = await fetch(`${BackendURL}/productsApi/myProducts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            navigate('/signin');
            return;
          }
          throw new Error('Failed to fetch dashboard data');
        }

        const products = await response.json();
        
        // Process the products to extract dashboard metrics
        const activeProducts = products.filter(p => parseInt(p.stock) > 0);
        const outOfStock = products.filter(p => parseInt(p.stock) === 0);
        const lowStock = products.filter(p => parseInt(p.stock) > 0 && parseInt(p.stock) <= 5);
        
        // Get category distribution
        const categories = {};
        products.forEach(product => {
          if (categories[product.category]) {
            categories[product.category]++;
          } else {
            categories[product.category] = 1;
          }
        });

        // Update dashboard data
        setDashboardData({
          totalProducts: products.length,
          activeProducts: activeProducts.length,
          outOfStock: outOfStock.length,
          lowStock: lowStock.length,
          categories
        });

        // Set recent products (5 most recent)
        const sortedProducts = [...products].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentProducts(sortedProducts.slice(0, 5));

        // Generate activity data based on products
        const activities = [];
        if (sortedProducts.length > 0) {
          activities.push({
            type: 'add',
            item: sortedProducts[0],
            timestamp: new Date(sortedProducts[0].createdAt)
          });
        }
        
        // Add some recent edits and views
        sortedProducts.slice(0, 4).forEach((product, index) => {
          const date = new Date();
          date.setHours(date.getHours() - index * 2);
          
          if (index % 2 === 0) {
            activities.push({
              type: 'edit',
              item: product,
              timestamp: date
            });
          } else {
            activities.push({
              type: 'view',
              item: product,
              timestamp: date
            });
          }
        });

        setRecentActivity(activities);
      } catch (err) {
        setError(err.message || 'Error loading dashboard');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/signin');
    }
  }, [navigate]);

  // Helper to format dates
  const formatDate = (dateString) => {
    const options = { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate estimated inventory value
  const calculateInventoryValue = () => {
    let total = 0;
    recentProducts.forEach(product => {
      total += parseFloat(product.price) * parseInt(product.stock);
    });
    return formatCurrency(total);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-white bg-blue-600 rounded-md">
          {error}
        </div>
      )}

      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back! Here's an overview of your product catalog.</p>
        </div>
        <div>
          <Link
            to="/addprod"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold">{dashboardData.totalProducts}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/myprod" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all products &rarr;
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Listings</p>
              <p className="text-2xl font-bold">{dashboardData.activeProducts}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/myprod" className="text-sm text-green-600 hover:text-green-800 font-medium">
              Manage listings &rarr;
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold">{dashboardData.outOfStock}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/myprod" className="text-sm text-red-600 hover:text-red-800 font-medium">
              Replenish inventory &rarr;
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold">{dashboardData.lowStock}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/myprod" className="text-sm text-yellow-600 hover:text-yellow-800 font-medium">
              View low stock items &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h2>
          <div className="h-64 flex items-center">
            {Object.keys(dashboardData.categories).length > 0 ? (
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(dashboardData.categories).map(([category, count]) => (
                  <div key={category} className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                      <div 
                        className="bg-blue-600 h-4 rounded-full" 
                        style={{ width: `${(count / dashboardData.totalProducts) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">{category} ({count})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center w-full">No category data available</p>
            )}
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-600">Estimated Inventory Value</p>
                <p className="text-xl font-bold">{calculateInventoryValue()}</p>
              </div>
              <Link 
                to="/myprod" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all products &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                    activity.type === 'add' ? 'bg-green-100 text-green-600' :
                    activity.type === 'edit' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.type === 'add' && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {activity.type === 'edit' && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    )}
                    {activity.type === 'view' && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">
                        {activity.type === 'add' ? 'Added' : 
                         activity.type === 'edit' ? 'Updated' : 
                         'Viewed'} 
                      </span>{' '}
                      product: {activity.item.productName}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-center">No recent activity</p>
            )}
          </div>
          <div className="mt-4 pt-2 border-t">
            <Link 
              to="/myprod" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all products &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium text-gray-900">Recently Added Products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentProducts.length > 0 ? (
                recentProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                          {product.imageUrl ? (
                            <img 
                              className="h-10 w-10 object-cover" 
                              src={product.imageUrl} 
                              alt={product.productName}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40x40?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center text-gray-400">
                              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.productName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${parseFloat(product.price).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        parseInt(product.stock) === 0 
                          ? 'bg-red-100 text-red-800' 
                          : parseInt(product.stock) <= 5 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {parseInt(product.stock)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to="/myprod" className="text-blue-600 hover:text-blue-900">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No products found. <Link to="/addprod" className="text-blue-600 hover:underline">Add your first product</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <Link 
            to="/myprod" 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            View all products
            <svg className="h-5 w-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/addprod" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Add Product</h3>
            <p className="mt-1 text-sm text-gray-500 text-center">Add a new product to your inventory</p>
          </div>
        </Link>

        <Link to="/myprod" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Manage Products</h3>
            <p className="mt-1 text-sm text-gray-500 text-center">View and update your existing products</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Home;