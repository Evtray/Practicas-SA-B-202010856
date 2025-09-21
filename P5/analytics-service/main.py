from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from datetime import datetime, timedelta
import asyncio
from collections import defaultdict
import graphene
from graphene import ObjectType, String, Int, Float, List as GrapheneList, Field, Schema, Mutation
from graphql import graphql_sync
import json

# Environment variables
PORT = int(os.getenv("PORT", 3004))
HOST = os.getenv("HOST", "0.0.0.0")

# Service URLs
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:3001")
ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "http://localhost:3003")
PRODUCT_SERVICE_URL = os.getenv("PRODUCT_SERVICE_URL", "http://localhost:8001")

# In-memory analytics data
sample_analytics_data = {
    "sales_reports": [
        {
            "id": "report1",
            "period": "2023-Q4",
            "start_date": "2023-10-01",
            "end_date": "2023-12-31",
            "total_revenue": 145000.50,
            "total_orders": 1250,
            "average_order_value": 116.00,
            "generated_at": datetime.now().isoformat()
        },
        {
            "id": "report2",
            "period": "2023-Q3",
            "start_date": "2023-07-01",
            "end_date": "2023-09-30",
            "total_revenue": 132000.25,
            "total_orders": 1180,
            "average_order_value": 111.86,
            "generated_at": datetime.now().isoformat()
        }
    ],
    "product_stats": [
        {
            "product_id": "prod1",
            "product_name": "Laptop Pro",
            "category": "Electronics",
            "total_sold": 450,
            "total_revenue": 67500.00,
            "average_rating": 4.5,
            "views": 12500,
            "conversion_rate": 3.6
        },
        {
            "product_id": "prod2",
            "product_name": "Wireless Headphones",
            "category": "Audio",
            "total_sold": 890,
            "total_revenue": 44500.00,
            "average_rating": 4.2,
            "views": 8900,
            "conversion_rate": 10.0
        },
        {
            "product_id": "prod3",
            "product_name": "Gaming Mouse",
            "category": "Gaming",
            "total_sold": 320,
            "total_revenue": 8000.00,
            "average_rating": 4.7,
            "views": 5600,
            "conversion_rate": 5.7
        }
    ],
    "user_statistics": [
        {
            "user_id": "user1",
            "username": "john_doe",
            "total_orders": 15,
            "total_spent": 2340.50,
            "average_order_value": 156.03,
            "first_order_date": "2023-01-15",
            "last_order_date": "2023-12-20",
            "favorite_category": "Electronics",
            "status": "premium"
        },
        {
            "user_id": "user2",
            "username": "jane_smith",
            "total_orders": 8,
            "total_spent": 890.25,
            "average_order_value": 111.28,
            "first_order_date": "2023-03-10",
            "last_order_date": "2023-11-30",
            "favorite_category": "Fashion",
            "status": "regular"
        }
    ],
    "revenue_by_category": [
        {"category": "Electronics", "revenue": 95000.00, "percentage": 65.5},
        {"category": "Fashion", "revenue": 25000.50, "percentage": 17.2},
        {"category": "Home & Garden", "revenue": 15000.75, "percentage": 10.3},
        {"category": "Sports", "revenue": 7500.25, "percentage": 5.2},
        {"category": "Books", "revenue": 2499.00, "percentage": 1.8}
    ]
}

# GraphQL Types
class SalesReport(ObjectType):
    id = String()
    period = String()
    start_date = String()
    end_date = String()
    total_revenue = Float()
    total_orders = Int()
    average_order_value = Float()
    generated_at = String()

class ProductStats(ObjectType):
    product_id = String()
    product_name = String()
    category = String()
    total_sold = Int()
    total_revenue = Float()
    average_rating = Float()
    views = Int()
    conversion_rate = Float()

class UserStatistics(ObjectType):
    user_id = String()
    username = String()
    total_orders = Int()
    total_spent = Float()
    average_order_value = Float()
    first_order_date = String()
    last_order_date = String()
    favorite_category = String()
    status = String()

class CategoryRevenue(ObjectType):
    category = String()
    revenue = Float()
    percentage = Float()

class ReportGenerationResult(ObjectType):
    success = graphene.Boolean()
    report_id = String()
    message = String()
    generated_at = String()

# GraphQL Queries
class Query(ObjectType):
    sales_report = Field(SalesReport, start_date=String(), end_date=String())
    sales_reports = GrapheneList(SalesReport)
    top_products = GrapheneList(ProductStats, limit=Int(default_value=10))
    user_statistics = Field(UserStatistics, user_id=String())
    all_user_statistics = GrapheneList(UserStatistics)
    revenue_by_category = GrapheneList(CategoryRevenue)

    def resolve_sales_report(self, info, start_date=None, end_date=None):
        """Get a specific sales report by date range"""
        try:
            reports = sample_analytics_data["sales_reports"]

            if start_date and end_date:
                # Filter by date range
                for report in reports:
                    if report["start_date"] <= start_date <= report["end_date"]:
                        return SalesReport(**report)
                return None

            # Return the most recent report
            if reports:
                return SalesReport(**reports[0])
            return None
        except Exception as e:
            raise Exception(f"Failed to get sales report: {str(e)}")

    def resolve_sales_reports(self, info):
        """Get all sales reports"""
        try:
            reports = sample_analytics_data["sales_reports"]
            return [SalesReport(**report) for report in reports]
        except Exception as e:
            raise Exception(f"Failed to get sales reports: {str(e)}")

    def resolve_top_products(self, info, limit=10):
        """Get top performing products"""
        try:
            products = sample_analytics_data["product_stats"]
            # Sort by total revenue
            sorted_products = sorted(products, key=lambda x: x["total_revenue"], reverse=True)
            return [ProductStats(**product) for product in sorted_products[:limit]]
        except Exception as e:
            raise Exception(f"Failed to get top products: {str(e)}")

    def resolve_user_statistics(self, info, user_id=None):
        """Get statistics for a specific user"""
        try:
            users = sample_analytics_data["user_statistics"]

            if user_id:
                for user in users:
                    if user["user_id"] == user_id:
                        return UserStatistics(**user)
                return None

            # Return first user if no specific ID provided
            if users:
                return UserStatistics(**users[0])
            return None
        except Exception as e:
            raise Exception(f"Failed to get user statistics: {str(e)}")

    def resolve_all_user_statistics(self, info):
        """Get statistics for all users"""
        try:
            users = sample_analytics_data["user_statistics"]
            return [UserStatistics(**user) for user in users]
        except Exception as e:
            raise Exception(f"Failed to get all user statistics: {str(e)}")

    def resolve_revenue_by_category(self, info):
        """Get revenue breakdown by category"""
        try:
            categories = sample_analytics_data["revenue_by_category"]
            return [CategoryRevenue(**category) for category in categories]
        except Exception as e:
            raise Exception(f"Failed to get revenue by category: {str(e)}")

# GraphQL Mutations
class GenerateReport(Mutation):
    class Arguments:
        report_type = String(required=True)
        start_date = String()
        end_date = String()
        params = String()  # JSON string for additional parameters

    Output = ReportGenerationResult

    def mutate(self, info, report_type, start_date=None, end_date=None, params=None):
        """Generate a new analytics report"""
        try:
            # Parse additional parameters if provided
            additional_params = {}
            if params:
                try:
                    additional_params = json.loads(params)
                except json.JSONDecodeError:
                    return ReportGenerationResult(
                        success=False,
                        report_id=None,
                        message="Invalid JSON in params field",
                        generated_at=datetime.now().isoformat()
                    )

            # Generate report based on type
            report_id = f"report_{report_type}_{int(datetime.now().timestamp())}"

            if report_type == "sales":
                # Generate sales report
                message = f"Sales report generated for period {start_date} to {end_date}"
            elif report_type == "products":
                # Generate product performance report
                message = f"Product performance report generated"
            elif report_type == "users":
                # Generate user analytics report
                message = f"User analytics report generated"
            elif report_type == "revenue":
                # Generate revenue breakdown report
                message = f"Revenue breakdown report generated"
            else:
                return ReportGenerationResult(
                    success=False,
                    report_id=None,
                    message=f"Unknown report type: {report_type}",
                    generated_at=datetime.now().isoformat()
                )

            # Simulate report generation (in real implementation, this would create actual reports)
            return ReportGenerationResult(
                success=True,
                report_id=report_id,
                message=message,
                generated_at=datetime.now().isoformat()
            )

        except Exception as e:
            return ReportGenerationResult(
                success=False,
                report_id=None,
                message=f"Failed to generate report: {str(e)}",
                generated_at=datetime.now().isoformat()
            )

class Mutations(ObjectType):
    generate_report = GenerateReport.Field()

# Create GraphQL schema
schema = Schema(query=Query, mutation=Mutations)

# FastAPI app initialization
app = FastAPI(
    title="Analytics Service",
    description="Analytics and reporting microservice with GraphQL support",
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

# Health check model
class HealthResponse(BaseModel):
    service: str
    status: str
    timestamp: datetime
    version: str

# GraphQL endpoint
@app.post("/graphql")
async def graphql_endpoint(request: Request):
    """GraphQL endpoint"""
    try:
        body = await request.json()
        query = body.get("query")
        variables = body.get("variables", {})

        result = schema.execute(query, variable_values=variables)

        if result.errors:
            return {"errors": [str(error) for error in result.errors]}

        return {"data": result.data}
    except Exception as e:
        return {"errors": [str(e)]}

@app.get("/graphql")
async def graphql_playground():
    """GraphQL Playground interface"""
    return {
        "message": "GraphQL endpoint is available at POST /graphql",
        "playground": "Use a GraphQL client like GraphQL Playground or Insomnia",
        "example_queries": {
            "sales_reports": "query { salesReports { id period totalRevenue totalOrders } }",
            "top_products": "query { topProducts(limit: 5) { productId productName totalRevenue } }",
            "user_statistics": "query { userStatistics(userId: \"user1\") { username totalOrders totalSpent } }",
            "revenue_by_category": "query { revenueByCategory { category revenue percentage } }",
            "generate_report": "mutation { generateReport(reportType: \"sales\", startDate: \"2023-01-01\", endDate: \"2023-12-31\") { success reportId message } }"
        }
    }

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        service="analytics-service",
        status="healthy",
        timestamp=datetime.now(),
        version="1.0.0"
    )

# Legacy REST endpoint for backward compatibility
@app.get("/api/analytics/summary")
async def get_analytics_summary():
    """Get a summary of all analytics data (REST endpoint for backward compatibility)"""
    return {
        "total_reports": len(sample_analytics_data["sales_reports"]),
        "total_products_tracked": len(sample_analytics_data["product_stats"]),
        "total_users_analyzed": len(sample_analytics_data["user_statistics"]),
        "categories_tracked": len(sample_analytics_data["revenue_by_category"]),
        "last_updated": datetime.now().isoformat(),
        "graphql_endpoint": "/graphql"
    }

# Exception handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=str(exc)
    )

if __name__ == "__main__":
    print(f"🚀 Analytics Service (GraphQL) starting on {HOST}:{PORT}")
    print(f"🎮 GraphQL endpoint available at http://{HOST}:{PORT}/graphql")
    print(f"📊 GraphQL Playground available at http://{HOST}:{PORT}/graphql")
    print(f"📚 API documentation available at http://{HOST}:{PORT}/docs")
    print(f"❤️ Health check available at http://{HOST}:{PORT}/health")

    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )