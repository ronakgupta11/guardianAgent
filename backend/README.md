# DeFi Guardian Agent Backend

FastAPI backend for the DeFi Guardian Agent - an AI-powered cross-chain DeFi monitor that prevents liquidation risks.

## Features

- **User Management**: Secure authentication with wallet-based login
- **JWT Authentication**: Token-based authentication with Vincent SDK integration

## Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL database
- NeonDB URL (provided by user)

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your database URL and other settings
   ```

5. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

6. **Start the server:**
   ```bash
   python -m app.main
   ```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with wallet address
- `POST /api/v1/auth/verify-token` - Verify JWT token

## Database Schema

### Users Table
- `id`, `name`, `email`, `wallet_address`, `vincent_id`
- `is_active`, `created_at`, `updated_at`

## Configuration

Key environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing key
- `DEBUG`: Enable debug mode
- `ALLOWED_HOSTS`: Comma-separated list of allowed CORS origins

## Development

### Running Tests
```bash
pytest
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Code Style
```bash
black .
isort .
flake8 .
```

## Deployment

1. Set production environment variables
2. Run migrations: `alembic upgrade head`
3. Start with gunicorn: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`

## Architecture

- **FastAPI**: Modern, fast web framework
- **SQLAlchemy**: ORM for database operations
- **Alembic**: Database migrations
- **Pydantic**: Data validation and serialization
- **JWT**: Authentication tokens

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request
