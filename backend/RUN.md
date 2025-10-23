# 🚀 How to Run the Backend

## Quick Start

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Activate virtual environment
```bash
# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

### 3. Set up environment variables
```bash
# Copy the example file
cp env.example .env

# Edit .env with your database URL
# DATABASE_URL=postgresql://username:password@host:port/database
```

### 4. Run database migrations
```bash
alembic upgrade head
```

### 5. Start the server
```bash
# Option 1: Using run.py (recommended)
python run.py

# Option 2: Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Option 3: Using Python module
python -m app.main
```

## Server URLs

Once running, the backend will be available at:
- **API Base**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Root**: http://localhost:8000/

## Available Endpoints

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login with wallet address
- `POST /api/v1/auth/verify-token` - Verify JWT token

## Testing the Backend

### 1. Register a user
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

### 3. Verify token
```bash
curl -X POST "http://localhost:8000/api/v1/auth/verify-token" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Database Connection Error
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify credentials and network access

### Port Already in Use
```bash
# Use a different port
uvicorn app.main:app --port 8001
```

### Import Errors
```bash
# Reinstall dependencies
pip install -r requirements.txt

# Test setup
python test_setup.py
```

### CORS Errors
- Add your frontend URL to `ALLOWED_HOSTS` in `.env`
- Example: `ALLOWED_HOSTS=http://localhost:3000,http://127.0.0.1:3000`

## Environment Variables

Required variables in `.env`:
```bash
DATABASE_URL=postgresql://username:password@host:port/database
SECRET_KEY=your-secret-key-change-in-production
DEBUG=true
ALLOWED_HOSTS=http://localhost:3000,http://127.0.0.1:3000
```

## Production Deployment

For production:
```bash
# Use gunicorn with uvicorn workers
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

Don't forget to:
- Set `DEBUG=false`
- Use a strong `SECRET_KEY`
- Configure proper CORS origins
