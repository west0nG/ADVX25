// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IIDNFT - ID NFT合约接口
 * @dev 定义ID NFT合约的核心功能接口
 */
interface IIDNFT {
    // 元数据结构 - 只存储IPFS URI和状态信息
    struct BarMetadata {
        string tokenURI;      // IPFS metadata URI
        bool isActive;        // 是否激活
        uint256 createdAt;    // 创建时间
        uint256 updatedAt;    // 更新时间
    }

    // 事件
    event IDNFTCreated(uint256 indexed tokenId, address indexed owner, string barName);
    event MetadataUpdated(uint256 indexed tokenId, string barName);
    event IDNFTDeactivated(uint256 indexed tokenId);
    event IDNFTReactivated(uint256 indexed tokenId);

    // 核心功能
    function createIDNFT(
        address to,
        string memory tokenURI
    ) external returns (uint256);

    function updateMetadata(
        uint256 tokenId,
        string memory tokenURI
    ) external;

    function deactivateIDNFT(uint256 tokenId) external;
    function reactivateIDNFT(uint256 tokenId) external;

    // 查询功能
    function getBarMetadata(uint256 tokenId) external view returns (BarMetadata memory);
    function getTokenURI(uint256 tokenId) external view returns (string memory);
    function hasActiveIDNFT(address user) external view returns (bool);
    function getTokenIdByAddress(address user) external view returns (uint256);
    function getAddressByTokenId(uint256 tokenId) external view returns (address);
    function totalSupply() external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function tokenURI(uint256 tokenId) external view returns (string memory);
} 