import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// More robust environment variable handling
const BackendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Add error checking for Supabase initialization
let supabase = null;
try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
}

function AddProd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploadMethod, setImageUploadMethod] = useState('file'); // 'file' or 'link'
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    productImage: null,
    imageUrl: ''
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If changing imageUrl, update the preview
    if (name === 'imageUrl' && value) {
      setImagePreview(value);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        productImage: file,
        imageUrl: '' // Clear the URL if a file is selected
      }));

      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleImageUploadMethod = () => {
    // Clear existing image data when toggling
    setFormData(prev => ({
      ...prev,
      productImage: null,
      imageUrl: ''
    }));
    setImagePreview(null);
    
    // Toggle the method
    setImageUploadMethod(prev => prev === 'file' ? 'link' : 'file');
  };

  const validateForm = () => {
    if (!formData.productName) {
      setError('Product name is required');
      return false;
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      setError('Please enter a valid stock quantity');
      return false;
    }
    
    // Check if at least one image method is provided
    if (imageUploadMethod === 'file' && !formData.productImage && imageUploadMethod === 'link' && !formData.imageUrl) {
      setError('Please provide an image either by uploading a file or entering a URL');
      return false;
    }
    
    return true;
  };

  // Function to upload image to Supabase Storage
  const uploadImageToSupabase = async (file) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check your environment variables.');
    }
    
    try {
      // Use the exact bucket name that exists in your Supabase project
      const bucketName = 'products';
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; 
      
      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        navigate('/signin');
        return;
      }

      // Handle the image (upload to Supabase or use provided URL)
      let imageUrl = formData.imageUrl;
      
      if (imageUploadMethod === 'file' && formData.productImage) {
        try {
          // Upload to Supabase and get the public URL
          imageUrl = await uploadImageToSupabase(formData.productImage);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Show error message to the user
          setError('Image upload failed: ' + uploadError.message);
          setLoading(false);
          // Return early instead of continuing with a placeholder
          return;
        }
      }
      
      // Create request data
      const productData = {
        productName: formData.productName,
        price: formData.price,
        category: formData.category,
        stock: formData.stock,
        description: formData.description,
        imageUrl: imageUrl
      };

      // Send to backend endpoint
      const response = await fetch(`${BackendURL}/productsApi/addProduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Product added successfully!');
        
        // Reset form data
        setFormData({
          productName: '',
          price: '',
          category: '',
          stock: '',
          description: '',
          productImage: null,
          imageUrl: ''
        });
        setImagePreview(null);
        
        // Show success message briefly before redirecting
        setTimeout(() => {
          // Redirect to My Products page after successful submission
          navigate('/myprod');
        }, 1000); // Short delay to show the success message
      } else {
        setError(data.message || 'Failed to add product');
      }
    } catch (err) {
      setError('Error: ' + (err.message || 'Failed to add product'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-6">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="mt-2 text-sm text-gray-600">
            Add a new product to your catalog
          </p>
        </div>
        
        {error && (
          <div className="p-3 text-sm text-white bg-black rounded-md">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="p-3 text-sm text-white bg-green-600 rounded-md">
            {successMessage}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                Product Name*
              </label>
              <input
                id="productName"
                name="productName"
                type="text"
                required
                value={formData.productName}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                placeholder="Enter product name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
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
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                  placeholder="0.00"
                />
              </div>
              
              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                  Stock Quantity*
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  required
                  value={formData.stock}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                  placeholder="Enter available quantity"
                />
              </div>
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category*
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                placeholder="Describe the product features, specifications, etc."
              ></textarea>
            </div>
            
            {/* Image Upload Method Toggle */}
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
            
            {/* Product Image - File Upload */}
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
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
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
            
            {/* Product Image - URL Input */}
            {imageUploadMethod === 'link' && (
              <div>
                <div className="mt-1">
                  <input
                    type="url"
                    name="imageUrl"
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                {imagePreview && (
                  <div className="mt-4 flex justify-center">
                    <img 
                      src={imagePreview} 
                      alt="Product preview" 
                      className="h-40 object-contain border rounded-md"
                      onError={() => {
                        setError('Image URL is invalid');
                        setImagePreview(null);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/products/manage')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              {loading ? 'Adding Product...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProd;