from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn
import os
from datetime import datetime
import uuid

# Environment variables
PORT = int(os.getenv("PORT", 8001))
HOST = os.getenv("HOST", "0.0.0.0")

# FastAPI app initialization
app = FastAPI(
    title="Product Service",
    description="Product management microservice",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure appropriately for production
)

# Pydantic models
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: float = Field(..., gt=0)
    category: Optional[str] = Field(None, max_length=50)
    stock: int = Field(..., ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, max_length=50)
    stock: Optional[int] = Field(None, ge=0)

class Product(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class HealthResponse(BaseModel):
    service: str
    status: str
    timestamp: datetime
    version: str

# In-memory storage (replace with database in production)
products_db = {}

# Seed initial products
def seed_products():
    """Initialize database with sample products"""
    initial_products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Laptop Dell XPS 15",
            "description": "High-performance laptop with 16GB RAM and 512GB SSD",
            "price": 1499.99,
            "category": "Electronics",
            "stock": 25,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "iPhone 14 Pro",
            "description": "Latest Apple smartphone with advanced camera system",
            "price": 999.99,
            "category": "Electronics",
            "stock": 50,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Nike Air Max 2023",
            "description": "Comfortable running shoes with air cushioning",
            "price": 179.99,
            "category": "Footwear",
            "stock": 100,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Samsung 4K Smart TV 55\"",
            "description": "Ultra HD Smart TV with HDR support",
            "price": 799.99,
            "category": "Electronics",
            "stock": 15,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Coffee Maker Pro",
            "description": "Automatic espresso machine with milk frother",
            "price": 249.99,
            "category": "Home Appliances",
            "stock": 40,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]

    for product in initial_products:
        products_db[product["id"]] = product

    print(f"✅ Seeded {len(initial_products)} products")

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        service="product-service",
        status="healthy",
        timestamp=datetime.now(),
        version="1.0.0"
    )

# Product endpoints
@app.get("/api/products", response_model=List[Product])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None
):
    """Get all products with optional pagination and filtering"""
    products = list(products_db.values())

    if category:
        products = [p for p in products if p.get("category") == category]

    return products[skip: skip + limit]

@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    """Get a specific product by ID"""
    if product_id not in products_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return products_db[product_id]

@app.post("/api/products", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(product_data: ProductCreate):
    """Create a new product"""
    product_id = str(uuid.uuid4())
    now = datetime.now()

    product = {
        "id": product_id,
        "name": product_data.name,
        "description": product_data.description,
        "price": product_data.price,
        "category": product_data.category,
        "stock": product_data.stock,
        "created_at": now,
        "updated_at": now
    }

    products_db[product_id] = product
    return product

@app.put("/api/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_data: ProductUpdate):
    """Update an existing product"""
    if product_id not in products_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    product = products_db[product_id]
    update_data = product_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        product[field] = value

    product["updated_at"] = datetime.now()
    products_db[product_id] = product

    return product

@app.delete("/api/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    """Delete a product"""
    if product_id not in products_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    del products_db[product_id]

@app.get("/api/products/category/{category}", response_model=List[Product])
async def get_products_by_category(category: str):
    """Get products by category"""
    products = [p for p in products_db.values() if p.get("category") == category]
    return products

@app.patch("/api/products/{product_id}/stock")
async def update_product_stock(product_id: str, quantity: int):
    """Update product stock (for inventory management)"""
    if product_id not in products_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    product = products_db[product_id]
    new_stock = product["stock"] + quantity

    if new_stock < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )

    product["stock"] = new_stock
    product["updated_at"] = datetime.now()
    products_db[product_id] = product

    return {"message": "Stock updated successfully", "new_stock": new_stock}

# Exception handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=str(exc)
    )

@app.on_event("startup")
async def startup_event():
    """Initialize data on startup"""
    seed_products()

if __name__ == "__main__":
    print(f"🚀 Starting Product Service on {HOST}:{PORT}")
    print(f"📍 Health check: http://localhost:{PORT}/health")
    print(f"📍 API Base: http://localhost:{PORT}/api/products")
    print(f"📚 API documentation: http://localhost:{PORT}/docs")
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )