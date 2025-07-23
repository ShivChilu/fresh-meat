import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userType, setUserType] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [customerName, setCustomerName] = useState(localStorage.getItem('customerName'));
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});

  // Login/Register forms state
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [customerLoginForm, setCustomerLoginForm] = useState({ email: '', password: '' });
  const [customerRegisterForm, setCustomerRegisterForm] = useState({
    name: '', email: '', password: '', phone: ''
  });

  // Product form state for admin
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', category: '', image: '', stock: ''
  });

  const sampleImages = [
    'https://images.unsplash.com/photo-1680169088018-99fb63803c54?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxtZWF0JTIwY3V0c3xlbnwwfHx8fDE3NTMyNjIxNzR8MA&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1688228246800-2bac4342cb88?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxtZWF0JTIwY3V0c3xlbnwwfHx8fDE3NTMyNjIxNzR8MA&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1628543108325-1c27cd7246b3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHxiZWVmJTIwc3RlYWt8ZW58MHx8fHwxNzUzMjYyMTg0fDA&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1677027201352-3c3981cb8b5c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHxiZWVmJTIwc3RlYWt8ZW58MHx8fHwxNzUzMjYyMTg0fDA&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1546964124-0cce460f38ef?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwyfHxiZWVmJTIwc3RlYWt8ZW58MHx8fHwxNzUzMjYyMTg0fDA&ixlib=rb-4.1.0&q=85'
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
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

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
      // Convert image URL to base64 for storage
      const imageUrl = productForm.image || sampleImages[Math.floor(Math.random() * sampleImages.length)];
      
      const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock),
          image: imageUrl
        })
      });
      
      if (response.ok) {
        alert('Product added successfully!');
        setProductForm({ name: '', description: '', price: '', category: '', image: '', stock: '' });
        fetchProducts();
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      alert('Failed to add product');
    }
  };

  // Add to cart
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
    alert('Added to cart!');
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
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-red-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🥩</span>
              <h1 className="text-2xl font-bold text-red-700">Premium Meat Delivery</h1>
            </div>
            
            <nav className="flex items-center space-x-4">
              {!token ? (
                <>
                  <button 
                    onClick={() => setCurrentView('home')}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => setCurrentView('admin-login')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Admin Login
                  </button>
                  <button 
                    onClick={() => setCurrentView('customer-login')}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
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
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Dashboard
                      </button>
                      <button 
                        onClick={() => setCurrentView('admin-products')}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Manage Products
                      </button>
                      <button 
                        onClick={() => setCurrentView('admin-orders')}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Orders
                      </button>
                      <button 
                        onClick={() => setCurrentView('admin-customers')}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Customers
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => setCurrentView('customer-products')}
                        className="text-orange-600 hover:text-orange-800 font-medium"
                      >
                        Products
                      </button>
                      <button 
                        onClick={() => setCurrentView('customer-cart')}
                        className="text-orange-600 hover:text-orange-800 font-medium relative"
                      >
                        Cart ({cart.length})
                      </button>
                      <span className="text-gray-600">Welcome, {customerName}!</span>
                    </>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
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
            <div className="mb-12">
              <h2 className="text-5xl font-bold text-red-700 mb-4">Premium Quality Meat</h2>
              <p className="text-xl text-gray-600 mb-8">Fresh, high-quality meat delivered to your doorstep</p>
              <div className="flex justify-center space-x-6">
                <button 
                  onClick={() => setCurrentView('customer-login')}
                  className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Shop Now
                </button>
                <button 
                  onClick={() => setCurrentView('admin-login')}
                  className="bg-gray-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Admin Access
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <span className="text-4xl mb-4 block">🥩</span>
                <h3 className="text-xl font-bold text-red-700 mb-2">Premium Quality</h3>
                <p className="text-gray-600">Hand-selected, fresh meat cuts from trusted suppliers</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <span className="text-4xl mb-4 block">🚚</span>
                <h3 className="text-xl font-bold text-red-700 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Quick and reliable delivery to your doorstep</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <span className="text-4xl mb-4 block">❄️</span>
                <h3 className="text-xl font-bold text-red-700 mb-2">Fresh & Cold</h3>
                <p className="text-gray-600">Temperature-controlled storage and delivery</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Login */}
        {currentView === 'admin-login' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-700 mb-6 text-center">Admin Login</h2>
            <form onSubmit={handleAdminLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                <input 
                  type="text"
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({...adminForm, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input 
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Login
              </button>
            </form>
          </div>
        )}

        {/* Customer Login */}
        {currentView === 'customer-login' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">Customer Login</h2>
            <form onSubmit={handleCustomerLogin}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input 
                  type="email"
                  value={customerLoginForm.email}
                  onChange={(e) => setCustomerLoginForm({...customerLoginForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input 
                  type="password"
                  value={customerLoginForm.password}
                  onChange={(e) => setCustomerLoginForm({...customerLoginForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors mb-4"
              >
                Login
              </button>
            </form>
            <div className="text-center">
              <button 
                onClick={() => setCurrentView('customer-register')}
                className="text-orange-600 hover:text-orange-800 font-medium"
              >
                Don't have an account? Register here
              </button>
            </div>
          </div>
        )}

        {/* Customer Register */}
        {currentView === 'customer-register' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">Customer Register</h2>
            <form onSubmit={handleCustomerRegister}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
                <input 
                  type="text"
                  value={customerRegisterForm.name}
                  onChange={(e) => setCustomerRegisterForm({...customerRegisterForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <input 
                  type="email"
                  value={customerRegisterForm.email}
                  onChange={(e) => setCustomerRegisterForm({...customerRegisterForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                <input 
                  type="tel"
                  value={customerRegisterForm.phone}
                  onChange={(e) => setCustomerRegisterForm({...customerRegisterForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                <input 
                  type="password"
                  value={customerRegisterForm.password}
                  onChange={(e) => setCustomerRegisterForm({...customerRegisterForm, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors mb-4"
              >
                Register
              </button>
            </form>
            <div className="text-center">
              <button 
                onClick={() => setCurrentView('customer-login')}
                className="text-orange-600 hover:text-orange-800 font-medium"
              >
                Already have an account? Login here
              </button>
            </div>
          </div>
        )}

        {/* Admin Dashboard */}
        {currentView === 'admin-dashboard' && userType === 'admin' && (
          <div>
            <h2 className="text-3xl font-bold text-red-700 mb-8">Admin Dashboard</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Products</h3>
                <p className="text-3xl font-bold text-red-600">{dashboardStats.products_count || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Orders</h3>
                <p className="text-3xl font-bold text-orange-600">{dashboardStats.orders_count || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Customers</h3>
                <p className="text-3xl font-bold text-green-600">{dashboardStats.customers_count || 0}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-red-700 mb-4">Add New Product</h3>
              <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                  <input 
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                  <select 
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="beef">Beef</option>
                    <option value="pork">Pork</option>
                    <option value="chicken">Chicken</option>
                    <option value="lamb">Lamb</option>
                    <option value="seafood">Seafood</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Price ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Stock</label>
                  <input 
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                  <textarea 
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                    rows="3"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Image URL (optional - random image will be used if empty)</label>
                  <input 
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <button 
                    type="submit"
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
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
            <h2 className="text-3xl font-bold text-red-700 mb-8">Manage Products</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-red-600 font-bold text-lg">${product.price}</span>
                      <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                    </div>
                    <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm mb-2">
                      {product.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Orders */}
        {currentView === 'admin-orders' && userType === 'admin' && (
          <div>
            <h2 className="text-3xl font-bold text-red-700 mb-8">Order Management</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-red-700 font-semibold">Order ID</th>
                      <th className="px-4 py-3 text-left text-red-700 font-semibold">Customer</th>
                      <th className="px-4 py-3 text-left text-red-700 font-semibold">Items</th>
                      <th className="px-4 py-3 text-left text-red-700 font-semibold">Total</th>
                      <th className="px-4 py-3 text-left text-red-700 font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-red-700 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b border-gray-200">
                        <td className="px-4 py-3 text-sm">{order.id?.slice(0, 8)}...</td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-semibold">{order.customer?.name}</div>
                            <div className="text-sm text-gray-600">{order.customer?.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{order.items?.length} items</td>
                        <td className="px-4 py-3 font-semibold text-red-600">${order.total_amount}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-sm">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Customer Products */}
        {currentView === 'customer-products' && userType === 'customer' && (
          <div>
            <h2 className="text-3xl font-bold text-orange-700 mb-8">Our Premium Meat Selection</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-orange-600 font-bold text-xl">${product.price}</span>
                      <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
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
            <h2 className="text-3xl font-bold text-orange-700 mb-8">Your Cart</h2>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
                <button 
                  onClick={() => setCurrentView('customer-products')}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                {cart.map(item => (
                  <div key={item.product_id} className="flex justify-between items-center py-4 border-b border-gray-200">
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold">Total: ${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex space-x-4">
                    <button 
                      onClick={() => setCurrentView('customer-products')}
                      className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Continue Shopping
                    </button>
                    <button 
                      onClick={placeOrder}
                      className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Place Order
                    </button>
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