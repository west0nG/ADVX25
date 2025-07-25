// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RecipeNFT - 鸡尾酒配方NFT合约
 * @dev 存储IPFS URI、激活状态、时间戳，允许元数据更新和激活/停用
 */
contract RecipeNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    // 元数据结构
    struct RecipeMetadata {
        string tokenURI;      // IPFS metadata URI
        bool isActive;        // 是否激活
        uint256 createdAt;    // 创建时间
        uint256 updatedAt;    // 更新时间
    }

    // tokenId => 元数据
    mapping(uint256 => RecipeMetadata) public recipeMetadata;
    // owner => tokenIds
    mapping(address => uint256[]) public ownerToTokenIds;

    // 事件
    event RecipeNFTCreated(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event RecipeMetadataUpdated(uint256 indexed tokenId, string newTokenURI);
    event RecipeNFTDeactivated(uint256 indexed tokenId);
    event RecipeNFTReactivated(uint256 indexed tokenId);

    // 修饰符
    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "RecipeNFT: Not the token owner");
        _;
    }
    modifier onlyActiveToken(uint256 tokenId) {
        require(recipeMetadata[tokenId].isActive, "RecipeNFT: Token is not active");
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
     * @dev 任何用户都可以铸造自己的Recipe NFT
     * @param uri IPFS元数据URI
     * @return tokenId 新创建的token ID
     */
    function mintRecipeNFT(string memory uri) external returns (uint256) {
        require(bytes(uri).length > 0, "RecipeNFT: Token URI cannot be empty");
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, uri);
        recipeMetadata[newTokenId] = RecipeMetadata({
            tokenURI: uri,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        ownerToTokenIds[msg.sender].push(newTokenId);
        emit RecipeNFTCreated(newTokenId, msg.sender, uri);
        return newTokenId;
    }

    /**
     * @dev 仅token拥有者可更新元数据（激活状态下）
     * @param tokenId NFT的tokenId
     * @param newURI 新的IPFS元数据URI
     */
    function updateTokenURI(uint256 tokenId, string memory newURI) external onlyTokenOwner(tokenId) onlyActiveToken(tokenId) {
        require(bytes(newURI).length > 0, "RecipeNFT: Token URI cannot be empty");
        recipeMetadata[tokenId].tokenURI = newURI;
        recipeMetadata[tokenId].updatedAt = block.timestamp;
        _setTokenURI(tokenId, newURI);
        emit RecipeMetadataUpdated(tokenId, newURI);
    }

    /**
     * @dev 仅token拥有者可停用NFT
     * @param tokenId NFT的tokenId
     */
    function deactivateRecipeNFT(uint256 tokenId) external onlyTokenOwner(tokenId) onlyActiveToken(tokenId) {
        recipeMetadata[tokenId].isActive = false;
        recipeMetadata[tokenId].updatedAt = block.timestamp;
        emit RecipeNFTDeactivated(tokenId);
    }

    /**
     * @dev 仅token拥有者可重新激活NFT
     * @param tokenId NFT的tokenId
     */
    function reactivateRecipeNFT(uint256 tokenId) external onlyTokenOwner(tokenId) {
        require(!recipeMetadata[tokenId].isActive, "RecipeNFT: Token is already active");
        recipeMetadata[tokenId].isActive = true;
        recipeMetadata[tokenId].updatedAt = block.timestamp;
        emit RecipeNFTReactivated(tokenId);
    }

    /**
     * @dev 获取NFT的元数据URI
     * @param tokenId NFT的tokenId
     * @return uri IPFS元数据URI
     */
    function getTokenURI(uint256 tokenId) external view returns (string memory) {
        return tokenURI(tokenId);
    }

    /**
     * @dev 获取完整元数据
     * @param tokenId NFT的tokenId
     * @return uri IPFS元数据URI
     * @return isActive 是否激活
     * @return createdAt 创建时间
     * @return updatedAt 更新时间
     */
    function getRecipeMetadata(uint256 tokenId) external view returns (
        string memory uri,
        bool isActive,
        uint256 createdAt,
        uint256 updatedAt
    ) {
        RecipeMetadata storage meta = recipeMetadata[tokenId];
        return (meta.tokenURI, meta.isActive, meta.createdAt, meta.updatedAt);
    }

    /**
     * @dev 获取某地址拥有的所有tokenId
     * @param owner 地址
     * @return tokenIds 该地址拥有的所有tokenId数组
     */
    function getTokenIdsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerToTokenIds[owner];
    }
} 