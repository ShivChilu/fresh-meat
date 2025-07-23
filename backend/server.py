from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
import os
import jwt
import bcrypt
from datetime import datetime, timedelta
import uuid
from typing import Optional, List
import base64

# Initialize FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URL)
db = client.meat_delivery

# JWT configuration
JWT_SECRET = "your_secret_key_here_change_in_production"
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

# Pydantic models
class AdminLogin(BaseModel):
    username: str
    password: str

class CustomerRegister(BaseModel):
    name: str
    email: str
    password: str
    phone: str

class CustomerLogin(BaseModel):
    email: str
    password: str

class Product(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    price: float
    category: str
    image: str  # base64 encoded image
    stock: int

class OrderItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class Order(BaseModel):
    id: Optional[str] = None
    customer_id: str
    items: List[OrderItem]
    total_amount: float
    status: str = "pending"
    created_at: Optional[datetime] = None

# JWT token functions
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Initialize admin user
def init_admin():
    admin_collection = db.admins
    existing_admin = admin_collection.find_one({"username": "shiv"})
    if not existing_admin:
        hashed_password = bcrypt.hashpw("123".encode('utf-8'), bcrypt.gensalt())
        admin_collection.insert_one({
            "id": str(uuid.uuid4()),
            "username": "shiv",
            "password": hashed_password,
            "created_at": datetime.utcnow()
        })

# Initialize admin on startup
init_admin()

# Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Meat Delivery API is running"}

# Admin routes
@app.post("/api/admin/login")
async def admin_login(login_data: AdminLogin):
    admin_collection = db.admins
    admin = admin_collection.find_one({"username": login_data.username})
    
    if not admin or not bcrypt.checkpw(login_data.password.encode('utf-8'), admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"user_id": admin["id"], "role": "admin"})
    return {"access_token": token, "token_type": "bearer", "role": "admin"}

@app.get("/api/admin/dashboard")
async def admin_dashboard(current_user: dict = Depends(verify_token)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    products_count = db.products.count_documents({})
    orders_count = db.orders.count_documents({})
    customers_count = db.customers.count_documents({})
    
    return {
        "products_count": products_count,
        "orders_count": orders_count,
        "customers_count": customers_count
    }

@app.post("/api/admin/products")
async def add_product(product: Product, current_user: dict = Depends(verify_token)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    product_dict = product.dict()
    product_dict["id"] = str(uuid.uuid4())
    product_dict["created_at"] = datetime.utcnow()
    
    db.products.insert_one(product_dict)
    return {"message": "Product added successfully", "product_id": product_dict["id"]}

@app.get("/api/admin/products")
async def get_all_products_admin(current_user: dict = Depends(verify_token)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    products = list(db.products.find({}, {"_id": 0}))
    return {"products": products}

@app.put("/api/admin/products/{product_id}")
async def update_product(product_id: str, product: Product, current_user: dict = Depends(verify_token)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    product_dict = product.dict()
    product_dict["updated_at"] = datetime.utcnow()
    
    result = db.products.update_one({"id": product_id}, {"$set": product_dict})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product updated successfully"}

@app.delete("/api/admin/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(verify_token)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

@app.get("/api/admin/orders")
async def get_all_orders(current_user: dict = Depends(verify_token)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    orders = list(db.orders.find({}, {"_id": 0}))
    
    # Get customer details for each order
    for order in orders:
        customer = db.customers.find_one({"id": order["customer_id"]}, {"_id": 0, "name": 1, "email": 1, "phone": 1})
        order["customer"] = customer
    
    return {"orders": orders}

# Customer routes
@app.post("/api/customer/register")
async def customer_register(customer_data: CustomerRegister):
    # Check if customer already exists
    existing_customer = db.customers.find_one({"email": customer_data.email})
    if existing_customer:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = bcrypt.hashpw(customer_data.password.encode('utf-8'), bcrypt.gensalt())
    
    # Create customer
    customer_dict = customer_data.dict()
    customer_dict["id"] = str(uuid.uuid4())
    customer_dict["password"] = hashed_password
    customer_dict["created_at"] = datetime.utcnow()
    
    db.customers.insert_one(customer_dict)
    
    token = create_access_token({"user_id": customer_dict["id"], "role": "customer"})
    return {"access_token": token, "token_type": "bearer", "role": "customer", "message": "Registration successful"}

@app.post("/api/customer/login")
async def customer_login(login_data: CustomerLogin):
    customer = db.customers.find_one({"email": login_data.email})
    
    if not customer or not bcrypt.checkpw(login_data.password.encode('utf-8'), customer["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"user_id": customer["id"], "role": "customer"})
    return {"access_token": token, "token_type": "bearer", "role": "customer", "customer_name": customer["name"]}

@app.get("/api/products")
async def get_products():
    products = list(db.products.find({}, {"_id": 0}))
    return {"products": products}

@app.post("/api/customer/orders")
async def place_order(order: Order, current_user: dict = Depends(verify_token)):
    if current_user.get("role") != "customer":
        raise HTTPException(status_code=403, detail="Customer access required")
    
    order_dict = order.dict()
    order_dict["id"] = str(uuid.uuid4())
    order_dict["customer_id"] = current_user["user_id"]
    order_dict["created_at"] = datetime.utcnow()
    order_dict["status"] = "pending"
    
    db.orders.insert_one(order_dict)
    return {"message": "Order placed successfully", "order_id": order_dict["id"]}

@app.get("/api/customer/orders")
async def get_customer_orders(current_user: dict = Depends(verify_token)):
    if current_user.get("role") != "customer":
        raise HTTPException(status_code=403, detail="Customer access required")
    
    orders = list(db.orders.find({"customer_id": current_user["user_id"]}, {"_id": 0}))
    return {"orders": orders}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)