import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const BackendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [imageUploadMethod, setImageUploadMethod] = useState('link');
  const [imagePreview, setImagePreview] = useState(null);
  const [editFormData, setEditFormData] = useState({
    productName: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    imageUrl: '',
    productImage: null
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  const categories = [
    'Electronics', 
    'Clothing', 
    'Home & Kitchen', 
    'Books', 
    'Toys & Games',
    'Beauty & Personal Care',
    'Sports & Outdoors',
    'Automotive',
    'Health & Household',
    'Office Products',
    'Others'
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        const response = await fetch(`${BackendURL}/productsApi/myProducts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Error fetching products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate]);

  // Open delete confirmation modal
  const openDeleteModal = (product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentProduct(null);
  };

  // Toggle between URL and file upload methods
  const toggleImageUploadMethod = () => {
    setImageUploadMethod(prev => prev === 'file' ? 'link' : 'file');
  };
  
  // Open edit modal - updated to set image preview
  const openEditModal = (product) => {
    setCurrentProduct(product);
    setEditFormData({
      productName: product.productName,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      productImage: null
    });
    
    // Initialize the image preview with the current product image
    if (product.imageUrl) {
      setImagePreview(product.imageUrl);
    } else {
      setImagePreview(null);
    }
    
    // Default to link method if product has an image URL, otherwise file
    setImageUploadMethod(product.imageUrl ? 'link' : 'file');
    setIsEditModalOpen(true);
  };

  // Close edit modal - reset image states
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentProduct(null);
    setEditFormData({
      productName: '',
      price: '',
      category: '',
      stock: '',
      description: '',
      imageUrl: '',
      productImage: null
    });
    setImagePreview(null);
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update image preview for imageUrl changes
    if (name === 'imageUrl' && value) {
      setImagePreview(value);
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size - limit to 5MB
      const fileSizeInMB = file.size / (1024 * 1024);
      const MAX_FILE_SIZE_MB = 5;
      
      if (fileSizeInMB > MAX_FILE_SIZE_MB) {
        setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB. Please choose a smaller image.`);
        return;
      }
      
      setEditFormData(prev => ({
        ...prev,
        productImage: file,
        // Don't clear imageUrl here to keep as fallback
      }));

      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!currentProduct) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${BackendURL}/productsApi/product/${currentProduct._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProducts(products.filter(product => product._id !== currentProduct._id));
        closeDeleteModal();
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete product');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Supabase upload function
  const uploadImageToSupabase = async (file) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check your environment variables.');
    }
    
    try {
      // Use the exact bucket name that exists in your Supabase project
      const bucketName = 'products';
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileName = `${Date.now()}_${randomString}.${fileExt}`;
      const filePath = `${fileName}`; 
      
      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });
        
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (err) {
      console.error('Error uploading image to Supabase:', err);
      throw err;
    }
  };

  // Handle update product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!currentProduct) return;

    setUpdateLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Handle image upload if needed
      let imageUrl = editFormData.imageUrl;
      
      if (imageUploadMethod === 'file' && editFormData.productImage) {
        try {
          // Upload to Supabase and get the public URL
          imageUrl = await uploadImageToSupabase(editFormData.productImage);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          setError('Image upload failed: ' + uploadError.message);
          setUpdateLoading(false);
          return;
        }
      }
      
      // Create the updated product data
      const updatedProductData = {
        productName: editFormData.productName,
        price: editFormData.price,
        category: editFormData.category,
        stock: editFormData.stock,
        description: editFormData.description,
        imageUrl: imageUrl // Use the uploaded URL or the existing URL
      };
      
      const response = await fetch(`${BackendURL}/productsApi/product/${currentProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProductData)
      });

      const data = await response.json();

      if (response.ok) {
        // Update products list with updated product
        setProducts(products.map(product => 
          product._id === currentProduct._id 
            ? { ...product, ...updatedProductData, updatedAt: new Date() } 
            : product
        ));
        closeEditModal();
      } else {
        throw new Error(data.message || 'Failed to update product');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Enhanced filtered products with improved search and category filtering
  const filteredProducts = products.filter(product => {
    // Search term matching (search in all text fields)
    const searchInFields = [
      product.productName,
      product.description,
      product.category,
    ].map(field => field ? field.toLowerCase() : '');
    
    const matchesSearch = searchTerm === '' || searchInFields.some(field => 
      field.includes(searchTerm.toLowerCase())
    );
    
    // Category filtering
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    // Stock status filtering
    let matchesStockFilter = true;
    if (filter === 'in-stock') {
      matchesStockFilter = parseInt(product.stock) > 0;
    } else if (filter === 'out-of-stock') {
      matchesStockFilter = parseInt(product.stock) === 0;
    } else if (filter === 'low-stock') {
      matchesStockFilter = parseInt(product.stock) <= 5 && parseInt(product.stock) > 0;
    }
    
    return matchesSearch && matchesCategory && matchesStockFilter;
  });

  // Get available categories from products for filtering
  const availableCategories = [...new Set(products.map(product => product.category))];

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product catalog
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/addprod"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-6 text-sm text-white bg-red-600 rounded-md">
          {error}
        </div>
      )}

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by product name, description or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pl-10"
              />
              <svg className="h-5 w-5 text-gray-400 absolute left-3 top-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div>
            <label htmlFor="category-filter" className="block text-xs font-medium text-gray-500 mb-1">
              Category
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="stock-filter" className="block text-xs font-medium text-gray-500 mb-1">
              Stock Status
            </label>
            <select
              id="stock-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Products</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="low-stock">Low Stock</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Results count */}
        {!loading && (
          <div className="mt-4 text-sm text-gray-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            {(searchTerm || filter !== 'all' || categoryFilter !== 'all') && (
              <span> with current filters</span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-xl font-medium text-gray-900">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filter !== 'all' || categoryFilter !== 'all' ? 
              'No products match your filters. Try adjusting your search criteria.' : 
              'You haven\'t added any products yet.'}
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            {(searchTerm || filter !== 'all' || categoryFilter !== 'all') ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/addprod"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Product
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative w-full h-48 bg-gray-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                  {parseInt(product.stock) === 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-md">
                      Out of Stock
                    </span>
                  )}
                  {parseInt(product.stock) > 0 && parseInt(product.stock) <= 5 && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-md">
                      Low Stock
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 truncate">{product.productName}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-xl font-bold text-gray-900">${parseFloat(product.price).toFixed(2)}</div>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description || 'No description provided'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Stock: <span className={parseInt(product.stock) === 0 ? 'text-red-600 font-medium' : 'font-medium'}>{product.stock}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => openEditModal(product)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md transition-colors duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(product)}
                    className="px-3 py-2 bg-white hover:bg-red-50 text-red-600 text-sm font-medium rounded-md border border-red-200 hover:border-red-300 transition-colors duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center"
          onClick={() => closeDeleteModal()} // Close when clicking the backdrop
        >
          <div className="min-h-screen flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-lg mx-4 sm:mx-auto"
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Delete Product
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete <span className="font-medium">{currentProduct?.productName}</span>? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteProduct}
                >
                  Delete
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center"
          onClick={() => closeEditModal()} // Close when clicking the backdrop
        >
          <div className="min-h-screen flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg overflow-hidden shadow-xl w-full max-w-lg mx-4 sm:mx-auto"
              onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
            >
              <form onSubmit={handleUpdateProduct}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 overflow-y-auto" style={{ maxHeight: '80vh' }}>
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Edit Product
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Update the information for {currentProduct?.productName}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                        Product Name*
                      </label>
                      <input
                        id="productName"
                        name="productName"
                        type="text"
                        required
                        value={editFormData.productName}
                        onChange={handleEditFormChange}
                        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Price ($)*
                        </label>
                        <input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={editFormData.price}
                          onChange={handleEditFormChange}
                          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                          Stock*
                        </label>
                        <input
                          id="stock"
                          name="stock"
                          type="number"
                          min="0"
                          required
                          value={editFormData.stock}
                          onChange={handleEditFormChange}
                          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category*
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        value={editFormData.category}
                        onChange={handleEditFormChange}
                        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        value={editFormData.description}
                        onChange={handleEditFormChange}
                        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      ></textarea>
                    </div>
                    
                    {/* Image Upload Options */}
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Product Image
                      </label>
                      <div className="flex items-center">
                        <span className="mr-2 text-sm text-gray-500">
                          {imageUploadMethod === 'file' ? 'Upload file' : 'Provide URL'}
                        </span>
                        <button
                          type="button"
                          onClick={toggleImageUploadMethod}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Switch to {imageUploadMethod === 'file' ? 'URL' : 'file upload'}
                        </button>
                      </div>
                    </div>
                    
                    {/* File Upload Option */}
                    {imageUploadMethod === 'file' && (
                      <div>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            {imagePreview ? (
                              <div className="mb-3">
                                <img 
                                  src={imagePreview} 
                                  alt="Product preview" 
                                  className="mx-auto h-32 object-contain"
                                />
                              </div>
                            ) : (
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                            <div className="flex text-sm text-gray-600 justify-center">
                              <label
                                htmlFor="edit-file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="edit-file-upload"
                                  name="productImage"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleImageChange}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, JPEG up to 5MB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* URL Option */}
                    {imageUploadMethod === 'link' && (
                      <div>
                        <div className="mt-1">
                          <input
                            type="url"
                            name="imageUrl"
                            id="imageUrl"
                            value={editFormData.imageUrl}
                            onChange={handleEditFormChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        
                        {imagePreview && imageUploadMethod === 'link' && (
                          <div className="mt-4 flex justify-center">
                            <img 
                              src={imagePreview} 
                              alt="Product preview" 
                              className="h-40 object-contain border rounded-md"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {updateLoading ? 'Updating...' : 'Update Product'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProducts;