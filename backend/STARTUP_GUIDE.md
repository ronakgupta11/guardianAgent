# 🚀 DeFi Guardian Agent Backend - Startup Guide

## Quick Start (5 minutes)

### 1. Prerequisites
- Python 3.8+ installed
- PostgreSQL database (NeonDB URL provided by user)
- Basic terminal knowledge

### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp env.example .env
```

### 3. Configure Environment

Edit `.env` file with your settings:

```bash
# Database (REQUIRED - replace with your NeonDB URL)
DATABASE_URL=postgresql://username:password@host:port/database

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=true
ENVIRONMENT=development

# CORS (add your frontend URL)
ALLOWED_HOSTS=http://localhost:3000,http://127.0.0.1:3000
```

### 4. Initialize Database

```bash
# Create database tables
python init_db.py

# Or run the test to verify setup
python test_setup.py
```

### 5. Start the Server

```bash
# Development server
python run.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Verify Installation

- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health
- Root Endpoint: http://localhost:8000/

## API Endpoints Overview

### Authentication
```
POST /api/v1/auth/register    # Register new user
POST /api/v1/auth/login       # Login with wallet
POST /api/v1/auth/verify-token # Verify JWT token
```

## Testing the API

### 1. Register a User
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "wallet_address": "0x1234567890123456789012345678901234567890"
  }'
```

### 2. Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_address": "0x1234567890123456789012345678901234567890"
  }'
```

### 3. Get User Info (with JWT token)
```bash
curl -X GET "http://localhost:8000/api/v1/auth/verify-token" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend Integration

Update your frontend `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

The frontend `useBackend` hook should work with the new API endpoints.

## Database Schema

### Users Table
- `id`, `name`, `email`, `wallet_address`, `vincent_id`
- `is_active`, `created_at`, `updated_at`

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `DATABASE_URL` in `.env`
   - Ensure PostgreSQL is running
   - Verify credentials and network access

2. **Import Errors**
   - Run `python test_setup.py` to verify setup
   - Check Python version (3.8+ required)
   - Reinstall dependencies: `pip install -r requirements.txt`

3. **Port Already in Use**
   - Change port in `run.py` or use: `uvicorn app.main:app --port 8001`

4. **CORS Errors**
   - Add your frontend URL to `ALLOWED_HOSTS` in `.env`

### Getting Help

1. Check the logs for detailed error messages
2. Run `python test_setup.py` to verify setup
3. Check API documentation at `/docs`
4. Verify database connection and tables

## Next Steps

1. **Configure your NeonDB URL** in `.env`
2. **Test the API** using the examples above
3. **Update frontend** to use new endpoints
4. **Deploy to production** when ready

## Production Deployment

For production deployment:

1. Set `DEBUG=false` in environment
2. Use a strong `SECRET_KEY`
3. Configure proper CORS origins
4. Use a production WSGI server like Gunicorn
5. Set up proper logging and monitoring

```bash
# Production server example
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
