#!/usr/bin/env python3
"""
Initialize database with tables
"""
import sys
import os

# Add the app directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import engine
from app.models import Base

def init_database():
    """Create all database tables"""
    print("🔄 Creating database tables...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Show created tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"\n📋 Created tables: {', '.join(tables)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        return False

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
