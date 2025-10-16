# DeFi Guardian Agent Backend

FastAPI backend for the DeFi Guardian Agent - an AI-powered cross-chain DeFi monitor that prevents liquidation risks.

## Features

- **User Management**: Secure authentication with wallet-based login
- **Position Discovery**: Automatically discover Aave positions across multiple chains
- **Risk Monitoring**: Real-time health factor monitoring with configurable thresholds
- **Alert System**: Automated alerts when positions approach liquidation
- **Multi-chain Support**: Currently supports Polygon and Arbitrum

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

### Users
- `GET /api/v1/users/me` - Get current user info
- `PUT /api/v1/users/me` - Update current user

### Positions
- `GET /api/v1/positions/` - Get user positions summary
- `GET /api/v1/positions/{id}` - Get specific position
- `POST /api/v1/positions/discover` - Discover new positions
- `PUT /api/v1/positions/{id}` - Update position

### Alerts
- `GET /api/v1/alerts/` - Get user alerts
- `GET /api/v1/alerts/active` - Get active alerts only
- `POST /api/v1/alerts/{id}/resolve` - Resolve alert

## Database Schema

### Users Table
- `id`, `name`, `email`, `wallet_address`, `vincent_id`
- `is_active`, `created_at`, `updated_at`

### Positions Table
- `id`, `user_id`, `chain_id`, `chain_name`, `protocol`
- `collateral_tokens`, `borrowed_tokens`, `collateral_usd`, `borrowed_usd`
- `health_factor`, `ltv`, `position_address`, `last_updated`

### Alerts Table
- `id`, `user_id`, `chain_id`, `chain_name`, `protocol`
- `alert_type`, `severity`, `message`, `health_factor`
- `is_resolved`, `resolved_at`, `created_at`

## Configuration

Key environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing key
- `DEBUG`: Enable debug mode
- `HEALTH_FACTOR_WARNING`: Warning threshold (default: 1.5)
- `HEALTH_FACTOR_DANGER`: Danger threshold (default: 1.25)
- `HEALTH_FACTOR_LIQUIDATION`: Liquidation threshold (default: 1.0)

## Background Tasks

The system includes background monitoring that:

1. **Updates positions** every 2 minutes (configurable)
2. **Checks health factors** and creates alerts
3. **Resolves stale alerts** when positions improve

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
- **Background Tasks**: Async monitoring and alerting

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request
