"""
Test LLM-based Aave Position Analysis
Tests the new LLM-based approach for parsing Aave positions
"""

import asyncio
import os
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient
from blockscout_client import BlockscoutMCPClient
from multi_chain_monitor import MultiChainPositionMonitor

# Load environment variables
load_dotenv()

async def test_llm_based_analysis():
    """Test the LLM-based Aave position analysis"""
    print("🚀 Testing LLM-Based Aave Position Analysis")
    print("=" * 60)
    
    try:
        # Initialize MCP client
        print("1. Initializing Blockscout MCP client...")
        mcp_client = MultiServerMCPClient({
            "blockscout": {
                "transport": "streamable_http",
                "url": "https://mcp.blockscout.com/mcp",
            }
        })
        
        blockscout_client = BlockscoutMCPClient(mcp_client)
        monitor = MultiChainPositionMonitor(blockscout_client)
        
        print("✅ Components initialized successfully")
        
        # Test address
        test_address = "0x956d2bD30169C281b999DB1B5A4d74224e1eb3E2"
        chain_ids = ["11155111", "84532"]  # Sepolia and Base Sepolia
        
        print(f"\n2. Analyzing positions for {test_address}...")
        print("-" * 60)
        
        # Use LLM-based analysis
        analysis = await monitor.analyze_multi_chain_positions_llm(test_address, chain_ids)
        
        print(f"\n✅ Analysis complete!")
        print(f"Total positions: {analysis['total_positions']}")
        print(f"Risk level: {analysis['risk_assessment']['risk_level']}")
        print(f"Min health factor: {analysis['risk_assessment']['min_health_factor']:.2f}")
        
        # Display positions
        print(f"\n📊 Positions:")
        print("=" * 60)
        for pos in analysis['positions']:
            print(f"\nChain: {pos['chain_name']} ({pos['chain_id']})")
            print(f"  Health Factor: {pos['health_factor']:.2f}")
            print(f"  Risk Level: {pos['risk_level'].upper()}")
            
            print(f"  Supplied Assets:")
            for asset in pos['supplied_assets']:
                print(f"    • {asset['token']}: {asset['amount']}")
            
            print(f"  Borrowed Assets:")
            for asset in pos['borrowed_assets']:
                print(f"    • {asset['token']}: {asset['amount']}")
            
            # Display actions for this position
            if pos.get('actions'):
                print(f"  \n  🎯 Executable Actions:")
                for i, action in enumerate(pos['actions'], 1):
                    print(f"    {i}. {action['action_type'].upper()}")
                    print(f"       Token: {action['token']}")
                    print(f"       Amount: {action['amount']}")
                    if 'src_chain_id' in action:
                        print(f"       Source Chain: {action['src_chain_id']}")
                    if 'dst_chain_id' in action:
                        print(f"       Destination Chain: {action['dst_chain_id']}")
                    if 'src_token' in action:
                        print(f"       Source Token: {action['src_token']}")
                        print(f"       Destination Token: {action.get('dst_token', 'N/A')}")
                    print(f"       Reason: {action['reason']}")
        
        # Display prices
        print(f"\n💰 Prices:")
        print("-" * 60)
        for token, price in analysis['prices'].items():
            print(f"  {token}: ${price:.2f}")
        
        print("\n✅ All tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Starting LLM-Based Aave Position Analysis Tests")
    print("=" * 60)
    
    # Run tests
    asyncio.run(test_llm_based_analysis())
    
    print("\n🎉 All tests completed!")
