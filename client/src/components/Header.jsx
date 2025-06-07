import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
    setCurrentUser(user);
  }, [location]); // Re-check when location changes

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    // Clear storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    // Update local state
    setCurrentUser(null);
    
    // Close menus
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
    
    // Navigate to start page
    navigate('/startpage');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'font-bold border-b-2 border-black' : '';
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/home" className="flex-shrink-0 flex items-center">
              <svg className="h-8 w-8 text-black mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
              </svg>
              <span className="text-black font-bold text-2xl">SellerPro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {currentUser && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-gray-700 hover:text-black px-3 py-2 text-sm font-medium ${isActive('/dashboard')}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/products/manage" 
                  className={`text-gray-700 hover:text-black px-3 py-2 text-sm font-medium ${isActive('/products/manage')}`}
                >
                  Products
                </Link>
                <Link 
                  to="/analytics" 
                  className={`text-gray-700 hover:text-black px-3 py-2 text-sm font-medium ${isActive('/analytics')}`}
                >
                  Analytics
                </Link>
                <Link 
                  to="/activity" 
                  className={`text-gray-700 hover:text-black px-3 py-2 text-sm font-medium ${isActive('/activity')}`}
                >
                  Activity
                </Link>
                {currentUser.isAdmin === true && (
                  <Link 
                    to="/manage-sellers" 
                    className={`text-gray-700 hover:text-black px-3 py-2 text-sm font-medium ${isActive('/manage-sellers')}`}
                  >
                    Manage Sellers
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Menu & Mobile Menu Button */}
          <div className="flex items-center">
            {currentUser ? (
              <div className="hidden md:flex md:items-center">
                <div className="relative ml-4" ref={dropdownRef}>
                  <button 
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-2 text-gray-700 hover:text-black focus:outline-none"
                    aria-expanded={isProfileDropdownOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {currentUser.fullName?.charAt(0) || currentUser.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{currentUser.username}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Enhanced Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 overflow-hidden">
                      {/* User Info Section */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm leading-5 font-medium text-gray-900 truncate">
                          {currentUser.fullName || currentUser.username}
                        </p>
                        <p className="text-xs leading-4 text-gray-500 truncate mt-1">
                          {currentUser.email}
                        </p>
                      </div>
                      
                      {/* Quick Access Section */}
                      <div className="py-1">
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          My Profile
                        </Link>
                        <Link 
                          to="/products/manage" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          Manage Products
                        </Link>
                        <Link 
                          to="/products/new" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Add Product
                        </Link>
                        <Link 
                          to="/products/bulk-upload" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Bulk Upload
                        </Link>
                        <Link 
                          to="/analytics" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Analytics
                        </Link>
                      </div>
                      
                      {/* Sign Out Section */}
                      <div className="py-1 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Link
                  to="/signin"
                  className={`text-gray-700 hover:text-black px-3 py-2 text-sm font-medium ${isActive('/signin')}`}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className={`bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 ${isActive('/signup')}`}
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex md:hidden ml-4">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/products/manage"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  Products
                </Link>
                <Link
                  to="/products/new"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  Add Product
                </Link>
                <Link
                  to="/products/bulk-upload"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  Bulk Upload
                </Link>
                <Link
                  to="/analytics"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  Analytics
                </Link>
                <Link
                  to="/activity"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  Activity
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                {currentUser.isAdmin === true && (
                  <Link
                    to="/manage-sellers"
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                    onClick={closeMenu}
                  >
                    Manage Sellers
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50"
                  onClick={closeMenu}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;