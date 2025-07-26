import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userType, setUserType] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [customerName, setCustomerName] = useState(localStorage.getItem('customerName'));
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Login/Register forms state
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [customerLoginForm, setCustomerLoginForm] = useState({ email: '', password: '' });
  const [customerRegisterForm, setCustomerRegisterForm] = useState({
    name: '', email: '', password: '', phone: ''
  });

  // Product form state for admin
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category: '', image: '', stock: '', weight: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    { id: 'all', name: 'All Products', icon: '🍖' },
    { id: 'chicken', name: 'Chicken', icon: '🐔' },
    { id: 'mutton', name: 'Mutton', icon: '🐐' },
    { id: 'fish', name: 'Fish', icon: '🐟' },
    { id: 'seafood', name: 'Seafood', icon: '🦐' },
    { id: 'eggs', name: 'Eggs', icon: '🥚' }
  ];

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Check authentication on load
  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserType(payload.role);
      if (payload.role === 'admin') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('customer-products');
      }
    }
  }, [token]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Filter products
  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  // Fetch admin dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch customers for admin
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  // Fetch orders for admin
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Admin login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm)
      });
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        setUserType('admin');
        setCurrentView('admin-dashboard');
        setAdminForm({ username: '', password: '' });
      } else {
        alert(data.detail);
      }
    } catch (error) {
      alert('Login failed');
    }
  };

  // Customer login
  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerLoginForm)
      });
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('customerName', data.customer_name);
        setCustomerName(data.customer_name);
        setUserType('customer');
        setCurrentView('customer-products');
        setCustomerLoginForm({ email: '', password: '' });
      } else {
        alert(data.detail);
      }
    } catch (error) {
      alert('Login failed');
    }
  };

  // Customer register
  const handleCustomerRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerRegisterForm)
      });
      const data = await response.json();
      
      if (response.ok) {
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('customerName', data.customer_name);
        setCustomerName(data.customer_name);
        setUserType('customer');
        setCurrentView('customer-products');
        setCustomerRegisterForm({ name: '', email: '', password: '', phone: '' });
      } else {
        alert(data.detail);
      }
    } catch (error) {
      alert('Registration failed');
    }
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setProductForm({ ...productForm, image: data.imageUrl });
        return data.imageUrl;
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      return null;
    }
  };

  // Add product (admin)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock)
        })
      });
      
      if (response.ok) {
        alert('Product added successfully!');
        setProductForm({ name: '', description: '', price: '', category: '', image: '', stock: '', weight: '' });
        setImagePreview(null);
        fetchProducts();
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      alert('Failed to add product');
    }
  };

  // Add to cart with animation
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { 
        product_id: product.id, 
        quantity: 1, 
        price: product.price, 
        name: product.name,
        image: product.image,
        weight: product.weight
      }]);
    }
    
    // Show success animation
    const button = document.querySelector(`[data-product-id="${product.id}"]`);
    if (button) {
      button.innerHTML = '✓ Added!';
      button.classList.add('bg-green-600');
      setTimeout(() => {
        button.innerHTML = 'Add to Cart';
        button.classList.remove('bg-green-600');
      }, 1000);
    }
  };

  // Update cart item quantity
  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.product_id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  // Place order
  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    try {
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const orderItems = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const response = await fetch(`${API_BASE_URL}/api/customer/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          total_amount: totalAmount
        })
      });

      if (response.ok) {
        alert('Order placed successfully!');
        setCart([]);
        setCurrentView('customer-products');
      } else {
        alert('Failed to place order');
      }
    } catch (error) {
      alert('Failed to place order');
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Upload the image
      handleImageUpload(file).then(imageUrl => {
        if (imageUrl) {
          setProductForm({ ...productForm, image: imageUrl });
        }
      });
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Logout
  const handleLogout = () => {
    setToken(null);
    setUserType(null);
    setCustomerName(null);
    localStorage.removeItem('token');
    localStorage.removeItem('customerName');
    setCurrentView('home');
    setCart([]);
    setMobileMenuOpen(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Toggle cart dropdown
  const toggleCartDropdown = () => {
    setIsCartOpen(!isCartOpen);
  };

  // Close mobile menu when view changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentView]);

  // Load data when views change
  useEffect(() => {
    if (currentView === 'customer-products') {
      fetchProducts();
    } else if (currentView === 'admin-dashboard') {
      fetchDashboardStats();
    } else if (currentView === 'admin-orders') {
      fetchOrders();
    } else if (currentView === 'admin-products') {
      fetchProducts();
    } else if (currentView === 'admin-customers') {
      fetchCustomers();
    }
  }, [currentView]);

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-red-500 to-orange-500 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-full"
              >
                <span className="text-2xl">🥩</span>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Makhmali
                </h1>
                <p className="text-xs text-gray-500">Premium Quality Delivered</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              {!token ? (
                <>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentView('home')}
                    className="text-red-600 hover:text-red-800 font-medium transition-colors"
                  >
                    Home
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentView('admin-login')}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full hover:from-red-600 hover:to-red-700 transition-all shadow-md"
                  >
                    Admin Login
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentView('customer-login')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                  >
                    Customer Login
                  </motion.button>
                </>
              ) : (
                <>
                  {userType === 'admin' ? (
                    <>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentView('admin-dashboard')}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Dashboard
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentView('admin-products')}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Products
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentView('admin-orders')}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Orders
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentView('admin-customers')}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Customers
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentView('customer-products')}
                        className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
                      >
                        Products
                      </motion.button>
                      <div className="relative">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={toggleCartDropdown}
                          className="text-orange-600 hover:text-orange-800 font-medium relative transition-colors flex items-center"
                        >
                          <span className="mr-1">Cart</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {cart.length > 0 && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                            >
                              {cart.length}
                            </motion.span>
                          )}
                        </motion.button>
                        
                        {/* Cart Dropdown */}
                        <AnimatePresence>
                          {isCartOpen && (
                            <motion.div 
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50 border border-gray-200"
                            >
                              <div className="p-4 max-h-96 overflow-y-auto">
                                {cart.length === 0 ? (
                                  <p className="text-gray-600 text-center py-4">Your cart is empty</p>
                                ) : (
                                  <>
                                    {cart.map(item => (
                                      <div key={item.product_id} className="flex items-center py-3 border-b border-gray-100">
                                        <img 
                                          src={item.image} 
                                          alt={item.name}
                                          className="w-12 h-12 object-cover rounded"
                                        />
                                        <div className="ml-3 flex-1">
                                          <h4 className="text-sm font-medium text-gray-800 truncate">{item.name}</h4>
                                          <p className="text-xs text-gray-500">{item.weight}</p>
                                          <p className="text-sm font-bold text-red-600">₹{item.price}</p>
                                        </div>
                                        <div className="flex items-center">
                                          <button 
                                            onClick={() => updateCartItemQuantity(item.product_id, item.quantity - 1)}
                                            className="text-gray-500 hover:text-red-500 p-1"
                                          >
                                            -
                                          </button>
                                          <span className="mx-2 text-sm">{item.quantity}</span>
                                          <button 
                                            onClick={() => updateCartItemQuantity(item.product_id, item.quantity + 1)}
                                            className="text-gray-500 hover:text-green-500 p-1"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold">Total:</span>
                                        <span className="font-bold text-red-600">₹{cartTotal.toFixed(2)}</span>
                                      </div>
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                          setCurrentView('customer-cart');
                                          setIsCartOpen(false);
                                        }}
                                        className="w-full mt-2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg text-sm font-medium"
                                      >
                                        View Cart
                                      </motion.button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Welcome, {customerName}!</span>
                      </div>
                    </>
                  )}
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors shadow-md"
                  >
                    Logout
                  </motion.button>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              {token && userType === 'customer' && (
                <button 
                  onClick={toggleCartDropdown}
                  className="relative text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
              )}
              <button 
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-red-600 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4">
              <div className="flex flex-col space-y-3">
                {!token ? (
                  <>
                    <button 
                      onClick={() => setCurrentView('home')}
                      className="text-left text-red-600 hover:text-red-800 font-medium transition-colors py-2"
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => setCurrentView('admin-login')}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full hover:from-red-600 hover:to-red-700 transition-all text-center"
                    >
                      Admin Login
                    </button>
                    <button 
                      onClick={() => setCurrentView('customer-login')}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all text-center"
                    >
                      Customer Login
                    </button>
                  </>
                ) : (
                  <>
                    {userType === 'admin' ? (
                      <>
                        <button 
                          onClick={() => setCurrentView('admin-dashboard')}
                          className="text-left text-red-600 hover:text-red-800 font-medium transition-colors py-2"
                        >
                          Dashboard
                        </button>
                        <button 
                          onClick={() => setCurrentView('admin-products')}
                          className="text-left text-red-600 hover:text-red-800 font-medium transition-colors py-2"
                        >
                          Products
                        </button>
                        <button 
                          onClick={() => setCurrentView('admin-orders')}
                          className="text-left text-red-600 hover:text-red-800 font-medium transition-colors py-2"
                        >
                          Orders
                        </button>
                        <button 
                          onClick={() => setCurrentView('admin-customers')}
                          className="text-left text-red-600 hover:text-red-800 font-medium transition-colors py-2"
                        >
                          Customers
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => setCurrentView('customer-products')}
                          className="text-left text-orange-600 hover:text-orange-800 font-medium transition-colors py-2"
                        >
                          Products
                        </button>
                        <button 
                          onClick={() => {
                            setCurrentView('customer-cart');
                            setMobileMenuOpen(false);
                          }}
                          className="text-left text-orange-600 hover:text-orange-800 font-medium transition-colors py-2 relative"
                        >
                          Cart ({cart.length})
                          {cart.length > 0 && (
                            <span className="absolute -top-1 left-20 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {cart.length}
                            </span>
                          )}
                        </button>
                        <div className="text-gray-600 py-2">
                          Welcome, {customerName}!
                        </div>
                      </>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors text-center"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Home Page */}
        {currentView === 'home' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-16">
              <motion.h2 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6"
              >
                Fresh Meat Delivered
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              >
                Premium quality chicken, mutton, fish, and seafood delivered fresh to your doorstep. 
                Experience the freshness that makes all the difference.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6"
              >
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView('customer-login')}
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 md:px-10 py-3 md:py-4 rounded-full text-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
                >
                  Shop Now
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView('admin-login')}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 md:px-10 py-3 md:py-4 rounded-full text-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg"
                >
                  Admin Access
                </motion.button>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-xl transition-all"
              >
                <div className="bg-gradient-to-r from-red-500 to-orange-500 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl md:text-3xl">🥩</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-red-700 mb-3 md:mb-4">Premium Quality</h3>
                <p className="text-gray-600 text-sm md:text-base">Hand-selected, fresh meat cuts from trusted suppliers with quality guarantee</p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-xl transition-all"
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl md:text-3xl">🚚</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-blue-700 mb-3 md:mb-4">Fast Delivery</h3>
                <p className="text-gray-600 text-sm md:text-base">Same-day delivery available with temperature-controlled vehicles</p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-xl transition-all"
              >
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl md:text-3xl">❄️</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-cyan-700 mb-3 md:mb-4">Fresh & Cold</h3>
                <p className="text-gray-600 text-sm md:text-base">Maintained at optimal temperature from farm to your table</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Admin Login */}
        {currentView === 'admin-login' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
              <div className="text-center mb-6">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-red-500 to-orange-500 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-2xl">👨‍💼</span>
                </motion.div>
                <h2 className="text-xl md:text-2xl font-bold text-red-700">Admin Login</h2>
              </div>
              <form onSubmit={handleAdminLogin}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                  <input 
                    type="text"
                    value={adminForm.username}
                    onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                  <input 
                    type="password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold"
                >
                  Login
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Customer Login */}
        {currentView === 'customer-login' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
              <div className="text-center mb-6">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-2xl">👤</span>
                </motion.div>
                <h2 className="text-xl md:text-2xl font-bold text-orange-700">Customer Login</h2>
              </div>
              <form onSubmit={handleCustomerLogin}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input 
                    type="email"
                    value={customerLoginForm.email}
                    onChange={(e) => setCustomerLoginForm({...customerLoginForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                  <input 
                    type="password"
                    value={customerLoginForm.password}
                    onChange={(e) => setCustomerLoginForm({...customerLoginForm, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold mb-4"
                >
                  Login
                </motion.button>
              </form>
              <div className="text-center">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView('customer-register')}
                  className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
                >
                  Don't have an account? Register here
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Customer Register */}
        {currentView === 'customer-register' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto"
          >
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl">
              <div className="text-center mb-6">
                <motion.div 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-green-500 to-blue-500 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-2xl">✨</span>
                </motion.div>
                <h2 className="text-xl md:text-2xl font-bold text-green-700">Create Account</h2>
              </div>
              <form onSubmit={handleCustomerRegister}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
                  <input 
                    type="text"
                    value={customerRegisterForm.name}
                    onChange={(e) => setCustomerRegisterForm({...customerRegisterForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input 
                    type="email"
                    value={customerRegisterForm.email}
                    onChange={(e) => setCustomerRegisterForm({...customerRegisterForm, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                  <input 
                    type="tel"
                    value={customerRegisterForm.phone}
                    onChange={(e) => setCustomerRegisterForm({...customerRegisterForm, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                  <input 
                    type="password"
                    value={customerRegisterForm.password}
                    onChange={(e) => setCustomerRegisterForm({...customerRegisterForm, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold mb-4"
                >
                  Create Account
                </motion.button>
              </form>
              <div className="text-center">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentView('customer-login')}
                  className="text-green-600 hover:text-green-800 font-medium transition-colors"
                >
                  Already have an account? Login here
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Admin Dashboard */}
        {currentView === 'admin-dashboard' && userType === 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h2>
              <p className="text-gray-600">Manage your meat delivery business</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-4 md:p-6 rounded-2xl shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700">Total Products</h3>
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 md:p-3 rounded-full">
                    <span className="text-white text-lg md:text-xl">📦</span>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-red-600">{dashboardStats.products_count || 0}</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">Available in stock</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-4 md:p-6 rounded-2xl shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700">Total Orders</h3>
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-2 md:p-3 rounded-full">
                    <span className="text-white text-lg md:text-xl">📋</span>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-green-600">{dashboardStats.orders_count || 0}</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">Orders processed</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white p-4 md:p-6 rounded-2xl shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700">Total Customers</h3>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 md:p-3 rounded-full">
                    <span className="text-white text-lg md:text-xl">👥</span>
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-purple-600">{dashboardStats.customers_count || 0}</p>
                <p className="text-xs md:text-sm text-gray-500 mt-1 md:mt-2">Registered users</p>
              </motion.div>
            </div>
            
            <motion.div 
              whileHover={{ scale: 1.005 }}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-xl"
            >
              <h3 className="text-xl md:text-2xl font-bold text-red-700 mb-4 md:mb-6">Add New Product</h3>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                  <input 
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                  <select 
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="chicken">Chicken</option>
                    <option value="mutton">Mutton</option>
                    <option value="fish">Fish</option>
                    <option value="seafood">Seafood</option>
                    <option value="eggs">Eggs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Price (₹)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Stock Quantity</label>
                  <input 
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Weight/Quantity</label>
                  <input 
                    type="text"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({...productForm, weight: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., 500g, 1kg, 12 pieces"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Image</label>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                    >
                      Choose Image
                    </button>
                    {imagePreview && (
                      <div className="w-12 h-12 rounded overflow-hidden border border-gray-300">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                  <textarea 
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="3"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 md:px-8 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold"
                  >
                    Add Product
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Admin Products Management */}
        {currentView === 'admin-products' && userType === 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Product Management
              </h2>
              <p className="text-gray-600">Manage your product catalog</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map(product => (
                <motion.div 
                  key={product.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all"
                >
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-40 md:h-48 object-cover"
                    />
                    <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-white px-1 md:px-2 py-0 md:py-1 rounded-full text-xs font-semibold">
                      Stock: {product.stock}
                    </div>
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-2 md:mb-3 text-xs md:text-sm">{product.description}</p>
                    <div className="flex justify-between items-center mb-2 md:mb-3">
                      <span className="text-xl md:text-2xl font-bold text-red-600">₹{product.price}</span>
                      <span className="text-xs md:text-sm text-gray-500">{product.weight}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 md:px-3 py-0 md:py-1 rounded-full text-xs md:text-sm font-semibold">
                        {product.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Admin Orders */}
        {currentView === 'admin-orders' && userType === 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Order Management
              </h2>
              <p className="text-gray-600">Track and manage customer orders</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                    <tr>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base">Order ID</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base">Customer</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base">Items</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base">Total</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base">Status</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-sm md:text-base">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <motion.tr 
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-mono">{order.id?.slice(0, 8)}...</td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div>
                            <div className="font-semibold text-sm md:text-base">{order.customer?.name}</div>
                            <div className="text-xs md:text-sm text-gray-600">{order.customer?.email}</div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm">{order.items?.length} items</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 font-semibold text-red-600 text-base md:text-lg">₹{order.total_amount}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Admin Customers */}
        {currentView === 'admin-customers' && userType === 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Customer Management
              </h2>
              <p className="text-gray-600">View and manage your customers</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {customers.map((customer, index) => (
                <motion.div 
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-xl p-4 md:p-6 transition-all"
                >
                  <div className="flex items-center mb-3 md:mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-base md:text-lg">
                        {customer.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3 md:ml-4">
                      <h3 className="text-base md:text-lg font-bold text-gray-800">{customer.name}</h3>
                      <p className="text-xs md:text-sm text-gray-600">{customer.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                    <p className="text-gray-600">
                      <span className="font-semibold">Phone:</span> {customer.phone}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Orders:</span> {customer.order_count || 0}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Joined:</span> {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Customer Products */}
        {currentView === 'customer-products' && userType === 'customer' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Search and Filter Section */}
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center">
                <div className="flex-1 w-full">
                  <input 
                    type="text"
                    placeholder="Search for chicken, mutton, fish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-1 md:space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  {categories.map(category => (
                    <motion.button
                      key={category.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 md:px-4 py-1 md:py-2 rounded-full whitespace-nowrap transition-all text-xs md:text-sm ${
                        selectedCategory === category.id 
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category.icon} {category.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Fresh Meat Collection
              </h2>
              <p className="text-gray-600">Premium quality meat delivered fresh to your doorstep</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <motion.div 
                  key={product.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all"
                >
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-40 md:h-48 object-cover"
                    />
                    <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-white px-1 md:px-2 py-0 md:py-1 rounded-full text-xs font-semibold">
                      {product.weight || '500g'}
                    </div>
                    <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-1 md:px-2 py-0 md:py-1 rounded-full text-xs font-semibold">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-2 md:mb-4 text-xs md:text-sm">{product.description}</p>
                    <div className="flex justify-between items-center mb-3 md:mb-4">
                      <span className="text-xl md:text-2xl font-bold text-red-600">₹{product.price}</span>
                      <span className="text-xs md:text-sm text-gray-500">Stock: {product.stock}</span>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(product)}
                      data-product-id={product.id}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 md:py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold text-sm md:text-base"
                    >
                      Add to Cart
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Customer Cart */}
        {currentView === 'customer-cart' && userType === 'customer' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                Your Cart
              </h2>
              <p className="text-gray-600">Review your selected items</p>
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <motion.div 
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    y: [0, -10, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6"
                >
                  <span className="text-3xl md:text-4xl">🛒</span>
                </motion.div>
                <p className="text-gray-600 text-base md:text-lg mb-4 md:mb-6">Your cart is empty</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView('customer-products')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold"
                >
                  Continue Shopping
                </motion.button>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 lg:p-8">
                  <div className="space-y-4 md:space-y-6">
                    {cart.map(item => (
                      <motion.div 
                        key={item.product_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between items-center py-3 md:py-4 lg:py-6 border-b border-gray-200"
                      >
                        <div className="flex items-center flex-1">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded"
                          />
                          <div className="ml-4">
                            <h3 className="text-base md:text-lg font-semibold text-gray-800">{item.name}</h3>
                            <p className="text-gray-600 text-xs md:text-sm">{item.weight}</p>
                            <p className="text-sm font-bold text-red-600">₹{item.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateCartItemQuantity(item.product_id, item.quantity - 1)}
                            className="text-gray-500 hover:text-red-500 p-1 md:p-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </motion.button>
                          <span className="mx-2 text-base md:text-lg font-medium">{item.quantity}</span>
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateCartItemQuantity(item.product_id, item.quantity + 1)}
                            className="text-gray-500 hover:text-green-500 p-1 md:p-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </motion.button>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg md:text-xl font-bold text-red-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-red-500 hover:text-red-700 text-xs md:text-sm mt-1"
                          >
                            Remove
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                      <span className="text-xl md:text-2xl font-bold text-gray-800">Total Amount:</span>
                      <span className="text-2xl md:text-3xl font-bold text-red-600">
                        ₹{cartTotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCurrentView('customer-products')}
                        className="flex-1 bg-gray-600 text-white py-2 md:py-3 lg:py-4 rounded-lg hover:bg-gray-700 transition-all font-semibold"
                      >
                        Continue Shopping
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={placeOrder}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 md:py-3 lg:py-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold"
                      >
                        Place Order
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-red-700 to-orange-700 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Makhmali</h3>
              <p className="text-orange-100">Premium quality meat delivered fresh to your doorstep. Experience the freshness that makes all the difference.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => setCurrentView('home')} className="text-orange-100 hover:text-white">Home</button></li>
                <li><button onClick={() => setCurrentView('customer-products')} className="text-orange-100 hover:text-white">Products</button></li>
                <li><button onClick={() => setCurrentView('customer-login')} className="text-orange-100 hover:text-white">Login</button></li>
                <li><button onClick={() => setCurrentView('customer-register')} className="text-orange-100 hover:text-white">Register</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Us</h3>
              <p className="text-orange-100">123 Meat Street, Foodville</p>
              <p className="text-orange-100">Phone: +91 9876543210</p>
              <p className="text-orange-100">Email: info@makhmali.com</p>
            </div>
          </div>
          <div className="border-t border-orange-500 mt-8 pt-6 text-center text-orange-100">
            <p>© {new Date().getFullYear()} Makhmali. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
