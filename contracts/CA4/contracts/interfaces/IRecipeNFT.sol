// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Recipe NFT合约接口
 */
interface IRecipeNFT {
    /**
     * @dev 获取Recipe的元数据
     * @param tokenId NFT的tokenId
     * @return uri IPFS元数据URI
     * @return isActive 是否激活
     * @return createdAt 创建时间
     * @return updatedAt 更新时间
     * @return price 授权价格
     * @return isForSale 是否可授权
     */
    function getRecipeMetadata(uint256 tokenId) external view returns (
        string memory uri,
        bool isActive,
        uint256 createdAt,
        uint256 updatedAt,
        uint256 price,
        bool isForSale
    );

    /**
     * @dev 获取NFT的所有者
     * @param tokenId NFT的tokenId
     * @return 所有者地址
     */
    function ownerOf(uint256 tokenId) external view returns (address);

    /**
     * @dev 设置token的授权用户 (ERC-4907)
     * @param tokenId NFT的tokenId
     * @param user 授权用户地址
     * @param expires 授权过期时间
     */
    function setUser(uint256 tokenId, address user, uint64 expires) external;

    /**
     * @dev 允许Marketplace合约设置token的授权用户
     * @param tokenId NFT的tokenId
     * @param user 授权用户地址
     * @param expires 授权过期时间
     */
    function setUserByMarketplace(uint256 tokenId, address user, uint64 expires) external;

    /**
     * @dev 获取token的当前授权用户 (ERC-4907)
     * @param tokenId NFT的tokenId
     * @return user 当前授权用户地址
     * @return expires 授权过期时间
     */
    function userOf(uint256 tokenId) external view returns (address user, uint64 expires);

    /**
     * @dev 检查用户是否有权限访问token的私有信息
     * @param tokenId NFT的tokenId
     * @param user 用户地址
     * @return hasAccess 是否有访问权限
     */
    function hasAccess(uint256 tokenId, address user) external view returns (bool hasAccess);

    /**
     * @dev 获取所有可授权的Recipe NFT
     * @return tokenIds 可授权的tokenId数组
     */
    function getForSaleTokens() external view returns (uint256[] memory);

    /**
     * @dev 获取某地址拥有的所有tokenId
     * @param owner 地址
     * @return tokenIds 该地址拥有的所有tokenId数组
     */
    function getTokenIdsByOwner(address owner) external view returns (uint256[] memory);

    /**
     * @dev 获取某地址被授权的所有tokenId
     * @param user 用户地址
     * @return tokenIds 该用户被授权的所有tokenId数组
     */
    function getAuthorizedTokenIdsByUser(address user) external view returns (uint256[] memory);
} 