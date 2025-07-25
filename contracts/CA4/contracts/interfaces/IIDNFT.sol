// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev ID NFT合约接口
 */
interface IIDNFT {
    /**
     * @dev 检查地址是否拥有活跃的ID NFT
     * @param user 用户地址
     * @return 是否拥有活跃的ID NFT
     */
    function hasActiveIDNFT(address user) external view returns (bool);

    /**
     * @dev 获取用户的ID NFT ID
     * @param user 用户地址
     * @return tokenId，如果不存在则返回0
     */
    function getTokenIdByAddress(address user) external view returns (uint256);

    /**
     * @dev 获取ID NFT的所有者地址
     * @param tokenId NFT ID
     * @return 所有者地址
     */
    function getAddressByTokenId(uint256 tokenId) external view returns (address);

    /**
     * @dev 获取酒吧元数据
     * @param tokenId NFT ID
     * @return tokenURI IPFS元数据URI
     * @return isActive 是否激活
     * @return createdAt 创建时间
     * @return updatedAt 更新时间
     */
    function getBarMetadata(uint256 tokenId) external view returns (
        string memory tokenURI,
        bool isActive,
        uint256 createdAt,
        uint256 updatedAt
    );

    /**
     * @dev 获取当前总供应量
     * @return 总供应量
     */
    function totalSupply() external view returns (uint256);
} 