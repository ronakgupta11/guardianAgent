"""
Blockscout MCP Client Wrapper
Provides a clean interface to Blockscout MCP tools
"""

import asyncio
import json
from typing import Dict, Any, Optional
from langchain_mcp_adapters.client import MultiServerMCPClient

class BlockscoutMCPClient:
    """Wrapper for Blockscout MCP client with error handling"""
    
    def __init__(self, mcp_client):
        self.mcp_client = mcp_client
    
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call a Blockscout MCP tool with error handling"""
        try:
            print(f"🔧 Calling Blockscout tool: {tool_name} with args: {arguments}")
            
            # First unlock the blockchain analysis
            await self._unlock_blockchain_analysis()
            
            # Use session context manager to call the tool
            async with self.mcp_client.session("blockscout") as session:
                print(f"✅ Session created, calling tool...")
                result = await session.call_tool(tool_name, arguments)
                print(f"✅ Tool call successful, result type: {type(result)}")
                
                # Extract data from CallToolResult
                if hasattr(result, 'structuredContent') and result.structuredContent:
                    print(f"✅ Using structuredContent")
                    return result.structuredContent
                elif hasattr(result, 'content') and result.content:
                    # Parse text content as JSON
                    import json
                    for content_block in result.content:
                        if hasattr(content_block, 'text'):
                            try:
                                parsed = json.loads(content_block.text)
                                print(f"✅ Parsed JSON from text content")
                                return parsed
                            except:
                                print(f"⚠️ Content is not JSON, returning as text")
                                return {"text": content_block.text}
                
                print(f"⚠️ No content found in result")
                return {"error": "No content returned"}
            
        except Exception as e:
            print(f"❌ Error calling tool {tool_name}: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"error": f"Failed to call {tool_name}: {str(e)}"}
    
    async def _unlock_blockchain_analysis(self):
        """Unlock blockchain analysis tools"""
        try:
            print(f"🔓 Attempting to unlock blockchain analysis...")
            async with self.mcp_client.session("blockscout") as session:
                await session.call_tool("__unlock_blockchain_analysis__", {})
                print(f"✅ Successfully unlocked blockchain analysis")
        except Exception as e:
            print(f"⚠️ Warning: Could not unlock blockchain analysis: {e}")
    
    async def get_address_info(self, address: str, chain_id: str = "1") -> Dict[str, Any]:
        """Get comprehensive address information"""
        return await self.call_tool("get_address_info", {
            "address": address,
            "chain_id": chain_id
        })
    
    async def get_tokens_by_address(self, address: str, chain_id: str = "1") -> Dict[str, Any]:
        """Get token balances for an address"""
        return await self.call_tool("get_tokens_by_address", {
            "address": address,
            "chain_id": chain_id
        })
    
    async def get_transactions_by_address(self, address: str, chain_id: str = "1", 
                                        age_from: Optional[str] = None) -> Dict[str, Any]:
        """Get transactions for an address"""
        params = {
            "address": address,
            "chain_id": chain_id
        }
        if age_from:
            params["age_from"] = age_from
            
        return await self.call_tool("get_transactions_by_address", params)
    
    async def get_latest_block(self, chain_id: str = "1") -> Dict[str, Any]:
        """Get latest block information"""
        return await self.call_tool("get_latest_block", {
            "chain_id": chain_id
        })
    
    async def get_chains_list(self) -> Dict[str, Any]:
        """Get list of supported chains"""
        return await self.call_tool("get_chains_list", {})
