#!/usr/bin/env python3
"""
Setup script for DeFi Guardian Agent Backend
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return result
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return None

def main():
    """Main setup function"""
    print("🚀 Setting up DeFi Guardian Agent Backend")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        sys.exit(1)
    
    # Check if .env exists
    if not os.path.exists(".env"):
        print("\n⚠️  .env file not found. Please create one from env.example:")
        print("   cp env.example .env")
        print("   # Edit .env with your database URL and settings")
        
        # Ask if user wants to continue
        response = input("\nDo you want to continue anyway? (y/N): ")
        if response.lower() != 'y':
            print("Setup cancelled. Please create .env file first.")
            sys.exit(1)
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Edit .env file with your database URL and settings")
    print("2. Run database migrations: python -c 'from app.core.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)'")
    print("3. Start the server: python run.py")
    print("4. Visit http://localhost:8000/docs for API documentation")

if __name__ == "__main__":
    main()
