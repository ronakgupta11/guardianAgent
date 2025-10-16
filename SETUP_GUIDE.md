# 🚀 DeFi Guardian Agent - Complete Setup Guide

## Quick Start (5 minutes)

### 1. Backend Setup

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

**Edit `.env` file with your settings:**
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

**Initialize database:**
```bash
python init_db.py
```

**Start backend server:**
```bash
python run.py
```

Backend will be available at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
pnpm install
```

**Create environment file:**
```bash
# Create .env.local file
touch .env.local
```

**Edit `.env.local` file:**
```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Vincent/Lit Protocol Configuration (optional for now)
NEXT_PUBLIC_APP_ID=your-app-id-here
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_EXPECTED_AUDIENCE=http://localhost:3000
NEXT_PUBLIC_IS_DEVELOPMENT=true
```

**Start frontend server:**
```bash
npm run dev
# or
pnpm dev
```

Frontend will be available at: `http://localhost:3000`

## 🎯 Testing the Complete Flow

### 1. Landing Page
- Visit `http://localhost:3000`
- You should see the GuardianAgent landing page
- Click "Get Started" button

### 2. Login/Registration
- You'll be redirected to `/login`
- Connect your wallet (MetaMask, WalletConnect, etc.)
- Enter your name and email
- Connect with Vincent (optional)
- You'll be redirected to the dashboard

### 3. Dashboard
- Protected route that requires authentication
- Shows your DeFi positions (mock data for now)
- Real-time health factor monitoring

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Error:**
```bash
# Check your DATABASE_URL in .env
# Ensure PostgreSQL is running
# Verify credentials and network access
```

**Port Already in Use:**
```bash
# Change port in run.py or use:
uvicorn app.main:app --port 8001
```

**Import Errors:**
```bash
# Run setup test:
python test_setup.py
```

### Frontend Issues

**Backend Not Running:**
- The app will show a "Backend Server Offline" message
- Start the backend server first
- Check the backend URL in `.env.local`

**localStorage Errors:**
- These are normal during SSR
- The app handles them automatically

**CORS Errors:**
- Add your frontend URL to `ALLOWED_HOSTS` in backend `.env`
- Restart the backend server

### Common Solutions

1. **Both servers running?**
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

2. **Environment variables set?**
   - Backend: `.env` file
   - Frontend: `.env.local` file

3. **Database connected?**
   - Check your NeonDB URL
   - Run `python init_db.py`

## 🎉 Success Indicators

✅ Backend health check: `http://localhost:8000/health` returns `{"status": "healthy"}`

✅ Frontend loads without errors at `http://localhost:3000`

✅ Landing page shows with "Get Started" button

✅ Login flow works: Wallet → Details → Vincent → Dashboard

✅ Dashboard shows protected content

## 🚀 Next Steps

1. **Configure your NeonDB URL** in backend `.env`
2. **Test the complete authentication flow**
3. **Customize branding and styling**
4. **Add your Vincent/Lit Protocol credentials**
5. **Deploy to production when ready**

## 📞 Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify both servers are running
3. Check environment variables
4. Test backend health endpoint
5. Review the setup steps above

The app is designed to be robust and will show helpful error messages if something is misconfigured!
