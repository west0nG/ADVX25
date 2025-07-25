from web3 import Web3
from eth_account import Account
import json
import os
from typing import Dict, Optional, Tuple
from fastapi import HTTPException

class ContractService:
    """智能合约服务类，处理与区块链的交互"""
    
    def __init__(self):
        # 初始化Web3连接
        self.w3 = Web3(Web3.HTTPProvider(os.getenv('WEB3_PROVIDER_URL', 'http://localhost:8545')))
        
        # 合约地址和ABI
        self.idnft_address = os.getenv('IDNFT_CONTRACT_ADDRESS')
        self.idnft_abi = self._load_contract_abi('IDNFT')
        
        # 管理员私钥（用于合约调用）
        self.admin_private_key = os.getenv('ADMIN_PRIVATE_KEY')
        if not self.admin_private_key:
            raise ValueError("ADMIN_PRIVATE_KEY environment variable is required")
        
        self.admin_account = Account.from_key(self.admin_private_key)
        
        # 初始化合约实例
        self.idnft_contract = self.w3.eth.contract(
            address=self.idnft_address,
            abi=self.idnft_abi
        )
    
    def _load_contract_abi(self, contract_name: str) -> list:
        """加载合约ABI"""
        try:
            abi_path = f"../contracts/artifacts/contracts/{contract_name}.sol/{contract_name}.json"
            with open(abi_path, 'r') as f:
                contract_json = json.load(f)
                return contract_json['abi']
        except FileNotFoundError:
            # 如果找不到编译后的ABI，返回基本ABI（用于测试）
            return self._get_basic_abi(contract_name)
    
    def _get_basic_abi(self, contract_name: str) -> list:
        """获取基本ABI（用于测试环境）"""
        if contract_name == 'IDNFT':
            return [
                {
                    "inputs": [
                        {"name": "to", "type": "address"},
                        {"name": "tokenURI", "type": "string"}
                    ],
                    "name": "createIDNFT",
                    "outputs": [{"name": "", "type": "uint256"}],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [{"name": "user", "type": "address"}],
                    "name": "hasActiveIDNFT",
                    "outputs": [{"name": "", "type": "bool"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [{"name": "user", "type": "address"}],
                    "name": "getTokenIdByAddress",
                    "outputs": [{"name": "", "type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [{"name": "tokenId", "type": "uint256"}],
                    "name": "getTokenURI",
                    "outputs": [{"name": "", "type": "string"}],
                    "stateMutability": "view",
                    "type": "function"
                }
            ]
        return []
    
    def create_id_nft(self, 
                     user_address: str,
                     token_uri: str) -> Dict:
        """
        创建ID NFT
        
        Args:
            user_address: 用户钱包地址
            token_uri: IPFS元数据URI
            
        Returns:
            包含交易哈希和token ID的字典
        """
        try:
            # 验证地址格式
            if not self.w3.is_address(user_address):
                raise HTTPException(status_code=400, detail="Invalid user address")
            
            # 检查用户是否已有ID NFT
            has_nft = self.idnft_contract.functions.hasActiveIDNFT(user_address).call()
            if has_nft:
                raise HTTPException(status_code=400, detail="User already has an ID NFT")
            
            # 构建交易
            transaction = self.idnft_contract.functions.createIDNFT(
                user_address,
                token_uri
            ).build_transaction({
                'from': self.admin_account.address,
                'gas': 300000,  # 减少gas费用（因为存储数据更少）
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.admin_account.address)
            })
            
            # 签名交易
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.admin_private_key)
            
            # 发送交易
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # 等待交易确认
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # 解析事件获取token ID
            token_id = self._parse_token_id_from_event(tx_receipt)
            
            return {
                "success": True,
                "transaction_hash": tx_hash.hex(),
                "token_id": token_id,
                "user_address": user_address,
                "token_uri": token_uri
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create ID NFT: {str(e)}")
    
    def _parse_token_id_from_event(self, tx_receipt) -> int:
        """从交易收据中解析token ID"""
        try:
            # 查找IDNFTCreated事件
            for log in tx_receipt['logs']:
                if log['topics'][0] == self.w3.keccak(text="IDNFTCreated(uint256,address,string)"):
                    # 解析token ID（第一个indexed参数）
                    token_id = int(log['topics'][1].hex(), 16)
                    return token_id
            return 0
        except Exception:
            return 0
    
    def get_user_id_nft(self, user_address: str) -> Optional[Dict]:
        """
        获取用户的ID NFT信息
        
        Args:
            user_address: 用户钱包地址
            
        Returns:
            ID NFT信息字典，如果不存在则返回None
        """
        try:
            # 检查是否有活跃的ID NFT
            has_nft = self.idnft_contract.functions.hasActiveIDNFT(user_address).call()
            if not has_nft:
                return None
            
            # 获取token ID
            token_id = self.idnft_contract.functions.getTokenIdByAddress(user_address).call()
            if token_id == 0:
                return None
            
            # 获取元数据
            metadata = self.idnft_contract.functions.getBarMetadata(token_id).call()
            
            return {
                "token_id": token_id,
                "user_address": user_address,
                "token_uri": metadata[0],
                "is_active": metadata[1],
                "created_at": metadata[2],
                "updated_at": metadata[3]
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get user ID NFT: {str(e)}")
    
    def update_id_nft_metadata(self,
                              user_address: str,
                              token_uri: str) -> Dict:
        """
        更新ID NFT元数据（需要用户签名）
        
        Args:
            user_address: 用户钱包地址
            token_uri: 新的IPFS元数据URI
            
        Returns:
            更新结果字典
        """
        try:
            # 获取用户的token ID
            token_id = self.idnft_contract.functions.getTokenIdByAddress(user_address).call()
            if token_id == 0:
                raise HTTPException(status_code=404, detail="User does not have an ID NFT")
            
            # 注意：这个函数需要用户自己签名，这里只是示例
            # 实际实现中，前端会获取用户签名后调用合约
            
            return {
                "success": True,
                "message": "Metadata update initiated",
                "token_id": token_id,
                "user_address": user_address,
                "new_token_uri": token_uri
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to update metadata: {str(e)}")
    
    def check_contract_connection(self) -> Dict:
        """检查合约连接状态"""
        try:
            # 检查Web3连接
            is_connected = self.w3.is_connected()
            
            # 检查合约地址
            contract_code = self.w3.eth.get_code(self.idnft_address)
            contract_deployed = contract_code != b''
            
            return {
                "web3_connected": is_connected,
                "contract_deployed": contract_deployed,
                "contract_address": self.idnft_address,
                "admin_address": self.admin_account.address
            }
            
        except Exception as e:
            return {
                "web3_connected": False,
                "contract_deployed": False,
                "error": str(e)
            }

# 创建全局实例
contract_service = ContractService() 