#!/usr/bin/env python3
"""
Test script to verify backend setup
"""
import sys
import os

# Add the app directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

def test_imports():
    """Test that all modules can be imported"""
    print("🧪 Testing imports...")
    
    try:
        from app.core.config import settings
        print("✅ Config imported successfully")
        
        from app.core.database import get_db, Base
        print("✅ Database modules imported successfully")
        
        from app.models import User
        print("✅ Models imported successfully")
        
        from app.schemas import UserCreate, UserResponse
        print("✅ Schemas imported successfully")
        
        from app.api.v1.api import api_router
        print("✅ API router imported successfully")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_config():
    """Test configuration"""
    print("\n🧪 Testing configuration...")
    
    try:
        from app.core.config import settings
        
        # Test required settings
        assert hasattr(settings, 'DATABASE_URL'), "DATABASE_URL not found"
        assert hasattr(settings, 'SECRET_KEY'), "SECRET_KEY not found"
        
        print("✅ Configuration loaded successfully")
        print(f"   - Database URL: {settings.DATABASE_URL[:20]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

def test_models():
    """Test model definitions"""
    print("\n🧪 Testing models...")
    
    try:
        from app.models import User
        from app.core.database import Base
        
        # Check that models have required attributes
        user_attrs = ['id', 'name', 'email', 'wallet_address', 'vincent_id']
        for attr in user_attrs:
            assert hasattr(User, attr), f"User missing attribute: {attr}"
        
        print("✅ All models have required attributes")
        return True
        
    except Exception as e:
        print(f"❌ Model error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing DeFi Guardian Agent Backend Setup\n")
    
    tests = [
        test_imports,
        test_config,
        test_models
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend setup is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
