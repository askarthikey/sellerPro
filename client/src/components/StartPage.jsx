import React from 'react';
import { Link } from 'react-router-dom';

function StartPage() {
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
                  to="/dashboard" 
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Go to Dashboard
                </Link>
                <Link 
                  to="/products/new" 
                  className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-50 transition duration-300"
                >
                  Add New Product
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <img 
                src="/images/dashboard-preview.png" 
                alt="Dashboard Preview" 
                className="rounded-lg shadow-lg w-full"
              />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/products/new" className="block p-6 bg-gray-50 rounded-lg border border-gray-200 text-center hover:-translate-y-1 transition duration-300 hover:shadow-md">
              <div className="text-blue-600 text-3xl mb-4">
                <i className="fas fa-plus-circle"></i>
              </div>
              <h3 className="text-lg font-medium mb-2">Add Product</h3>
              <p className="text-gray-600 text-sm">Create a new product listing with images and details</p>
            </Link>
            
            <Link to="/products/bulk-upload" className="block p-6 bg-gray-50 rounded-lg border border-gray-200 text-center hover:-translate-y-1 transition duration-300 hover:shadow-md">
              <div className="text-blue-600 text-3xl mb-4">
                <i className="fas fa-upload"></i>
              </div>
              <h3 className="text-lg font-medium mb-2">Bulk Upload</h3>
              <p className="text-gray-600 text-sm">Import multiple products using CSV or Excel file</p>
            </Link>
            
            <Link to="/products/manage" className="block p-6 bg-gray-50 rounded-lg border border-gray-200 text-center hover:-translate-y-1 transition duration-300 hover:shadow-md">
              <div className="text-blue-600 text-3xl mb-4">
                <i className="fas fa-edit"></i>
              </div>
              <h3 className="text-lg font-medium mb-2">Edit Products</h3>
              <p className="text-gray-600 text-sm">Update pricing, inventory and product details</p>
            </Link>
            
            <Link to="/analytics" className="block p-6 bg-gray-50 rounded-lg border border-gray-200 text-center hover:-translate-y-1 transition duration-300 hover:shadow-md">
              <div className="text-blue-600 text-3xl mb-4">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-lg font-medium mb-2">View Analytics</h3>
              <p className="text-gray-600 text-sm">Monitor product performance and sales metrics</p>
            </Link>
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
                <i className="fas fa-tags"></i>
              </div>
              <h3 className="text-lg font-medium mb-2">Catalog Management</h3>
              <p className="text-gray-600">Organize products into categories, add variations, and maintain your entire inventory from a central hub.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow hover:-translate-y-1 transition duration-300">
              <div className="text-blue-600 text-2xl mb-4">
                <i className="fas fa-image"></i>
              </div>
              <h3 className="text-lg font-medium mb-2">Rich Media Support</h3>
              <p className="text-gray-600">Upload multiple high-quality images and videos to showcase your products from every angle.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow hover:-translate-y-1 transition duration-300">
              <div className="text-blue-600 text-2xl mb-4">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <h3 className="text-lg font-medium mb-2">Dynamic Pricing</h3>
              <p className="text-gray-600">Set flexible pricing strategies, special offers, and bulk discounts to maximize your revenue.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow hover:-translate-y-1 transition duration-300">
              <div className="text-blue-600 text-2xl mb-4">
                <i className="fas fa-box"></i>
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
          <h2 className="text-2xl font-bold text-center mb-8">Recent Activity</h2>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center py-4 border-b">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-4 flex-shrink-0">
                <i className="fas fa-pen"></i>
              </div>
              <div>
                <p><span className="font-medium">Product Updated:</span> Adjustable Office Chair</p>
                <p className="text-sm text-gray-500">Today, 2:30 PM</p>
              </div>
            </div>
            
            <div className="flex items-center py-4 border-b">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white mr-4 flex-shrink-0">
                <i className="fas fa-plus"></i>
              </div>
              <div>
                <p><span className="font-medium">Product Added:</span> Wireless Bluetooth Headphones</p>
                <p className="text-sm text-gray-500">Today, 11:15 AM</p>
              </div>
            </div>
            
            <div className="flex items-center py-4 border-b">
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white mr-4 flex-shrink-0">
                <i className="fas fa-exclamation"></i>
              </div>
              <div>
                <p><span className="font-medium">Low Stock Alert:</span> Wooden Desk Organizer</p>
                <p className="text-sm text-gray-500">Yesterday, 5:45 PM</p>
              </div>
            </div>
            
            <div className="flex items-center py-4">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white mr-4 flex-shrink-0">
                <i className="fas fa-trash"></i>
              </div>
              <div>
                <p><span className="font-medium">Product Removed:</span> Vintage Wall Clock</p>
                <p className="text-sm text-gray-500">Yesterday, 3:20 PM</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link to="/activity" className="inline-block px-6 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition duration-300">
              View All Activity
            </Link>
          </div>
        </div>
      </section>

      {/* Get Started */}
      <section className="bg-blue-600 text-white rounded-lg m-4 md:m-6 p-8 md:p-12 text-center">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to optimize your product listings?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto">Use our powerful tools to manage your entire catalog with ease.</p>
          <Link to="/dashboard" className="inline-block px-6 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 transition duration-300">
            Go to Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}

export default StartPage;