"""
Enhanced DeFi Risk Management Agent
Real-time Aave position monitoring with multi-chain support and executable actions
"""

import os
import asyncio
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent

from uagents_adapter import LangchainRegisterTool, cleanup_uagent
from uagents_adapter.langchain import AgentManager

from blockscout_client import BlockscoutMCPClient
from multi_chain_monitor import MultiChainPositionMonitor
from position_monitor import PositionMonitorService

# Load environment variables
load_dotenv()

# Set your API keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
API_TOKEN = os.getenv("AGENTVERSE_API_KEY")

# Initialize the model
model = ChatOpenAI(model="gpt-4o-mini")

# Store the agent globally
agent = None
blockscout_client = None
monitor_service = None

async def setup_defi_risk_agent():
    global agent, blockscout_client, monitor_service
    
    print("Setting up Enhanced DeFi Risk Management Agent...")
    
    try:
        # Initialize MCP client for Blockscout
        mcp_client = MultiServerMCPClient({
            "blockscout": {
                "transport": "streamable_http",
                "url": "https://mcp.blockscout.com/mcp",
            }
        })
        
        print("🔄 Connecting to Blockscout MCP server...")
        tools = await mcp_client.get_tools()
        print(f"✅ Connected! Loaded {len(tools)} tools from Blockscout")
        
        # Initialize our custom components
        blockscout_client = BlockscoutMCPClient(mcp_client)
        monitor_service = PositionMonitorService(blockscout_client)
        
        # Create custom tools for DeFi analysis
        from langchain_core.tools import tool
        
        @tool
        async def analyze_multi_chain_positions(address: str, chain_ids: str = "11155111,84532,80001,421614,11155420") -> str:
            """
            Analyze Aave positions across multiple chains for an address.
            
            Args:
                address: EVM address to analyze
                chain_ids: Comma-separated list of chain IDs (default: 11155111,84532,80001,421614,11155420 for testnets)
            
            Returns:
                Comprehensive analysis with positions, health factors, and executable actions
            """
            try:
                print(f"🔍 Analyzing multi-chain positions for {address}")
                
                chain_list = [c.strip() for c in chain_ids.split(",")]
                monitor = MultiChainPositionMonitor(blockscout_client)
                
                analysis = await monitor.analyze_multi_chain_positions(address, chain_list)
                
                return monitor.format_analysis_response(analysis)
                
            except Exception as e:
                return f"Error analyzing positions: {str(e)}"
        
        @tool
        async def monitor_specific_position(address: str, chain_id: str, asset: str) -> str:
            """
            Monitor a specific Aave position.
            
            Args:
                address: EVM address
                chain_id: Chain ID where the position exists
                asset: Asset symbol (e.g., ETH, USDC)
            
            Returns:
                Detailed position analysis with risk assessment
            """
            try:
                print(f"🔍 Monitoring {asset} position for {address} on chain {chain_id}")
                
                monitor = MultiChainPositionMonitor(blockscout_client)
                result = await monitor.monitor_position(address, chain_id, asset)
                
                if "error" in result:
                    return result["error"]
                
                position = result["position"]
                risk_level = result["risk_level"]
                
                return f"""
📊 **POSITION DETAILS**
Asset: {position['asset']}
Supplied: {position['supplied_amount']:.2f}
Borrowed: {position['borrowed_amount']:.2f}
Health Factor: {position['health_factor']:.2f}
Price: ${position['token_price_usd']:.2f}

⚠️ **RISK LEVEL**: {risk_level.upper()}
"""
            except Exception as e:
                return f"Error monitoring position: {str(e)}"
        
        @tool
        async def get_executable_actions(address: str, chain_ids: str = "11155111,84532,80001,421614,11155420") -> str:
            """
            Get executable actions to improve position health.
            
            Args:
                address: EVM address
                chain_ids: Comma-separated list of chain IDs
            
            Returns:
                JSON array of executable actions with details for execution
            """
            try:
                print(f"🎯 Generating executable actions for {address}")
                
                chain_list = [c.strip() for c in chain_ids.split(",")]
                monitor = MultiChainPositionMonitor(blockscout_client)
                
                analysis = await monitor.analyze_multi_chain_positions(address, chain_list)
                
                import json
                actions_json = json.dumps(analysis['executable_actions'], indent=2)
                
                return f"""
🎯 **EXECUTABLE ACTIONS FOR RISK MITIGATION**

The following actions are based on your balances across chains:

```json
{actions_json}
```

Each action includes:
- action_type: Type of action (repay, supply, swap, withdraw)
- src_chain_id: Source chain ID
- dest_chain_id: Destination chain ID
- token: Token symbol
- token_amount: Amount to execute
- address_to_send: Address to send tokens to
- reason: Explanation for the action
"""
            except Exception as e:
                return f"Error generating actions: {str(e)}"
        
        @tool
        async def start_position_monitoring(address: str, alert_threshold: float = 1.2) -> str:
            """
            Start monitoring an address for liquidation risk.
            
            Args:
                address: EVM address to monitor
                alert_threshold: Health factor threshold for alerts (default: 1.2)
            
            Returns:
                Status of monitoring setup
            """
            try:
                print(f"🚀 Starting monitoring for {address}")
                
                chain_ids = ["11155111", "84532", "80001", "421614", "11155420"]
                monitor_service.add_monitored_address(address, chain_ids, alert_threshold=alert_threshold)
                
                return f"""
✅ **MONITORING STARTED**

Address: {address}
Chains: Sepolia, Base Sepolia, Mumbai, Arbitrum Sepolia, Optimism Sepolia
Alert Threshold: {alert_threshold}

Monitoring will check positions every 5 minutes and alert you if health factor drops below {alert_threshold}.
"""
            except Exception as e:
                return f"Error starting monitoring: {str(e)}"
        
        # Create tools list
        custom_tools = [analyze_multi_chain_positions, monitor_specific_position, 
                       get_executable_actions, start_position_monitoring]
        all_tools = tools + custom_tools
        
        # Create the LangGraph agent
        agent = create_agent(model, all_tools)
        print("✅ Enhanced DeFi Risk Management Agent created successfully")
        
        # Test the agent
        print("🧪 Testing agent with DeFi query...")
        test_response = await agent.ainvoke({
            "messages": [HumanMessage(content="Analyze Aave positions for address 0x9a9A09F73ca7757014B249378D91A6435C39dD40")]
        })
        
        full_response = test_response['messages'][-1].content
        print(f"✅ Test response: {full_response[:200]}...")
        
        print("🚀 Enhanced DeFi Risk Management Agent ready!")
        
    except Exception as e:
        print(f"❌ Error setting up agent: {str(e)}")
        raise e
    
    # Keep the connection alive
    while True:
        await asyncio.sleep(1)

def main():
    # Initialize agent manager
    manager = AgentManager()
    
    # Create agent wrapper
    async def agent_func(x):
        try:
            print(f"🔄 Processing DeFi query: {x}")
            if agent is None:
                return "Agent not initialized yet. Please wait..."
            
            # Add system prompt for DeFi context
            system_prompt = """You are an Enhanced DeFi Risk Management Agent powered by Blockscout MCP and MeTTa knowledge graphs.

IMPORTANT INSTRUCTIONS:
1. ALWAYS call the __unlock_blockchain_analysis__ tool FIRST before using any other tools
2. For multi-chain analysis, use analyze_multi_chain_positions tool
3. For specific position monitoring, use monitor_specific_position tool
4. For executable actions, use get_executable_actions tool
5. To start continuous monitoring, use start_position_monitoring tool
6. Always provide clear, structured responses with actionable advice

When users ask about DeFi positions or liquidation risk:
1. First call __unlock_blockchain_analysis__
2. Then analyze positions using the appropriate tool
3. Present results with health factors, risk levels, and executable actions
4. Include specific recommendations for risk mitigation

Be direct and provide actionable DeFi risk management advice."""
            
            response = await agent.ainvoke({"messages": [HumanMessage(content=f"{system_prompt}\n\n{x}")]})
            result = response["messages"][-1].content
            
            # Log the full response length
            print(f"✅ Response generated (length: {len(result)} chars)")
            print(f"📊 Response preview: {result[:200]}...")
            
            # Save full response to file for debugging
            with open("defi_response.txt", "w", encoding="utf-8") as f:
                f.write(f"Query: {x}\n\nResponse:\n{result}")
            print("💾 Full response saved to defi_response.txt")
            
            return result
            
        except Exception as e:
            error_msg = f"Error processing DeFi query: {str(e)}"
            print(f"❌ {error_msg}")
            return error_msg
    
    agent_wrapper = manager.create_agent_wrapper(agent_func)
    
    # Start the agent in background
    manager.start_agent(setup_defi_risk_agent)
    
    # Wait for initialization
    import time
    time.sleep(3)
    
    # Register with uAgents
    print("Registering Enhanced DeFi Risk Management Agent...")
    tool = LangchainRegisterTool()
    agent_info = tool.invoke({
        "agent_obj": agent_wrapper,
        "name": "defi_risk_management_agent",
        "port": 8081,
        "description": "Enhanced DeFi risk management agent that analyzes Aave positions across multiple chains with real-time price data and provides executable action plans for liquidation risk mitigation",
        "api_token": API_TOKEN,
        "mailbox": True,
        "publish_agent_details": True
    })
    
    print(f"✅ Registered DeFi Risk Management Agent: {agent_info}")
    
    try:
        manager.run_forever()
    except KeyboardInterrupt:
        print("🛑 Shutting down...")
        cleanup_uagent("defi_risk_management_agent")
        print("✅ Agent stopped.")

if __name__ == "__main__":
    main()
