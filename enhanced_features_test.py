#!/usr/bin/env python3
"""
Enhanced Features Testing for Meat Delivery App
Tests the specific enhanced features mentioned in the review request:
- INR pricing instead of USD
- New product fields (weight, origin, storage)
- Product categories (chicken, mutton, fish, seafood, eggs)
- Sample products with realistic Indian meat products
"""

import requests
import json
import sys

# Get backend URL from environment
BACKEND_URL = "https://6d905b01-de00-4c97-bf80-bafb04707101.preview.emergentagent.com/api"

class EnhancedFeaturesTester:
    def __init__(self):
        self.admin_token = None
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
    
    def get_admin_token(self):
        """Get admin token for authenticated requests"""
        try:
            payload = {"username": "shiv", "password": "123"}
            response = requests.post(f"{BACKEND_URL}/admin/login", json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data["access_token"]
                return True
            return False
        except:
            return False
    
    def test_inr_pricing(self):
        """Test that products use INR pricing (₹) instead of USD"""
        try:
            response = requests.get(f"{BACKEND_URL}/products", timeout=10)
            if response.status_code == 200:
                data = response.json()
                products = data.get("products", [])
                
                if not products:
                    self.log_test("INR Pricing Check", False, "No products found to test pricing")
                    return False
                
                # Check if prices are in INR range (typically higher than USD)
                inr_prices = []
                for product in products:
                    price = product.get("price", 0)
                    inr_prices.append(price)
                
                # INR prices should typically be higher than USD (rough check: > 100 for meat products)
                avg_price = sum(inr_prices) / len(inr_prices)
                if avg_price > 100:  # Reasonable INR price range for meat
                    sample_prices = [f"₹{price}" for price in inr_prices[:3]]
                    self.log_test("INR Pricing Check", True, f"Products use INR pricing. Sample prices: {', '.join(sample_prices)}")
                    return True
                else:
                    self.log_test("INR Pricing Check", False, f"Prices seem too low for INR. Average: {avg_price}")
                    return False
            else:
                self.log_test("INR Pricing Check", False, f"Failed to get products: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("INR Pricing Check", False, f"Request error: {str(e)}")
            return False
    
    def test_enhanced_product_fields(self):
        """Test that products have new fields: weight, origin, storage"""
        try:
            response = requests.get(f"{BACKEND_URL}/products", timeout=10)
            if response.status_code == 200:
                data = response.json()
                products = data.get("products", [])
                
                if not products:
                    self.log_test("Enhanced Product Fields", False, "No products found to test fields")
                    return False
                
                required_fields = ["weight", "origin", "storage"]
                products_with_all_fields = 0
                
                for product in products:
                    has_all_fields = all(field in product and product[field] for field in required_fields)
                    if has_all_fields:
                        products_with_all_fields += 1
                
                if products_with_all_fields > 0:
                    sample_product = next(p for p in products if all(field in p and p[field] for field in required_fields))
                    sample_info = f"Weight: {sample_product['weight']}, Origin: {sample_product['origin']}, Storage: {sample_product['storage']}"
                    self.log_test("Enhanced Product Fields", True, f"{products_with_all_fields}/{len(products)} products have all enhanced fields. Sample: {sample_info}")
                    return True
                else:
                    self.log_test("Enhanced Product Fields", False, "No products found with all enhanced fields (weight, origin, storage)")
                    return False
            else:
                self.log_test("Enhanced Product Fields", False, f"Failed to get products: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Enhanced Product Fields", False, f"Request error: {str(e)}")
            return False
    
    def test_product_categories(self):
        """Test that products have proper categories: chicken, mutton, fish, seafood, eggs"""
        try:
            response = requests.get(f"{BACKEND_URL}/products", timeout=10)
            if response.status_code == 200:
                data = response.json()
                products = data.get("products", [])
                
                if not products:
                    self.log_test("Product Categories", False, "No products found to test categories")
                    return False
                
                expected_categories = ["chicken", "mutton", "fish", "seafood", "eggs"]
                found_categories = set()
                
                for product in products:
                    category = product.get("category", "").lower()
                    if category in expected_categories:
                        found_categories.add(category)
                
                if len(found_categories) >= 3:  # At least 3 different categories
                    self.log_test("Product Categories", True, f"Found {len(found_categories)} valid categories: {', '.join(sorted(found_categories))}")
                    return True
                else:
                    self.log_test("Product Categories", False, f"Only found {len(found_categories)} categories: {', '.join(sorted(found_categories))}. Expected at least 3 from: {', '.join(expected_categories)}")
                    return False
            else:
                self.log_test("Product Categories", False, f"Failed to get products: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Product Categories", False, f"Request error: {str(e)}")
            return False
    
    def test_indian_meat_products(self):
        """Test that sample products include realistic Indian meat items"""
        try:
            response = requests.get(f"{BACKEND_URL}/products", timeout=10)
            if response.status_code == 200:
                data = response.json()
                products = data.get("products", [])
                
                if not products:
                    self.log_test("Indian Meat Products", False, "No products found to test")
                    return False
                
                # Keywords that indicate Indian meat products
                indian_keywords = [
                    "chicken", "mutton", "goat", "fish", "prawns", "pomfret", 
                    "curry cut", "boneless", "fresh", "farm", "catch"
                ]
                
                indian_products = []
                for product in products:
                    name = product.get("name", "").lower()
                    if any(keyword in name for keyword in indian_keywords):
                        indian_products.append(product["name"])
                
                if len(indian_products) >= 5:  # At least 5 Indian meat products
                    sample_names = indian_products[:3]
                    self.log_test("Indian Meat Products", True, f"Found {len(indian_products)} Indian meat products. Sample: {', '.join(sample_names)}")
                    return True
                else:
                    self.log_test("Indian Meat Products", False, f"Only found {len(indian_products)} Indian meat products. Expected at least 5")
                    return False
            else:
                self.log_test("Indian Meat Products", False, f"Failed to get products: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Indian Meat Products", False, f"Request error: {str(e)}")
            return False
    
    def test_sample_products_count(self):
        """Test that there are 10 sample products as mentioned in review request"""
        try:
            response = requests.get(f"{BACKEND_URL}/products", timeout=10)
            if response.status_code == 200:
                data = response.json()
                products = data.get("products", [])
                
                if len(products) >= 10:
                    self.log_test("Sample Products Count", True, f"Found {len(products)} products (expected at least 10)")
                    return True
                else:
                    self.log_test("Sample Products Count", False, f"Only found {len(products)} products, expected at least 10")
                    return False
            else:
                self.log_test("Sample Products Count", False, f"Failed to get products: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Sample Products Count", False, f"Request error: {str(e)}")
            return False
    
    def test_add_product_with_enhanced_fields(self):
        """Test adding a new product with all enhanced fields"""
        if not self.admin_token:
            if not self.get_admin_token():
                self.log_test("Add Product with Enhanced Fields", False, "Could not get admin token")
                return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            payload = {
                "name": "Fresh Chicken Tikka Cut",
                "description": "Premium chicken pieces perfect for tikka and grilling",
                "price": 349.0,  # INR pricing
                "category": "chicken",
                "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
                "stock": 25,
                "weight": "750g",  # Enhanced field
                "origin": "Local Poultry Farm",  # Enhanced field
                "storage": "Keep refrigerated at 2-4°C"  # Enhanced field
            }
            response = requests.post(f"{BACKEND_URL}/admin/products", json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "product_id" in data:
                    self.log_test("Add Product with Enhanced Fields", True, "Successfully added product with all enhanced fields (weight, origin, storage)")
                    return True
                else:
                    self.log_test("Add Product with Enhanced Fields", False, "Missing product_id in response", data)
                    return False
            else:
                self.log_test("Add Product with Enhanced Fields", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Add Product with Enhanced Fields", False, f"Request error: {str(e)}")
            return False
    
    def run_enhanced_tests(self):
        """Run all enhanced feature tests"""
        print("=" * 80)
        print("MEAT DELIVERY APP - ENHANCED FEATURES TESTING")
        print("=" * 80)
        print(f"Testing enhanced features at: {BACKEND_URL}")
        print()
        
        # Test sequence for enhanced features
        tests = [
            self.test_sample_products_count,
            self.test_inr_pricing,
            self.test_enhanced_product_fields,
            self.test_product_categories,
            self.test_indian_meat_products,
            self.test_add_product_with_enhanced_fields
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            if test():
                passed += 1
            else:
                failed += 1
        
        print("=" * 80)
        print("ENHANCED FEATURES TEST SUMMARY")
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
    tester = EnhancedFeaturesTester()
    success = tester.run_enhanced_tests()
    sys.exit(0 if success else 1)