#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Meat Delivery App
Tests all backend functionality including authentication, product management, and orders
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://6d905b01-de00-4c97-bf80-bafb04707101.preview.emergentagent.com/api"

class MeatDeliveryAPITester:
    def __init__(self):
        self.admin_token = None
        self.customer_token = None
        self.customer_id = None
        self.product_id = None
        self.order_id = None
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
    
    def test_health_check(self):
        """Test API health endpoint"""
        try:
            response = requests.get(f"{BACKEND_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Health Check", True, f"API is healthy: {data.get('message', '')}")
                return True
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials (shiv/123)"""
        try:
            payload = {
                "username": "shiv",
                "password": "123"
            }
            response = requests.post(f"{BACKEND_URL}/admin/login", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and data.get("role") == "admin":
                    self.admin_token = data["access_token"]
                    self.log_test("Admin Login (Correct Credentials)", True, "Successfully logged in as admin")
                    return True
                else:
                    self.log_test("Admin Login (Correct Credentials)", False, "Missing token or role in response", data)
                    return False
            else:
                self.log_test("Admin Login (Correct Credentials)", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Login (Correct Credentials)", False, f"Request error: {str(e)}")
            return False
    
    def test_admin_login_failure(self):
        """Test admin login with wrong credentials"""
        try:
            payload = {
                "username": "shiv",
                "password": "wrong_password"
            }
            response = requests.post(f"{BACKEND_URL}/admin/login", json=payload, timeout=10)
            
            if response.status_code == 401:
                self.log_test("Admin Login (Wrong Credentials)", True, "Correctly rejected invalid credentials")
                return True
            else:
                self.log_test("Admin Login (Wrong Credentials)", False, f"Expected 401, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Admin Login (Wrong Credentials)", False, f"Request error: {str(e)}")
            return False
    
    def test_customer_registration(self):
        """Test customer registration with unique email"""
        try:
            # Use timestamp to ensure unique email
            timestamp = int(datetime.now().timestamp())
            payload = {
                "name": "John Smith",
                "email": f"john.smith.{timestamp}@example.com",
                "password": "securepass123",
                "phone": "+1234567890"
            }
            response = requests.post(f"{BACKEND_URL}/customer/register", json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and data.get("role") == "customer":
                    self.customer_token = data["access_token"]
                    self.log_test("Customer Registration (Unique Email)", True, "Successfully registered new customer")
                    return True
                else:
                    self.log_test("Customer Registration (Unique Email)", False, "Missing token or role in response", data)
                    return False
            else:
                self.log_test("Customer Registration (Unique Email)", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Customer Registration (Unique Email)", False, f"Request error: {str(e)}")
            return False
    
    def test_customer_registration_duplicate(self):
        """Test customer registration with duplicate email"""
        try:
            payload = {
                "name": "Jane Doe",
                "email": "duplicate@example.com",
                "password": "password123",
                "phone": "+1987654321"
            }
            
            # First registration
            response1 = requests.post(f"{BACKEND_URL}/customer/register", json=payload, timeout=10)
            
            # Second registration with same email
            response2 = requests.post(f"{BACKEND_URL}/customer/register", json=payload, timeout=10)
            
            if response2.status_code == 400:
                self.log_test("Customer Registration (Duplicate Email)", True, "Correctly rejected duplicate email")
                return True
            else:
                self.log_test("Customer Registration (Duplicate Email)", False, f"Expected 400, got {response2.status_code}")
                return False
        except Exception as e:
            self.log_test("Customer Registration (Duplicate Email)", False, f"Request error: {str(e)}")
            return False
    
    def test_customer_login_success(self):
        """Test customer login with correct credentials"""
        try:
            # First register a customer
            timestamp = int(datetime.now().timestamp())
            email = f"login.test.{timestamp}@example.com"
            password = "testpass123"
            
            register_payload = {
                "name": "Login Test User",
                "email": email,
                "password": password,
                "phone": "+1555000123"
            }
            requests.post(f"{BACKEND_URL}/customer/register", json=register_payload, timeout=10)
            
            # Now test login
            login_payload = {
                "email": email,
                "password": password
            }
            response = requests.post(f"{BACKEND_URL}/customer/login", json=login_payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and data.get("role") == "customer":
                    self.log_test("Customer Login (Correct Credentials)", True, "Successfully logged in as customer")
                    return True
                else:
                    self.log_test("Customer Login (Correct Credentials)", False, "Missing token or role in response", data)
                    return False
            else:
                self.log_test("Customer Login (Correct Credentials)", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Customer Login (Correct Credentials)", False, f"Request error: {str(e)}")
            return False
    
    def test_customer_login_failure(self):
        """Test customer login with wrong credentials"""
        try:
            payload = {
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }
            response = requests.post(f"{BACKEND_URL}/customer/login", json=payload, timeout=10)
            
            if response.status_code == 401:
                self.log_test("Customer Login (Wrong Credentials)", True, "Correctly rejected invalid credentials")
                return True
            else:
                self.log_test("Customer Login (Wrong Credentials)", False, f"Expected 401, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Customer Login (Wrong Credentials)", False, f"Request error: {str(e)}")
            return False
    
    def test_add_product(self):
        """Test admin adding products"""
        if not self.admin_token:
            self.log_test("Add Product", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            payload = {
                "name": "Premium Beef Steak",
                "description": "High-quality ribeye steak, perfect for grilling",
                "price": 29.99,
                "category": "beef",
                "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
                "stock": 50
            }
            response = requests.post(f"{BACKEND_URL}/admin/products", json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "product_id" in data:
                    self.product_id = data["product_id"]
                    self.log_test("Add Product", True, "Successfully added product")
                    return True
                else:
                    self.log_test("Add Product", False, "Missing product_id in response", data)
                    return False
            else:
                self.log_test("Add Product", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Add Product", False, f"Request error: {str(e)}")
            return False
    
    def test_get_products_customer(self):
        """Test customer viewing product catalog"""
        try:
            response = requests.get(f"{BACKEND_URL}/products", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "products" in data and isinstance(data["products"], list):
                    self.log_test("Get Products (Customer View)", True, f"Retrieved {len(data['products'])} products")
                    return True
                else:
                    self.log_test("Get Products (Customer View)", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Products (Customer View)", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Get Products (Customer View)", False, f"Request error: {str(e)}")
            return False
    
    def test_get_products_admin(self):
        """Test admin viewing all products"""
        if not self.admin_token:
            self.log_test("Get Products (Admin View)", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/products", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "products" in data and isinstance(data["products"], list):
                    self.log_test("Get Products (Admin View)", True, f"Retrieved {len(data['products'])} products")
                    return True
                else:
                    self.log_test("Get Products (Admin View)", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Products (Admin View)", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Products (Admin View)", False, f"Request error: {str(e)}")
            return False
    
    def test_update_product(self):
        """Test admin updating products"""
        if not self.admin_token or not self.product_id:
            self.log_test("Update Product", False, "No admin token or product ID available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            payload = {
                "name": "Premium Beef Steak - Updated",
                "description": "High-quality ribeye steak, perfect for grilling - Now with better marbling",
                "price": 34.99,
                "category": "beef",
                "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
                "stock": 75
            }
            response = requests.put(f"{BACKEND_URL}/admin/products/{self.product_id}", json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                self.log_test("Update Product", True, "Successfully updated product")
                return True
            else:
                self.log_test("Update Product", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Update Product", False, f"Request error: {str(e)}")
            return False
    
    def test_place_order(self):
        """Test customer placing orders"""
        if not self.customer_token or not self.product_id:
            self.log_test("Place Order", False, "No customer token or product ID available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.customer_token}"}
            payload = {
                "items": [
                    {
                        "product_id": self.product_id,
                        "quantity": 2,
                        "price": 34.99
                    }
                ],
                "total_amount": 69.98
            }
            response = requests.post(f"{BACKEND_URL}/customer/orders", json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "order_id" in data:
                    self.order_id = data["order_id"]
                    self.log_test("Place Order", True, "Successfully placed order")
                    return True
                else:
                    self.log_test("Place Order", False, "Missing order_id in response", data)
                    return False
            else:
                self.log_test("Place Order", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Place Order", False, f"Request error: {str(e)}")
            return False
    
    def test_get_orders_admin(self):
        """Test admin viewing all orders"""
        if not self.admin_token:
            self.log_test("Get Orders (Admin View)", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/orders", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "orders" in data and isinstance(data["orders"], list):
                    self.log_test("Get Orders (Admin View)", True, f"Retrieved {len(data['orders'])} orders")
                    return True
                else:
                    self.log_test("Get Orders (Admin View)", False, "Invalid response format", data)
                    return False
            else:
                self.log_test("Get Orders (Admin View)", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Get Orders (Admin View)", False, f"Request error: {str(e)}")
            return False
    
    def test_admin_dashboard(self):
        """Test admin dashboard statistics"""
        if not self.admin_token:
            self.log_test("Admin Dashboard Stats", False, "No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.get(f"{BACKEND_URL}/admin/dashboard", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["products_count", "orders_count", "customers_count"]
                if all(field in data for field in required_fields):
                    stats = f"Products: {data['products_count']}, Orders: {data['orders_count']}, Customers: {data['customers_count']}"
                    self.log_test("Admin Dashboard Stats", True, f"Retrieved dashboard statistics - {stats}")
                    return True
                else:
                    self.log_test("Admin Dashboard Stats", False, "Missing required fields in response", data)
                    return False
            else:
                self.log_test("Admin Dashboard Stats", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Dashboard Stats", False, f"Request error: {str(e)}")
            return False
    
    def test_delete_product(self):
        """Test admin deleting products"""
        if not self.admin_token or not self.product_id:
            self.log_test("Delete Product", False, "No admin token or product ID available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = requests.delete(f"{BACKEND_URL}/admin/products/{self.product_id}", headers=headers, timeout=10)
            
            if response.status_code == 200:
                self.log_test("Delete Product", True, "Successfully deleted product")
                return True
            else:
                self.log_test("Delete Product", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Delete Product", False, f"Request error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 80)
        print("MEAT DELIVERY APP - BACKEND API TESTING")
        print("=" * 80)
        print(f"Testing backend at: {BACKEND_URL}")
        print()
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_admin_login_success,
            self.test_admin_login_failure,
            self.test_customer_registration,
            self.test_customer_registration_duplicate,
            self.test_customer_login_success,
            self.test_customer_login_failure,
            self.test_add_product,
            self.test_get_products_customer,
            self.test_get_products_admin,
            self.test_update_product,
            self.test_place_order,
            self.test_get_orders_admin,
            self.test_admin_dashboard,
            self.test_delete_product
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            if test():
                passed += 1
            else:
                failed += 1
        
        print("=" * 80)
        print("TEST SUMMARY")
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
    tester = MeatDeliveryAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)