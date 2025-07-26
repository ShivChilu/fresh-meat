#!/usr/bin/env python3
"""
Initialize sample products for the meat delivery app
"""
import os
import sys
sys.path.append('/app/backend')

from pymongo import MongoClient
import uuid
from datetime import datetime

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URL)
db = client.meat_delivery

# Sample products data (Indian meat products like Licious)
sample_products = [
    {
        "id": str(uuid.uuid4()),
        "name": "Fresh Chicken Breast (Boneless)",
        "description": "Premium quality chicken breast, skinless and boneless. Perfect for grilling, pan-frying, or curry preparations.",
        "price": 299.0,
        "category": "chicken",
        "image": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNoaWNrZW58ZW58MHx8fHwxNzUzNTA2NTYwfDA&ixlib=rb-4.1.0&q=85",
        "stock": 50,
        "created_at": datetime.utcnow(),
        "weight": "500g",
        "origin": "Farm Fresh",
        "storage": "Keep refrigerated"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Mutton Curry Cut (Goat)",
        "description": "Fresh goat meat cut into medium pieces, ideal for traditional Indian curry preparations. Tender and flavorful.",
        "price": 699.0,
        "category": "mutton",
        "image": "https://images.unsplash.com/photo-1690983321750-ad6f6d59a84b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxyYXclMjBtZWF0fGVufDB8fHx8MTc1MzUwNjU3NHww&ixlib=rb-4.1.0&q=85",
        "stock": 30,
        "created_at": datetime.utcnow(),
        "weight": "500g",
        "origin": "Local Farm",
        "storage": "Keep refrigerated"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Fresh Chicken Whole (Skinless)",
        "description": "Farm-fresh whole chicken, cleaned and skinless. Perfect for roasting or making stock.",
        "price": 249.0,
        "category": "chicken",
        "image": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNoaWNrZW58ZW58MHx8fHwxNzUzNTA2NTYwfDA&ixlib=rb-4.1.0&q=85",
        "stock": 25,
        "created_at": datetime.utcnow(),
        "weight": "1kg",
        "origin": "Farm Fresh",
        "storage": "Keep refrigerated"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Fresh Pomfret Fish",
        "description": "Fresh pomfret fish, cleaned and ready to cook. Perfect for frying or steaming with minimal bones.",
        "price": 549.0,
        "category": "fish",
        "image": "https://images.unsplash.com/photo-1563557908-b7787229f123?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxmcmVzaCUyMGZpc2h8ZW58MHx8fHwxNzUzNTA2NTgxfDA&ixlib=rb-4.1.0&q=85",
        "stock": 20,
        "created_at": datetime.utcnow(),
        "weight": "500g",
        "origin": "Fresh Catch",
        "storage": "Keep refrigerated"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Fresh Prawns (Large)",
        "description": "Large fresh prawns, deveined and cleaned. Perfect for curries, biryani, or grilling.",
        "price": 899.0,
        "category": "seafood",
        "image": "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZpc2h8ZW58MHx8fHwxNzUzNTA2NTgxfDA&ixlib=rb-4.1.0&q=85",
        "stock": 15,
        "created_at": datetime.utcnow(),
        "weight": "500g",
        "origin": "Fresh Catch",
        "storage": "Keep refrigerated"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Chicken Drumsticks",
        "description": "Fresh chicken drumsticks, perfect for tandoori, BBQ, or curry preparations. Juicy and tender.",
        "price": 199.0,
        "category": "chicken",
        "image": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNoaWNrZW58ZW58MHx8fHwxNzUzNTA2NTYwfDA&ixlib=rb-4.1.0&q=85",
        "stock": 40,
        "created_at": datetime.utcnow(),
        "weight": "500g",
        "origin": "Farm Fresh",
        "storage": "Keep refrigerated"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Mutton Keema (Minced Goat)",
        "description": "Fresh minced goat meat, perfect for keema curry, kebabs, or stuffing. Finely minced and fresh.",
        "price": 649.0,
        "category": "mutton",
        "image": "https://images.unsplash.com/photo-1690983323238-0b91789e1b5a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxyYXclMjBtZWF0fGVufDB8fHx8MTc1MzUwNjU3NHww&ixlib=rb-4.1.0&q=85",
        "stock": 35,
        "created_at": datetime.utcnow(),
        "weight": "500g",
        "origin": "Local Farm",
        "storage": "Keep refrigerated"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Fresh Eggs (Farm Fresh)",
        "description": "Farm fresh brown eggs, rich in protein and nutrients. Perfect for daily consumption.",
        "price": 89.0,
        "category": "eggs",
        "image": "https://images.unsplash.com/photo-1563557908-b7787229f123?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxmcmVzaCUyMGZpc2h8ZW58MHx8fHwxNzUzNTA2NTgxfDA&ixlib=rb-4.1.0&q=85",
        "stock": 100,
        "created_at": datetime.utcnow(),
        "weight": "12 pieces",
        "origin": "Farm Fresh",
        "storage": "Keep refrigerated"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Fresh Rohu Fish Cut",
        "description": "Fresh rohu fish cut into medium pieces, perfect for Bengali fish curry or frying.",
        "price": 399.0,
        "category": "fish",
        "image": "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZpc2h8ZW58MHx8fHwxNzUzNTA2NTgxfDA&ixlib=rb-4.1.0&q=85",
        "stock": 25,
        "created_at": datetime.utcnow(),
        "weight": "500g",
        "origin": "Fresh Catch",
        "storage": "Keep refrigerated"
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Chicken Wings",
        "description": "Fresh chicken wings, perfect for parties, BBQ, or as appetizers. Crispy when fried.",
        "price": 179.0,
        "category": "chicken",
        "image": "https://images.unsplash.com/photo-1587593810167-a84920ea0781?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNoaWNrZW58ZW58MHx8fHwxNzUzNTA2NTYwfDA&ixlib=rb-4.1.0&q=85",
        "stock": 60,
        "created_at": datetime.utcnow(),
        "weight": "500g",
        "origin": "Farm Fresh",
        "storage": "Keep refrigerated"
    }
]

def init_products():
    """Initialize sample products in the database"""
    print("Initializing sample products...")
    
    # Clear existing products
    db.products.delete_many({})
    print("Cleared existing products")
    
    # Insert sample products
    result = db.products.insert_many(sample_products)
    print(f"Inserted {len(result.inserted_ids)} products")
    
    # Print product names for verification
    print("\nProducts added:")
    for product in sample_products:
        print(f"- {product['name']} - ₹{product['price']}")
    
    print("\nSample products initialized successfully!")

if __name__ == "__main__":
    init_products()