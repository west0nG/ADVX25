// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title IDNFT - 酒吧身份NFT合约
 * @dev 实现ERC-6551标准的Token Bound Account，用于酒吧身份认证与授权管理
 * @author Bars Help Bars Team
 */
contract IDNFT is ERC721, ERC721URIStorage, Ownable {
    using Strings for uint256;

    // 状态变量
    uint256 private _tokenIds;
    
    // 元数据结构 - 只存储IPFS URI和状态信息
    struct BarMetadata {
        string tokenURI;      // IPFS metadata URI
        bool isActive;        // 是否激活
        uint256 createdAt;    // 创建时间
        uint256 updatedAt;    // 更新时间
    }

    // 映射：tokenId => 酒吧元数据
    mapping(uint256 => BarMetadata) public barMetadata;
    
    // 映射：地址 => tokenId（一个地址只能拥有一个ID NFT）
    mapping(address => uint256) public addressToTokenId;
    
    // 映射：tokenId => 地址（反向查找）
    mapping(uint256 => address) public tokenIdToAddress;
    
    // 事件
    event IDNFTCreated(uint256 indexed tokenId, address indexed owner, string barName);
    event MetadataUpdated(uint256 indexed tokenId, string barName);
    event IDNFTDeactivated(uint256 indexed tokenId);
    event IDNFTReactivated(uint256 indexed tokenId);

    // 修饰符
    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "IDNFT: Not the token owner");
        _;
    }

    modifier onlyActiveToken(uint256 tokenId) {
        require(barMetadata[tokenId].isActive, "IDNFT: Token is not active");
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
     * @dev 创建ID NFT（只能由合约所有者调用，通常是从后端API调用）
     * @param to 接收者地址
     * @param uri IPFS元数据URI
     * @return tokenId 新创建的token ID
     */
    function createIDNFT(
        address to,
        string memory uri
    ) external onlyOwner returns (uint256) {
        require(to != address(0), "IDNFT: Invalid address");
        require(bytes(uri).length > 0, "IDNFT: Token URI cannot be empty");
        require(addressToTokenId[to] == 0, "IDNFT: Address already has an ID NFT");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        // 创建酒吧元数据 - 只存储IPFS URI
        BarMetadata memory metadata = BarMetadata({
            tokenURI: uri,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        // 存储元数据
        barMetadata[newTokenId] = metadata;
        
        // 建立地址映射关系
        addressToTokenId[to] = newTokenId;
        tokenIdToAddress[newTokenId] = to;

        // 铸造NFT
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);

        emit IDNFTCreated(newTokenId, to, "");
        
        return newTokenId;
    }

    /**
     * @dev 更新酒吧元数据（只能由NFT所有者调用）
     * @param tokenId NFT ID
     * @param uri 新的IPFS元数据URI
     */
    function updateMetadata(
        uint256 tokenId,
        string memory uri
    ) external onlyTokenOwner(tokenId) onlyActiveToken(tokenId) {
        require(bytes(uri).length > 0, "IDNFT: Token URI cannot be empty");

        // 更新元数据
        barMetadata[tokenId].tokenURI = uri;
        barMetadata[tokenId].updatedAt = block.timestamp;

        // 更新URI
        _setTokenURI(tokenId, uri);

        emit MetadataUpdated(tokenId, "");
    }

    /**
     * @dev 停用ID NFT（只能由NFT所有者调用）
     * @param tokenId NFT ID
     */
    function deactivateIDNFT(uint256 tokenId) external onlyTokenOwner(tokenId) onlyActiveToken(tokenId) {
        barMetadata[tokenId].isActive = false;
        barMetadata[tokenId].updatedAt = block.timestamp;
        
        emit IDNFTDeactivated(tokenId);
    }

    /**
     * @dev 重新激活ID NFT（只能由NFT所有者调用）
     * @param tokenId NFT ID
     */
    function reactivateIDNFT(uint256 tokenId) external onlyTokenOwner(tokenId) {
        require(!barMetadata[tokenId].isActive, "IDNFT: Token is already active");
        
        barMetadata[tokenId].isActive = true;
        barMetadata[tokenId].updatedAt = block.timestamp;
        
        emit IDNFTReactivated(tokenId);
    }

    /**
     * @dev 获取酒吧元数据
     * @param tokenId NFT ID
     * @return 酒吧元数据结构
     */
    function getBarMetadata(uint256 tokenId) external view returns (BarMetadata memory) {
        require(ownerOf(tokenId) != address(0), "IDNFT: Token does not exist");
        return barMetadata[tokenId];
    }

    /**
     * @dev 获取IPFS元数据URI
     * @param tokenId NFT ID
     * @return IPFS元数据URI
     */
    function getTokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "IDNFT: Token does not exist");
        return barMetadata[tokenId].tokenURI;
    }

    /**
     * @dev 检查地址是否拥有活跃的ID NFT
     * @param user 用户地址
     * @return 是否拥有活跃的ID NFT
     */
    function hasActiveIDNFT(address user) external view returns (bool) {
        uint256 tokenId = addressToTokenId[user];
        if (tokenId == 0) return false;
        return barMetadata[tokenId].isActive;
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
        require(ownerOf(tokenId) != address(0), "IDNFT: Token does not exist");
        return tokenIdToAddress[tokenId];
    }

    /**
     * @dev 获取当前总供应量
     * @return 总供应量
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    // 重写必要的函数
    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
} 