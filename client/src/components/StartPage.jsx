import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import img1 from '../assets/img1.jpg'; // Adjust the path as necessary

function StartPage() {
  const navigate = useNavigate();
  
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      navigate('/home');
    }
  }, [navigate]);
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-white rounded-lg shadow-md m-4 md:m-6 p-6 md:p-8">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">SellerPro Dashboard</h1>
              <p className="text-xl text-blue-600 font-medium mb-3">Manage Your Product Catalog with Ease</p>
              <p className="text-gray-600 text-lg mb-6">
                Welcome to your all-in-one platform for product management.
                Take full control of your catalog with our powerful tools.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/signin" 
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition duration-300"
                >
                  Create Account
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-1/2 flex justify-center">
              {/* Replace with your actual image or use a placeholder */}
              <div className="bg-gray-200 rounded-lg w-full h-64 flex items-center justify-center">
                <img 
                  src={img1} 
                  alt="Inventory Management" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    // Fallback to placeholder SVG if image fails to load
                    e.target.parentNode.innerHTML = `
                      <div class="bg-gray-100 rounded-lg w-full h-64 flex items-center justify-center">
                        <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
                        </svg>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Products</h3>
              <p className="text-2xl font-bold mb-1">247</p>
              <p className="text-green-500 text-sm">+12 this week</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Active Listings</h3>
              <p className="text-2xl font-bold mb-1">182</p>
              <p className="text-green-500 text-sm">+8 this week</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Out of Stock</h3>
              <p className="text-2xl font-bold mb-1">15</p>
              <p className="text-red-500 text-sm">+3 this week</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Sales</h3>
              <p className="text-2xl font-bold mb-1">$12,580</p>
              <p className="text-green-500 text-sm">+15% this month</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Actions */}
      <section className="bg-white rounded-lg shadow-md m-4 md:m-6 p-6 md:p-8">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="block p-6 bg-gray-50 rounded-lg border border-gray-200 text-center hover:-translate-y-1 transition duration-300 hover:shadow-md">
              <div className="text-blue-600 text-3xl mb-4">
                <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Add Products</h3>
              <p className="text-gray-600 text-sm">Create new product listings with images and details</p>
            </div>
            
            <div className="block p-6 bg-gray-50 rounded-lg border border-gray-200 text-center hover:-translate-y-1 transition duration-300 hover:shadow-md">
              <div className="text-blue-600 text-3xl mb-4">
                <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">My Products</h3>
              <p className="text-gray-600 text-sm">Update pricing, inventory and product details</p>
            </div>
            
            <div className="block p-6 bg-gray-50 rounded-lg border border-gray-200 text-center hover:-translate-y-1 transition duration-300 hover:shadow-md">
              <div className="text-blue-600 text-3xl mb-4">
                <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Dashboard</h3>
              <p className="text-gray-600 text-sm">Monitor product performance and overview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Powerful Management Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow hover:-translate-y-1 transition duration-300">
              <div className="text-blue-600 text-2xl mb-4">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Catalog Management</h3>
              <p className="text-gray-600">Organize products into categories, add variations, and maintain your entire inventory from a central hub.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow hover:-translate-y-1 transition duration-300">
              <div className="text-blue-600 text-2xl mb-4">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Rich Media Support</h3>
              <p className="text-gray-600">Upload multiple high-quality images and videos to showcase your products from every angle.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow hover:-translate-y-1 transition duration-300">
              <div className="text-blue-600 text-2xl mb-4">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Dynamic Pricing</h3>
              <p className="text-gray-600">Set flexible pricing strategies, special offers, and bulk discounts to maximize your revenue.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow hover:-translate-y-1 transition duration-300">
              <div className="text-blue-600 text-2xl mb-4">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Inventory Tracking</h3>
              <p className="text-gray-600">Real-time inventory management with low stock alerts and automatic status updates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-white rounded-lg shadow-md m-4 md:m-6 p-6 md:p-8">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Platform Activity</h2>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center py-4 border-b">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
              <div>
                <p><span className="font-medium">Product Updated:</span> Adjustable Office Chair</p>
                <p className="text-sm text-gray-500">Today, 2:30 PM</p>
              </div>
            </div>
            
            <div className="flex items-center py-4 border-b">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white mr-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p><span className="font-medium">Product Added:</span> Wireless Bluetooth Headphones</p>
                <p className="text-sm text-gray-500">Today, 11:15 AM</p>
              </div>
            </div>
            
            <div className="flex items-center py-4 border-b">
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white mr-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p><span className="font-medium">Low Stock Alert:</span> Wooden Desk Organizer</p>
                <p className="text-sm text-gray-500">Yesterday, 5:45 PM</p>
              </div>
            </div>
            
            <div className="flex items-center py-4">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white mr-4 flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p><span className="font-medium">Product Removed:</span> Vintage Wall Clock</p>
                <p className="text-sm text-gray-500">Yesterday, 3:20 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section className="bg-black text-white rounded-lg m-4 md:m-6 p-8 md:p-12 text-center">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to optimize your product listings?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">Use our powerful tools to manage your entire catalog with ease.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signin" className="inline-block px-6 py-3 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition duration-300">
              Sign In
            </Link>
            <Link to="/signup" className="inline-block px-6 py-3 border border-white text-white font-medium rounded-md hover:bg-blue-700 transition duration-300">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StartPage;