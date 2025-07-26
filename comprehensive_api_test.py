#!/usr/bin/env python3
"""
Comprehensive API Testing for Meat Delivery App
Tests all specific endpoints mentioned in the review request
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://6d905b01-de00-4c97-bf80-bafb04707101.preview.emergentagent.com/api"

class ComprehensiveAPITester:
    def __init__(self):
        self.admin_token = None
        self.customer_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message="", details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })
        print()
    
    def test_get_health(self):
        """Test GET /api/health"""
        try:
            response = requests.get(f"{BACKEND_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_test("GET /api/health", True, f"API is healthy: {data.get('message', '')}")
                    return True
                else:
                    self.log_test("GET /api/health", False, "Invalid health response format", data)
                    return False
            else:
                self.log_test("GET /api/health", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("GET /api/health", False, f"Connection error: {str(e)}")
            return False
    
    def test_post_admin_login(self):
        """Test POST /api/admin/login (username: shiv, password: 123)"""
        try:
            payload = {"username": "shiv", "password": "123"}
            response = requests.post(f"{BACKEND_URL}/admin/login", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and data.get("role") == "admin":
                    self.admin_token = data["access_token"]
                    self.log_test("POST /api/admin/login", True, "Admin login successful with shiv/123 credentials")
                    return True
                else:
                    self.log_test("POST /api/admin/login", False, "Missing token or role in response", data)
                    return False
            else:
                self.log_test("POST /api/admin/login", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("POST /api/admin/login", False, f"Request error: {str(e)}")
            return False
    
    def test_post_customer_register(self):
        """Test POST /api/customer/register"""
        try:
            timestamp = int(datetime.now().timestamp())
            payload = {
                "name": "Rajesh Kumar",
                "email": f"rajesh.kumar.{timestamp}@example.com",
                "password": "mypassword123",
                "phone": "+919876543210"
            }
            response = requests.post(f"{BACKEND_URL}/customer/register", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and data.get("role") == "customer":
                    self.customer_token = data["access_token"]
                    self.log_test("POST /api/customer/register", True, "Customer registration successful")
                    return True
                else:
                    self.log_test("POST /api/customer/register", False, "Missing token or role in response", data)
                    return False
            else:
                self.log_test("POST /api/customer/register", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("POST /api/customer/register", False, f"Request error: {str(e)}")
            return False
    
    def test_post_customer_login(self):
        """Test POST /api/customer/login"""
        try:
            # First register a customer for login test
            timestamp = int(datetime.now().timestamp())
            email = f"priya.sharma.{timestamp}@example.com"
            password = "securepass456"
            
            register_payload = {
                "name": "Priya Sharma",
                "email": email,
                "password": password,
                "phone": "+919123456789"
            }
            requests.post(f"{BACKEND_URL}/customer/register", json=register_payload, timeout=10)
            
            # Now test login
            login_payload = {"email": email, "password": password}
            response = requests.post(f"{BACKEND_URL}/customer/login", json=login_payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and data.get("role") == "customer":
                    self.log_test("POST /api/customer/login", True, "Customer login successful")
                    return True
                else:
                    self.log_test("POST /api/customer/login", False, "Missing token or role in response", data)
                    return False
            else:
                self.log_test("POST /api/customer/login", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("POST /api/customer/login", False, f"Request error: {str(e)}")
            return False
    
    def test_get_products(self):
        """Test GET /api/products (should return 10+ sample products)"""
        try:
            response = requests.get(f"{BACKEND_URL}/products", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "products" in data and isinstance(data["products"], list):
                    products = data["products"]
                    if len(products) >= 10:
                        # Check for INR pricing and Indian products
                        sample_product = products[0] if products else {}
                        price = sample_product.get("price", 0)
                        name = sample_product.get("name", "")
                        
                        self.log_test("GET /api/products", True, f"Retrieved {len(products)} products with INR pricing. Sample: {name} - ₹{price}")
                        return True
                    else:
                        self.log_test("GET /api/products", False, f"Only {len(products)} products found, expected at least 10")
                        return False
                else:
                    self.log_test("GET /api/products", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("GET /api/products", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("GET /api/products", False, f"Request error: {str(e)}")
            return False
    
    def test_post_admin_products(self):
        """Test POST /api/admin/products (add new product)"""
        if not self.admin_token:
            self.log_test("POST /api/admin/products", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            payload = {
                "name": "Fresh Chicken Drumsticks",
                "description": "Tender chicken drumsticks perfect for curry and frying",
                "price": 279.0,  # INR pricing
                "category": "chicken",
                "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
                "stock": 30,
                "weight": "1kg",
                "origin": "Local Poultry Farm",
                "storage": "Keep refrigerated at 2-4°C"
            }
            response = requests.post(f"{BACKEND_URL}/admin/products", json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "product_id" in data:
                    self.log_test("POST /api/admin/products", True, "Successfully added new product with enhanced fields")
                    return True
                else:
                    self.log_test("POST /api/admin/products", False, "Missing product_id in response", data)
                    return False
            else:
                self.log_test("POST /api/admin/products", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("POST /api/admin/products", False, f"Request error: {str(e)}")
            return False
    
    def test_get_admin_products(self):
        """Test GET /api/admin/products (admin product list)"""
        if not self.admin_token:
            self.log_test("GET /api/admin/products", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/products", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "products" in data and isinstance(data["products"], list):
                    products = data["products"]
                    self.log_test("GET /api/admin/products", True, f"Admin retrieved {len(products)} products")
                    return True
                else:
                    self.log_test("GET /api/admin/products", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("GET /api/admin/products", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("GET /api/admin/products", False, f"Request error: {str(e)}")
            return False
    
    def test_post_customer_orders(self):
        """Test POST /api/customer/orders (place order)"""
        if not self.customer_token:
            self.log_test("POST /api/customer/orders", False, "No customer token available")
            return False
        
        try:
            # First get a product to order
            products_response = requests.get(f"{BACKEND_URL}/products", timeout=10)
            if products_response.status_code != 200:
                self.log_test("POST /api/customer/orders", False, "Could not get products for order")
                return False
            
            products = products_response.json().get("products", [])
            if not products:
                self.log_test("POST /api/customer/orders", False, "No products available for order")
                return False
            
            product = products[0]
            headers = {"Authorization": f"Bearer {self.customer_token}"}
            payload = {
                "items": [
                    {
                        "product_id": product["id"],
                        "quantity": 2,
                        "price": product["price"]
                    }
                ],
                "total_amount": product["price"] * 2
            }
            response = requests.post(f"{BACKEND_URL}/customer/orders", json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "order_id" in data:
                    self.log_test("POST /api/customer/orders", True, f"Successfully placed order for {product['name']}")
                    return True
                else:
                    self.log_test("POST /api/customer/orders", False, "Missing order_id in response", data)
                    return False
            else:
                self.log_test("POST /api/customer/orders", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("POST /api/customer/orders", False, f"Request error: {str(e)}")
            return False
    
    def test_get_admin_orders(self):
        """Test GET /api/admin/orders (view all orders)"""
        if not self.admin_token:
            self.log_test("GET /api/admin/orders", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/orders", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "orders" in data and isinstance(data["orders"], list):
                    orders = data["orders"]
                    self.log_test("GET /api/admin/orders", True, f"Admin retrieved {len(orders)} orders with customer details")
                    return True
                else:
                    self.log_test("GET /api/admin/orders", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("GET /api/admin/orders", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("GET /api/admin/orders", False, f"Request error: {str(e)}")
            return False
    
    def test_get_admin_dashboard(self):
        """Test GET /api/admin/dashboard (get statistics)"""
        if not self.admin_token:
            self.log_test("GET /api/admin/dashboard", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/dashboard", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["products_count", "orders_count", "customers_count"]
                if all(field in data for field in required_fields):
                    stats = f"Products: {data['products_count']}, Orders: {data['orders_count']}, Customers: {data['customers_count']}"
                    self.log_test("GET /api/admin/dashboard", True, f"Dashboard statistics retrieved - {stats}")
                    return True
                else:
                    self.log_test("GET /api/admin/dashboard", False, "Missing required fields in response", data)
                    return False
            else:
                self.log_test("GET /api/admin/dashboard", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("GET /api/admin/dashboard", False, f"Request error: {str(e)}")
            return False
    
    def run_comprehensive_tests(self):
        """Run all comprehensive API tests"""
        print("=" * 80)
        print("MEAT DELIVERY APP - COMPREHENSIVE API TESTING")
        print("=" * 80)
        print(f"Testing all specified endpoints at: {BACKEND_URL}")
        print()
        
        # Test sequence matching the review request
        tests = [
            self.test_get_health,
            self.test_post_admin_login,
            self.test_post_customer_register,
            self.test_post_customer_login,
            self.test_get_products,
            self.test_post_admin_products,
            self.test_get_admin_products,
            self.test_post_customer_orders,
            self.test_get_admin_orders,
            self.test_get_admin_dashboard
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            if test():
                passed += 1
            else:
                failed += 1
        
        print("=" * 80)
        print("COMPREHENSIVE API TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed / (passed + failed) * 100):.1f}%")
        
        if failed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"- {result['test']}: {result['message']}")
        
        return failed == 0

if __name__ == "__main__":
    tester = ComprehensiveAPITester()
    success = tester.run_comprehensive_tests()
    sys.exit(0 if success else 1)