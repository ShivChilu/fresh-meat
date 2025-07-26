import React, { useState, useEffect } from 'react';
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
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

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

  const categories = [
    { id: 'all', name: 'All Products', icon: '🍖' },
    { id: 'chicken', name: 'Chicken', icon: '🐔' },
    { id: 'mutton', name: 'Mutton', icon: '🐐' },
    { id: 'fish', name: 'Fish', icon: '🐟' },
    { id: 'seafood', name: 'Seafood', icon: '🦐' },
    { id: 'eggs', name: 'Eggs', icon: '🥚' }
  ];

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
      setCart([...cart, { product_id: product.id, quantity: 1, price: product.price, name: product.name }]);
    }
    
    // Show success animation
    const button = document.querySelector(`[data-product-id="${product.id}"]`);
    if (button) {
      button.innerHTML = '✓ Added!';
      button.className = button.className.replace('bg-red-600', 'bg-green-600');
      setTimeout(() => {
        button.innerHTML = 'Add to Cart';
        button.className = button.className.replace('bg-green-600', 'bg-red-600');
      }, 1000);
    }
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

  // Logout
  const handleLogout = () => {
    setToken(null);
    setUserType(null);
    setCustomerName(null);
    localStorage.removeItem('token');
    localStorage.removeItem('customerName');
    setCurrentView('home');
    setCart([]);
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-red-500 to-orange-500 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-full">
                <span className="text-2xl">🥩</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  FreshMeat
                </h1>
                <p className="text-xs text-gray-500">Premium Quality Delivered</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              {!token ? (
                <>
                  <button 
                    onClick={() => setCurrentView('home')}
                    className="text-red-600 hover:text-red-800 font-medium transition-colors"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => setCurrentView('admin-login')}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
                  >
                    Admin Login
                  </button>
                  <button 
                    onClick={() => setCurrentView('customer-login')}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
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
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Dashboard
                      </button>
                      <button 
                        onClick={() => setCurrentView('admin-products')}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Products
                      </button>
                      <button 
                        onClick={() => setCurrentView('admin-orders')}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Orders
                      </button>
                      <button 
                        onClick={() => setCurrentView('admin-customers')}
                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                      >
                        Customers
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setCurrentView('customer-products')}
                        className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
                      >
                        Products
                      </button>
                      <button 
                        onClick={() => setCurrentView('customer-cart')}
                        className="text-orange-600 hover:text-orange-800 font-medium relative transition-colors"
                      >
                        Cart ({cart.length})
                        {cart.length > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                            {cart.length}
                          </span>
                        )}
                      </button>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Welcome, {customerName}!</span>
                      </div>
                    </>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="bg-gray-600 text-white px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Home Page */}
        {currentView === 'home' && (
          <div className="text-center">
            <div className="mb-16">
              <h2 className="text-6xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6">
                Fresh Meat Delivered
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Premium quality chicken, mutton, fish, and seafood delivered fresh to your doorstep. 
                Experience the freshness that makes all the difference.
              </p>
              <div className="flex justify-center space-x-6">
                <button 
                  onClick={() => setCurrentView('customer-login')}
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  Shop Now
                </button>
                <button 
                  onClick={() => setCurrentView('admin-login')}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 shadow-lg"
                >
                  Admin Access
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🥩</span>
                </div>
                <h3 className="text-xl font-bold text-red-700 mb-4">Premium Quality</h3>
                <p className="text-gray-600">Hand-selected, fresh meat cuts from trusted suppliers with quality guarantee</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚚</span>
                </div>
                <h3 className="text-xl font-bold text-blue-700 mb-4">Fast Delivery</h3>
                <p className="text-gray-600">Same-day delivery available with temperature-controlled vehicles</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">❄️</span>
                </div>
                <h3 className="text-xl font-bold text-cyan-700 mb-4">Fresh & Cold</h3>
                <p className="text-gray-600">Maintained at optimal temperature from farm to your table</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Login */}
        {currentView === 'admin-login' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👨‍💼</span>
                </div>
                <h2 className="text-2xl font-bold text-red-700">Admin Login</h2>
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
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 font-semibold"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Customer Login */}
        {currentView === 'customer-login' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👤</span>
                </div>
                <h2 className="text-2xl font-bold text-orange-700">Customer Login</h2>
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
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 font-semibold mb-4"
                >
                  Login
                </button>
              </form>
              <div className="text-center">
                <button 
                  onClick={() => setCurrentView('customer-register')}
                  className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
                >
                  Don't have an account? Register here
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Register */}
        {currentView === 'customer-register' && (
          <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✨</span>
                </div>
                <h2 className="text-2xl font-bold text-green-700">Create Account</h2>
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
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 font-semibold mb-4"
                >
                  Create Account
                </button>
              </form>
              <div className="text-center">
                <button 
                  onClick={() => setCurrentView('customer-login')}
                  className="text-green-600 hover:text-green-800 font-medium transition-colors"
                >
                  Already have an account? Login here
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Dashboard */}
        {currentView === 'admin-dashboard' && userType === 'admin' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h2>
              <p className="text-gray-600">Manage your meat delivery business</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Products</h3>
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-full">
                    <span className="text-white text-xl">📦</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-red-600">{dashboardStats.products_count || 0}</p>
                <p className="text-sm text-gray-500 mt-2">Available in stock</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
                    <span className="text-white text-xl">📋</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600">{dashboardStats.orders_count || 0}</p>
                <p className="text-sm text-gray-500 mt-2">Orders processed</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Customers</h3>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                    <span className="text-white text-xl">👥</span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-600">{dashboardStats.customers_count || 0}</p>
                <p className="text-sm text-gray-500 mt-2">Registered users</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold text-red-700 mb-6">Add New Product</h3>
              <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-6">
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
                  <label className="block text-gray-700 text-sm font-bold mb-2">Image URL</label>
                  <input 
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
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
                  <button 
                    type="submit"
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 font-semibold"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Products Management */}
        {currentView === 'admin-products' && userType === 'admin' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Product Management
              </h2>
              <p className="text-gray-600">Manage your product catalog</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-xs font-semibold">
                      Stock: {product.stock}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-3 text-sm">{product.description}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-red-600">₹{product.price}</span>
                      <span className="text-sm text-gray-500">{product.weight}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {product.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Orders */}
        {currentView === 'admin-orders' && userType === 'admin' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Order Management
              </h2>
              <p className="text-gray-600">Track and manage customer orders</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Order ID</th>
                      <th className="px-6 py-4 text-left font-semibold">Customer</th>
                      <th className="px-6 py-4 text-left font-semibold">Items</th>
                      <th className="px-6 py-4 text-left font-semibold">Total</th>
                      <th className="px-6 py-4 text-left font-semibold">Status</th>
                      <th className="px-6 py-4 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={order.id} className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 text-sm font-mono">{order.id?.slice(0, 8)}...</td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold">{order.customer?.name}</div>
                            <div className="text-sm text-gray-600">{order.customer?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{order.items?.length} items</td>
                        <td className="px-6 py-4 font-semibold text-red-600 text-lg">₹{order.total_amount}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Admin Customers */}
        {currentView === 'admin-customers' && userType === 'admin' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Customer Management
              </h2>
              <p className="text-gray-600">View and manage your customers</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map(customer => (
                <div key={customer.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {customer.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-bold text-gray-800">{customer.name}</h3>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Products */}
        {currentView === 'customer-products' && userType === 'customer' && (
          <div>
            {/* Search and Filter Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1">
                  <input 
                    type="text"
                    placeholder="Search for chicken, mutton, fish..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-2 overflow-x-auto">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                        selectedCategory === category.id 
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                Fresh Meat Collection
              </h2>
              <p className="text-gray-600">Premium quality meat delivered fresh to your doorstep</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:scale-105">
                  <div className="relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-xs font-semibold">
                      {product.weight || '500g'}
                    </div>
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-red-600">₹{product.price}</span>
                      <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      data-product-id={product.id}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 font-semibold"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Cart */}
        {currentView === 'customer-cart' && userType === 'customer' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                Your Cart
              </h2>
              <p className="text-gray-600">Review your selected items</p>
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🛒</span>
                </div>
                <p className="text-gray-600 text-lg mb-6">Your cart is empty</p>
                <button 
                  onClick={() => setCurrentView('customer-products')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 font-semibold"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="space-y-6">
                    {cart.map(item => (
                      <div key={item.product_id} className="flex justify-between items-center py-6 border-b border-gray-200">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-500">₹{item.price} per item</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-red-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-2xl font-bold text-gray-800">Total Amount:</span>
                      <span className="text-3xl font-bold text-red-600">
                        ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => setCurrentView('customer-products')}
                        className="flex-1 bg-gray-600 text-white py-4 rounded-lg hover:bg-gray-700 transition-all font-semibold"
                      >
                        Continue Shopping
                      </button>
                      <button 
                        onClick={placeOrder}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 font-semibold"
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;