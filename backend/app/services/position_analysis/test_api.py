"""
Test script for API endpoints
Tests the Aave Position Analysis API
"""

import requests
import json

API_URL = "http://localhost:8000"

def test_api():
    """Test the API endpoints"""
    
    print("🧪 Testing Aave Position Analysis API")
    print("=" * 60)
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{API_URL}/health")
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.json()}")
    except Exception as e:
        print(f"  ❌ Error: {e}")
    
    # Test 2: Get supported chains
    print("\n2. Testing get supported chains...")
    try:
        response = requests.get(f"{API_URL}/chains")
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.json()}")
    except Exception as e:
        print(f"  ❌ Error: {e}")
    
    # Test 3: Get positions
    print("\n3. Testing get positions...")
    test_address = "0x956d2bD30169C281b999DB1B5A4d74224e1eb3E2"
    
    try:
        payload = {
            "wallet_address": test_address,
            "chain_ids": ["11155111", "84532"]  # Sepolia and Base Sepolia
        }
        
        response = requests.post(
            f"{API_URL}/positions",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Positions retrieved successfully!")
            print(f"  Total positions: {data['total_positions']}")
            
            # Display positions
            print(f"\n  Positions:")
            for pos in data['positions']:
                print(f"    - {pos['chain_name']}: HF={pos['health_factor']:.2f}")
        else:
            print(f"  ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
    
    # Test 4: Generate actions
    print("\n4. Testing generate actions...")
    
    try:
        payload = {
            "wallet_address": test_address,
            "chain_ids": ["84532"]  # Base Sepolia only
        }
        
        response = requests.post(
            f"{API_URL}/actions",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Actions generated successfully!")
            
            # Display positions with actions
            print(f"\n  Positions with Actions:")
            for pos in data['positions_with_actions']:
                print(f"    - {pos['chain_name']}: HF={pos['health_factor']:.2f}")
                
                if pos.get('actions'):
                    print(f"      Actions: {len(pos['actions'])}")
                    for action in pos['actions']:
                        order = action.get('order', '?')
                        action_type = action['action_type']
                        token = action.get('token', 'N/A')
                        amount = action.get('amount', 'N/A')
                        print(f"        [{order}] {action_type}: {token} ({amount})")
        else:
            print(f"  ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
    
    print("\n✅ API tests completed!")

if __name__ == "__main__":
    print("🚀 Starting API Tests")
    print("=" * 60)
    
    test_api()
    
    print("\n🎉 All tests completed!")
