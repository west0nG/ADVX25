// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RecipeNFT - 鸡尾酒配方NFT合约 (ERC-4907)
 * @dev 实现ERC-4907标准，支持临时用户授权访问私有配方信息
 * @dev Recipe NFT只能铸造于和存在于ID NFT的ERC-6551账户里
 */

// ID NFT合约接口
interface IIDNFT {
    function getAccountAddress(uint256 tokenId) external view returns (address);
    function hasActiveIDNFT(address user) external view returns (bool);
    function getTokenIdByAddress(address user) external view returns (uint256);
}

contract RecipeNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    // ID NFT合约地址
    IIDNFT public idnftContract;

    // ERC-4907 用户信息结构
    struct UserInfo {
        address user;     // 授权用户地址
        uint64 expires;   // 授权过期时间
    }

    // 元数据结构
    struct RecipeMetadata {
        string tokenURI;      // IPFS metadata URI
        bool isActive;        // 是否激活
        uint256 createdAt;    // 创建时间
        uint256 updatedAt;    // 更新时间
        uint256 price;        // 授权价格 (USDT, 以wei为单位)
        bool isForSale;       // 是否可授权
        uint256 idNFTTokenId; // 关联的ID NFT token ID
        address idNFTAccount; // ID NFT的ERC-6551账户地址
    }

    // tokenId => 元数据
    mapping(uint256 => RecipeMetadata) public recipeMetadata;
    // tokenId => 用户信息 (ERC-4907)
    mapping(uint256 => UserInfo) internal _users;
    // owner => tokenIds (owner现在是ERC-6551账户地址)
    mapping(address => uint256[]) public ownerToTokenIds;
    // 授权用户 => tokenIds (用于查询用户被授权的NFT)
    mapping(address => uint256[]) public userToAuthorizedTokenIds;
    // ID NFT tokenId => Recipe tokenIds (用于查询ID NFT拥有的Recipe)
    mapping(uint256 => uint256[]) public idNFTToRecipeTokens;

    // 事件
    event RecipeNFTCreated(uint256 indexed tokenId, address indexed owner, uint256 indexed idNFTTokenId, string tokenURI);
    event RecipeMetadataUpdated(uint256 indexed tokenId, string newTokenURI);
    event RecipeNFTDeactivated(uint256 indexed tokenId);
    event RecipeNFTReactivated(uint256 indexed tokenId);
    event UserUpdated(uint256 indexed tokenId, address indexed user, uint64 expires);
    event PriceSet(uint256 indexed tokenId, uint256 price);
    event SaleStatusChanged(uint256 indexed tokenId, bool isForSale);
    event IDNFTContractUpdated(address indexed oldContract, address indexed newContract);

    // 修饰符
    modifier onlyTokenOwner(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "RecipeNFT: Not the token owner");
        _;
    }
    
    modifier onlyActiveToken(uint256 tokenId) {
        require(recipeMetadata[tokenId].isActive, "RecipeNFT: Token is not active");
        _;
    }

    modifier onlyIDNFTHolder() {
        require(idnftContract.hasActiveIDNFT(msg.sender), "RecipeNFT: User must have active ID NFT");
        _;
    }

    modifier onlyIDNFTAccount(uint256 tokenId) {
        require(msg.sender == recipeMetadata[tokenId].idNFTAccount, "RecipeNFT: Not the ID NFT account");
        _;
    }

    /**
     * @dev 构造函数
     * @param name NFT名称
     * @param symbol NFT符号
     * @param _idnftContract ID NFT合约地址
     */
    constructor(string memory name, string memory symbol, address _idnftContract)
        ERC721(name, symbol)
        Ownable(msg.sender)
    {
        require(_idnftContract != address(0), "RecipeNFT: Invalid ID NFT contract address");
        idnftContract = IIDNFT(_idnftContract);
    }

    /**
     * @dev 设置ID NFT合约地址（所有用户都可以调用）
     * @param _idnftContract 新的ID NFT合约地址
     */
    function setIDNFTContract(address _idnftContract) external {
        require(_idnftContract != address(0), "RecipeNFT: Invalid ID NFT contract address");
        address oldContract = address(idnftContract);
        idnftContract = IIDNFT(_idnftContract);
        emit IDNFTContractUpdated(oldContract, _idnftContract);
    }

    /**
     * @dev 铸造Recipe NFT到用户的ID NFT的ERC-6551账户
     * @param uri IPFS元数据URI
     * @return tokenId 新创建的token ID
     */
    function mintRecipeNFT(string memory uri) external onlyIDNFTHolder returns (uint256) {
        require(bytes(uri).length > 0, "RecipeNFT: Token URI cannot be empty");
        
        // 获取用户的ID NFT token ID
        uint256 idNFTTokenId = idnftContract.getTokenIdByAddress(msg.sender);
        require(idNFTTokenId > 0, "RecipeNFT: User has no ID NFT");
        
        // 获取ID NFT的ERC-6551账户地址
        address idNFTAccount = idnftContract.getAccountAddress(idNFTTokenId);
        require(idNFTAccount != address(0), "RecipeNFT: Invalid ID NFT account");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        // 铸造到ERC-6551账户
        _safeMint(idNFTAccount, newTokenId);
        _setTokenURI(newTokenId, uri);
        
        // 创建元数据
        recipeMetadata[newTokenId] = RecipeMetadata({
            tokenURI: uri,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            price: 0,
            isForSale: false,
            idNFTTokenId: idNFTTokenId,
            idNFTAccount: idNFTAccount
        });
        
        // 更新映射关系
        ownerToTokenIds[idNFTAccount].push(newTokenId);
        idNFTToRecipeTokens[idNFTTokenId].push(newTokenId);
        
        emit RecipeNFTCreated(newTokenId, idNFTAccount, idNFTTokenId, uri);
        return newTokenId;
    }

    /**
     * @dev 仅ID NFT账户可更新元数据（激活状态下）
     * @param tokenId NFT的tokenId
     * @param newURI 新的IPFS元数据URI
     */
    function updateTokenURI(uint256 tokenId, string memory newURI) external onlyIDNFTAccount(tokenId) onlyActiveToken(tokenId) {
        require(bytes(newURI).length > 0, "RecipeNFT: Token URI cannot be empty");
        recipeMetadata[tokenId].tokenURI = newURI;
        recipeMetadata[tokenId].updatedAt = block.timestamp;
        _setTokenURI(tokenId, newURI);
        emit RecipeMetadataUpdated(tokenId, newURI);
    }

    /**
     * @dev 仅ID NFT账户可停用NFT
     * @param tokenId NFT的tokenId
     */
    function deactivateRecipeNFT(uint256 tokenId) external onlyIDNFTAccount(tokenId) onlyActiveToken(tokenId) {
        recipeMetadata[tokenId].isActive = false;
        recipeMetadata[tokenId].updatedAt = block.timestamp;
        emit RecipeNFTDeactivated(tokenId);
    }

    /**
     * @dev 仅ID NFT账户可重新激活NFT
     * @param tokenId NFT的tokenId
     */
    function reactivateRecipeNFT(uint256 tokenId) external onlyIDNFTAccount(tokenId) {
        require(!recipeMetadata[tokenId].isActive, "RecipeNFT: Token is already active");
        recipeMetadata[tokenId].isActive = true;
        recipeMetadata[tokenId].updatedAt = block.timestamp;
        emit RecipeNFTReactivated(tokenId);
    }

    /**
     * @dev 设置授权价格（仅ID NFT账户）
     * @param tokenId NFT的tokenId
     * @param price 授权价格 (USDT, 以wei为单位)
     */
    function setPrice(uint256 tokenId, uint256 price) external onlyIDNFTAccount(tokenId) onlyActiveToken(tokenId) {
        recipeMetadata[tokenId].price = price;
        emit PriceSet(tokenId, price);
    }

    /**
     * @dev 设置是否可授权（仅ID NFT账户）
     * @param tokenId NFT的tokenId
     * @param isForSale 是否可授权
     */
    function setSaleStatus(uint256 tokenId, bool isForSale) external onlyIDNFTAccount(tokenId) onlyActiveToken(tokenId) {
        recipeMetadata[tokenId].isForSale = isForSale;
        emit SaleStatusChanged(tokenId, isForSale);
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
     * @return price 授权价格
     * @return isForSale 是否可授权
     * @return idNFTTokenId 关联的ID NFT token ID
     * @return idNFTAccount ID NFT的ERC-6551账户地址
     */
    function getRecipeMetadata(uint256 tokenId) external view returns (
        string memory uri,
        bool isActive,
        uint256 createdAt,
        uint256 updatedAt,
        uint256 price,
        bool isForSale,
        uint256 idNFTTokenId,
        address idNFTAccount
    ) {
        require(_isValidToken(tokenId), "ERC721: invalid token ID");
        RecipeMetadata storage meta = recipeMetadata[tokenId];
        return (meta.tokenURI, meta.isActive, meta.createdAt, meta.updatedAt, meta.price, meta.isForSale, meta.idNFTTokenId, meta.idNFTAccount);
    }

    /**
     * @dev 获取ID NFT拥有的所有Recipe tokenIds
     * @param idNFTTokenId ID NFT的token ID
     * @return tokenIds Recipe token ID数组
     */
    function getRecipeTokensByIDNFT(uint256 idNFTTokenId) external view returns (uint256[] memory) {
        return idNFTToRecipeTokens[idNFTTokenId];
    }

    /**
     * @dev 获取用户通过ID NFT拥有的所有Recipe tokenIds
     * @param user 用户地址
     * @return tokenIds Recipe token ID数组
     */
    function getRecipeTokensByUser(address user) external view returns (uint256[] memory) {
        uint256 idNFTTokenId = idnftContract.getTokenIdByAddress(user);
        if (idNFTTokenId == 0) {
            return new uint256[](0);
        }
        return idNFTToRecipeTokens[idNFTTokenId];
    }

    // Internal helper to check token existence using ownerOf
    function _isValidToken(uint256 tokenId) internal view returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @dev 获取某地址拥有的所有tokenId（现在返回ERC-6551账户拥有的）
     * @param owner ERC-6551账户地址
     * @return tokenIds 该账户拥有的所有tokenId数组
     */
    function getTokenIdsByOwner(address owner) external view returns (uint256[] memory) {
        return ownerToTokenIds[owner];
    }

    /**
     * @dev 获取某地址被授权的所有tokenId
     * @param user 用户地址
     * @return tokenIds 该用户被授权的所有tokenId数组
     */
    function getAuthorizedTokenIdsByUser(address user) external view returns (uint256[] memory) {
        return userToAuthorizedTokenIds[user];
    }

    // ============ ERC-4907 实现 ============

    /**
     * @dev 获取token的当前授权用户
     * @param tokenId NFT的tokenId
     * @return user 当前授权用户地址
     * @return expires 授权过期时间
     */
    function userOf(uint256 tokenId) external view returns (address user, uint64 expires) {
        UserInfo memory info = _users[tokenId];
        return (info.user, info.expires);
    }

    /**
     * @dev 设置token的授权用户（仅ID NFT账户）
     * @param tokenId NFT的tokenId
     * @param user 授权用户地址
     * @param expires 授权过期时间
     */
    function setUser(uint256 tokenId, address user, uint64 expires) external onlyIDNFTAccount(tokenId) {
        require(recipeMetadata[tokenId].isActive, "RecipeNFT: Token is not active");
        require(recipeMetadata[tokenId].isForSale, "RecipeNFT: Token is not for sale");
        require(expires > block.timestamp, "RecipeNFT: Expiration time must be in the future");
        
        UserInfo storage info = _users[tokenId];
        address oldUser = info.user;
        
        // 移除旧用户的授权记录
        if (oldUser != address(0)) {
            _removeUserFromAuthorizedList(oldUser, tokenId);
        }
        
        // 设置新用户
        info.user = user;
        info.expires = expires;
        
        // 添加新用户到授权列表
        if (user != address(0)) {
            userToAuthorizedTokenIds[user].push(tokenId);
        }
        
        emit UserUpdated(tokenId, user, expires);
    }

    /**
     * @dev 移除token的授权用户（仅ID NFT账户）
     * @param tokenId NFT的tokenId
     */
    function removeUser(uint256 tokenId) external onlyIDNFTAccount(tokenId) {
        UserInfo storage info = _users[tokenId];
        address oldUser = info.user;
        
        if (oldUser != address(0)) {
            _removeUserFromAuthorizedList(oldUser, tokenId);
            info.user = address(0);
            info.expires = 0;
            emit UserUpdated(tokenId, address(0), 0);
        }
    }

    /**
     * @dev 内部函数：设置token的授权用户（允许Marketplace调用）
     * @param tokenId NFT的tokenId
     * @param user 授权用户地址
     * @param expires 授权过期时间
     */
    function _setUserInternal(uint256 tokenId, address user, uint64 expires) internal {
        UserInfo storage info = _users[tokenId];
        address oldUser = info.user;
        
        // 移除旧用户的授权记录
        if (oldUser != address(0)) {
            _removeUserFromAuthorizedList(oldUser, tokenId);
        }
        
        // 设置新用户
        info.user = user;
        info.expires = expires;
        
        // 添加新用户到授权列表
        if (user != address(0)) {
            userToAuthorizedTokenIds[user].push(tokenId);
        }
        
        emit UserUpdated(tokenId, user, expires);
    }

    /**
     * @dev 允许Marketplace合约设置token的授权用户
     * @param tokenId NFT的tokenId
     * @param user 授权用户地址
     * @param expires 授权过期时间
     */
    function setUserByMarketplace(uint256 tokenId, address user, uint64 expires) external {
        // 这里可以添加对Marketplace合约的验证
        require(recipeMetadata[tokenId].isActive, "RecipeNFT: Token is not active");
        require(recipeMetadata[tokenId].isForSale, "RecipeNFT: Token is not for sale");
        require(expires > block.timestamp, "RecipeNFT: Expiration time must be in the future");
        
        _setUserInternal(tokenId, user, expires);
    }

    /**
     * @dev 内部函数：从用户的授权列表中移除token
     * @param user 用户地址
     * @param tokenId NFT的tokenId
     */
    function _removeUserFromAuthorizedList(address user, uint256 tokenId) internal {
        uint256[] storage userTokens = userToAuthorizedTokenIds[user];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                // 将最后一个元素移到当前位置，然后删除最后一个元素
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
    }

    /**
     * @dev 检查用户是否有权限访问token的私有信息
     * @param tokenId NFT的tokenId
     * @param user 用户地址
     * @return hasAccess 是否有访问权限
     */
    function hasAccess(uint256 tokenId, address user) external view returns (bool hasAccess) {
        address owner = ownerOf(tokenId);
        if (user == owner) {
            return true;
        }
        
        UserInfo memory info = _users[tokenId];
        return (info.user == user && info.expires > block.timestamp);
    }

    /**
     * @dev 获取所有可授权的Recipe NFT
     * @return tokenIds 可授权的tokenId数组
     */
    function getForSaleTokens() external view returns (uint256[] memory) {
        uint256 count = 0;
        uint256 totalTokens = _tokenIds;
        
        // 先计算数量
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_isValidToken(i) && recipeMetadata[i].isForSale && recipeMetadata[i].isActive) {
                count++;
            }
        }
        
        // 再收集tokenId
        uint256[] memory forSaleTokens = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_isValidToken(i) && recipeMetadata[i].isForSale && recipeMetadata[i].isActive) {
                forSaleTokens[index] = i;
                index++;
            }
        }
        
        return forSaleTokens;
    }
} 