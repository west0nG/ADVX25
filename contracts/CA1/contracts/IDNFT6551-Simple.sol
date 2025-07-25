// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title IDNFT6551-Simple - 简化版ERC-6551身份NFT合约
 * @dev 用于本地测试的简化版本，模拟ERC-6551功能
 * @author Bars Help Bars Team
 */
contract IDNFT6551Simple is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    // 状态变量
    uint256 private _tokenIds;
    
    // 元数据结构
    struct IDMetadata {
        string tokenURI;      // IPFS metadata URI
        bool isActive;        // 是否激活
        uint256 createdAt;    // 创建时间
        uint256 updatedAt;    // 更新时间
        address accountAddress; // 模拟的ERC-6551账户地址
    }

    // 映射：tokenId => 身份元数据
    mapping(uint256 => IDMetadata) public idMetadata;
    
    // 映射：地址 => tokenId（一个地址只能拥有一个ID NFT）
    mapping(address => uint256) public addressToTokenId;
    
    // 映射：tokenId => 地址（反向查找）
    mapping(uint256 => address) public tokenIdToAddress;
    
    // 映射：模拟的ERC-6551账户地址 => tokenId
    mapping(address => uint256) public accountToTokenId;
    
    // 事件
    event IDNFTCreated(uint256 indexed tokenId, address indexed owner, address indexed accountAddress, string tokenURI);
    event MetadataUpdated(uint256 indexed tokenId, string tokenURI);
    event IDNFTDeactivated(uint256 indexed tokenId);
    event IDNFTReactivated(uint256 indexed tokenId);
    event AccountCreated(uint256 indexed tokenId, address indexed accountAddress);

    // 修饰符
    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "IDNFT6551Simple: Not the token owner");
        _;
    }

    modifier onlyActiveToken(uint256 tokenId) {
        require(idMetadata[tokenId].isActive, "IDNFT6551Simple: Token is not active");
        _;
    }

    /**
     * @dev 构造函数
     * @param name NFT名称
     * @param symbol NFT符号
     */
    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol) 
        Ownable(msg.sender) 
    {}

    /**
     * @dev 创建ID NFT（只能由合约所有者调用）
     * @param to 接收者地址
     * @param uri IPFS元数据URI
     * @return tokenId 新创建的token ID
     */
    function createIDNFT(
        address to,
        string memory uri
    ) external onlyOwner returns (uint256) {
        require(to != address(0), "IDNFT6551Simple: Invalid address");
        require(bytes(uri).length > 0, "IDNFT6551Simple: Token URI cannot be empty");
        require(addressToTokenId[to] == 0, "IDNFT6551Simple: Address already has an ID NFT");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        // 创建模拟的ERC-6551账户地址
        address accountAddress = _createMockERC6551Account(newTokenId);

        // 创建身份元数据
        IDMetadata memory metadata = IDMetadata({
            tokenURI: uri,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            accountAddress: accountAddress
        });

        // 存储元数据
        idMetadata[newTokenId] = metadata;
        
        // 建立地址映射关系
        addressToTokenId[to] = newTokenId;
        tokenIdToAddress[newTokenId] = to;
        accountToTokenId[accountAddress] = newTokenId;

        // 铸造NFT
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);

        emit IDNFTCreated(newTokenId, to, accountAddress, uri);
        emit AccountCreated(newTokenId, accountAddress);
        
        return newTokenId;
    }

    /**
     * @dev 创建模拟的ERC-6551账户地址
     * @param tokenId NFT ID
     * @return accountAddress 模拟的账户地址
     */
    function _createMockERC6551Account(uint256 tokenId) internal view returns (address accountAddress) {
        // 使用确定性地址生成算法创建模拟的ERC-6551账户地址
        bytes32 hash = keccak256(abi.encodePacked(
            address(this),
            block.chainid,
            tokenId,
            "ERC6551_ACCOUNT"
        ));
        
        // 将hash转换为地址
        accountAddress = address(uint160(uint256(hash)));
    }

    /**
     * @dev 更新身份元数据（只能由NFT所有者调用）
     * @param tokenId NFT ID
     * @param uri 新的IPFS元数据URI
     */
    function updateMetadata(
        uint256 tokenId,
        string memory uri
    ) external onlyTokenOwner(tokenId) onlyActiveToken(tokenId) {
        require(bytes(uri).length > 0, "IDNFT6551Simple: Token URI cannot be empty");

        // 更新元数据
        idMetadata[tokenId].tokenURI = uri;
        idMetadata[tokenId].updatedAt = block.timestamp;

        // 更新URI
        _setTokenURI(tokenId, uri);

        emit MetadataUpdated(tokenId, uri);
    }

    /**
     * @dev 停用ID NFT（只能由NFT所有者调用）
     * @param tokenId NFT ID
     */
    function deactivateIDNFT(uint256 tokenId) external onlyTokenOwner(tokenId) onlyActiveToken(tokenId) {
        idMetadata[tokenId].isActive = false;
        idMetadata[tokenId].updatedAt = block.timestamp;
        
        emit IDNFTDeactivated(tokenId);
    }

    /**
     * @dev 重新激活ID NFT（只能由NFT所有者调用）
     * @param tokenId NFT ID
     */
    function reactivateIDNFT(uint256 tokenId) external onlyTokenOwner(tokenId) {
        require(!idMetadata[tokenId].isActive, "IDNFT6551Simple: Token is already active");
        
        idMetadata[tokenId].isActive = true;
        idMetadata[tokenId].updatedAt = block.timestamp;
        
        emit IDNFTReactivated(tokenId);
    }

    /**
     * @dev 获取身份元数据
     * @param tokenId NFT ID
     * @return 身份元数据结构
     */
    function getIDMetadata(uint256 tokenId) external view returns (IDMetadata memory) {
        require(ownerOf(tokenId) != address(0), "IDNFT6551Simple: Token does not exist");
        return idMetadata[tokenId];
    }

    /**
     * @dev 获取模拟的ERC-6551账户地址
     * @param tokenId NFT ID
     * @return 账户地址
     */
    function getAccountAddress(uint256 tokenId) external view returns (address) {
        require(ownerOf(tokenId) != address(0), "IDNFT6551Simple: Token does not exist");
        return idMetadata[tokenId].accountAddress;
    }

    /**
     * @dev 通过账户地址获取tokenId
     * @param accountAddress 模拟的ERC-6551账户地址
     * @return tokenId
     */
    function getTokenIdByAccount(address accountAddress) external view returns (uint256) {
        return accountToTokenId[accountAddress];
    }

    /**
     * @dev 获取IPFS元数据URI
     * @param tokenId NFT ID
     * @return IPFS元数据URI
     */
    function getTokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "IDNFT6551Simple: Token does not exist");
        return idMetadata[tokenId].tokenURI;
    }

    /**
     * @dev 检查地址是否拥有活跃的ID NFT
     * @param user 用户地址
     * @return 是否拥有活跃的ID NFT
     */
    function hasActiveIDNFT(address user) external view returns (bool) {
        uint256 tokenId = addressToTokenId[user];
        if (tokenId == 0) return false;
        return idMetadata[tokenId].isActive;
    }

    /**
     * @dev 获取用户的ID NFT ID
     * @param user 用户地址
     * @return tokenId，如果不存在则返回0
     */
    function getTokenIdByAddress(address user) external view returns (uint256) {
        return addressToTokenId[user];
    }

    /**
     * @dev 获取ID NFT的所有者地址
     * @param tokenId NFT ID
     * @return 所有者地址
     */
    function getAddressByTokenId(uint256 tokenId) external view returns (address) {
        require(ownerOf(tokenId) != address(0), "IDNFT6551Simple: Token does not exist");
        return tokenIdToAddress[tokenId];
    }

    /**
     * @dev 获取当前总供应量
     * @return 总供应量
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev 检查合约是否支持ERC-6551
     * @return 是否支持ERC-6551
     */
    function supportsERC6551() external pure returns (bool) {
        return true;
    }

    // 重写必要的函数
    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev 更新地址映射的辅助函数
     */
    function _updateAddressMapping(address from, address to, uint256 tokenId) internal {
        if (addressToTokenId[from] == tokenId) {
            addressToTokenId[from] = 0;
            addressToTokenId[to] = tokenId;
            tokenIdToAddress[tokenId] = to;
        }
    }
} 