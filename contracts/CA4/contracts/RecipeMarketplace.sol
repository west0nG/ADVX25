// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IIDNFT.sol";
import "./interfaces/IRecipeNFT.sol";

/**
 * @title RecipeMarketplace - Recipe NFT授权购买市场合约
 * @dev 实现Recipe NFT的授权购买功能，包括USDT支付和授权管理
 * @author Bars Help Bars Team
 */
contract RecipeMarketplace is Ownable, ReentrancyGuard, Pausable {
    // 状态变量
    uint256 private _transactionIds;
    
    // 合约地址
    IERC20 public usdtToken;
    IIDNFT public idnftContract;
    IRecipeNFT public recipeNFTContract;
    
    // 平台费用比例 (基点: 1% = 100)
    uint256 public platformFeeRate = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // 授权期限 (秒)
    uint64 public defaultAuthorizationDuration = 365 days;
    
    // 交易记录结构
    struct Transaction {
        uint256 transactionId;
        uint256 recipeTokenId;
        address buyer;
        address seller;
        uint256 price;
        uint256 platformFee;
        uint256 sellerAmount;
        uint64 authorizationExpires;
        bool isCompleted;
        uint256 timestamp;
    }
    
    // 映射
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256[]) public userTransactions;
    mapping(uint256 => uint256[]) public recipeTransactions;
    
    // 事件
    event TransactionCreated(
        uint256 indexed transactionId,
        uint256 indexed recipeTokenId,
        address indexed buyer,
        address seller,
        uint256 price,
        uint256 platformFee
    );
    
    event TransactionCompleted(
        uint256 indexed transactionId,
        uint256 indexed recipeTokenId,
        address indexed buyer,
        uint64 authorizationExpires
    );
    
    event TransactionCancelled(
        uint256 indexed transactionId,
        uint256 indexed recipeTokenId,
        address indexed buyer
    );
    
    event PlatformFeeRateUpdated(uint256 oldRate, uint256 newRate);
    event AuthorizationDurationUpdated(uint64 oldDuration, uint64 newDuration);
    event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);
    
    // 修饰符
    modifier onlyIDNFTHolder(address user) {
        require(idnftContract.hasActiveIDNFT(user), "Marketplace: User must have active ID NFT");
        _;
    }
    
    modifier onlyRecipeOwner(uint256 recipeTokenId) {
        require(recipeNFTContract.ownerOf(recipeTokenId) == msg.sender, "Marketplace: Not recipe owner");
        _;
    }
    
    modifier validRecipe(uint256 recipeTokenId) {
        require(recipeNFTContract.ownerOf(recipeTokenId) != address(0), "Marketplace: Recipe does not exist");
        (,,,,, bool isForSale) = recipeNFTContract.getRecipeMetadata(recipeTokenId);
        require(isForSale, "Marketplace: Recipe is not for sale");
        _;
    }
    
    modifier validPrice(uint256 price) {
        require(price > 0, "Marketplace: Price must be greater than 0");
        _;
    }
    
    /**
     * @dev 构造函数
     * @param _usdtToken USDT代币合约地址
     * @param _idnftContract ID NFT合约地址
     * @param _recipeNFTContract Recipe NFT合约地址
     */
    constructor(
        address _usdtToken,
        address _idnftContract,
        address _recipeNFTContract
    ) Ownable(msg.sender) {
        require(_usdtToken != address(0), "Marketplace: Invalid USDT address");
        require(_idnftContract != address(0), "Marketplace: Invalid IDNFT address");
        require(_recipeNFTContract != address(0), "Marketplace: Invalid RecipeNFT address");
        
        usdtToken = IERC20(_usdtToken);
        idnftContract = IIDNFT(_idnftContract);
        recipeNFTContract = IRecipeNFT(_recipeNFTContract);
    }
    
    /**
     * @dev 购买Recipe NFT授权
     * @param recipeTokenId Recipe NFT的token ID
     * @param authorizationDuration 授权期限（秒），0表示使用默认期限
     */
    function purchaseAuthorization(
        uint256 recipeTokenId,
        uint64 authorizationDuration
    ) external nonReentrant whenNotPaused onlyIDNFTHolder(msg.sender) validRecipe(recipeTokenId) {
        // 获取Recipe信息
        (,,,, uint256 price,) = recipeNFTContract.getRecipeMetadata(recipeTokenId);
        require(price > 0, "Marketplace: Recipe price not set");
        
        address seller = recipeNFTContract.ownerOf(recipeTokenId);
        require(seller != msg.sender, "Marketplace: Cannot purchase own recipe");
        
        // 计算费用
        uint256 platformFee = (price * platformFeeRate) / FEE_DENOMINATOR;
        uint256 sellerAmount = price - platformFee;
        
        // 检查用户USDT余额
        require(usdtToken.balanceOf(msg.sender) >= price, "Marketplace: Insufficient USDT balance");
        
        // 检查授权
        require(usdtToken.allowance(msg.sender, address(this)) >= price, "Marketplace: Insufficient USDT allowance");
        
        // 设置授权期限
        uint64 expires = authorizationDuration > 0 ? 
            uint64(block.timestamp + authorizationDuration) : 
            uint64(block.timestamp + defaultAuthorizationDuration);
        
        // 创建交易记录
        _transactionIds++;
        uint256 transactionId = _transactionIds;
        
        Transaction memory newTransaction = Transaction({
            transactionId: transactionId,
            recipeTokenId: recipeTokenId,
            buyer: msg.sender,
            seller: seller,
            price: price,
            platformFee: platformFee,
            sellerAmount: sellerAmount,
            authorizationExpires: expires,
            isCompleted: false,
            timestamp: block.timestamp
        });
        
        transactions[transactionId] = newTransaction;
        userTransactions[msg.sender].push(transactionId);
        userTransactions[seller].push(transactionId);
        recipeTransactions[recipeTokenId].push(transactionId);
        
        emit TransactionCreated(
            transactionId,
            recipeTokenId,
            msg.sender,
            seller,
            price,
            platformFee
        );
        
        // 执行支付
        _processPayment(msg.sender, seller, price, sellerAmount);
        
        // 设置授权
        recipeNFTContract.setUserByMarketplace(recipeTokenId, msg.sender, expires);
        
        // 标记交易完成
        transactions[transactionId].isCompleted = true;
        
        emit TransactionCompleted(transactionId, recipeTokenId, msg.sender, expires);
    }
    
    /**
     * @dev 内部函数：处理支付
     * @param buyer 买家地址
     * @param seller 卖家地址
     * @param totalAmount 总金额
     * @param sellerAmount 卖家应得金额
     */
    function _processPayment(
        address buyer,
        address seller,
        uint256 totalAmount,
        uint256 sellerAmount
    ) internal {
        // 转移USDT到合约
        require(usdtToken.transferFrom(buyer, address(this), totalAmount), "Marketplace: USDT transfer failed");
        
        // 转移USDT给卖家
        if (sellerAmount > 0) {
            require(usdtToken.transfer(seller, sellerAmount), "Marketplace: Seller payment failed");
        }
        
        // 平台费用保留在合约中
    }
    
    /**
     * @dev 获取交易记录
     * @param transactionId 交易ID
     * @return 交易记录
     */
    function getTransaction(uint256 transactionId) external view returns (Transaction memory) {
        require(transactionId > 0 && transactionId <= _transactionIds, "Marketplace: Invalid transaction ID");
        return transactions[transactionId];
    }
    
    /**
     * @dev 获取用户的交易记录
     * @param user 用户地址
     * @return 交易ID数组
     */
    function getUserTransactions(address user) external view returns (uint256[] memory) {
        return userTransactions[user];
    }
    
    /**
     * @dev 获取Recipe的交易记录
     * @param recipeTokenId Recipe NFT的token ID
     * @return 交易ID数组
     */
    function getRecipeTransactions(uint256 recipeTokenId) external view returns (uint256[] memory) {
        return recipeTransactions[recipeTokenId];
    }
    
    /**
     * @dev 检查用户是否有权限访问Recipe的私有信息
     * @param recipeTokenId Recipe NFT的token ID
     * @param user 用户地址
     * @return 是否有访问权限
     */
    function hasAccessToRecipe(uint256 recipeTokenId, address user) external view returns (bool) {
        return recipeNFTContract.hasAccess(recipeTokenId, user);
    }
    
    /**
     * @dev 获取Recipe的授权信息
     * @param recipeTokenId Recipe NFT的token ID
     * @return user 授权用户地址
     * @return expires 授权过期时间
     */
    function getRecipeAuthorization(uint256 recipeTokenId) external view returns (address user, uint64 expires) {
        return recipeNFTContract.userOf(recipeTokenId);
    }
    
    /**
     * @dev 获取可购买的Recipe列表
     * @return tokenIds Recipe NFT的token ID数组
     */
    function getAvailableRecipes() external view returns (uint256[] memory) {
        return recipeNFTContract.getForSaleTokens();
    }
    
    /**
     * @dev 获取Recipe的详细信息
     * @param recipeTokenId Recipe NFT的token ID
     * @return uri 元数据URI
     * @return isActive 是否激活
     * @return createdAt 创建时间
     * @return updatedAt 更新时间
     * @return price 授权价格
     * @return isForSale 是否可授权
     * @return owner 所有者地址
     */
    function getRecipeDetails(uint256 recipeTokenId) external view returns (
        string memory uri,
        bool isActive,
        uint256 createdAt,
        uint256 updatedAt,
        uint256 price,
        bool isForSale,
        address owner
    ) {
        (uri, isActive, createdAt, updatedAt, price, isForSale) = recipeNFTContract.getRecipeMetadata(recipeTokenId);
        owner = recipeNFTContract.ownerOf(recipeTokenId);
    }
    
    // ============ 管理员功能 ============
    
    /**
     * @dev 更新平台费用比例
     * @param newRate 新的费用比例（基点）
     */
    function updatePlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "Marketplace: Fee rate too high"); // 最大10%
        uint256 oldRate = platformFeeRate;
        platformFeeRate = newRate;
        emit PlatformFeeRateUpdated(oldRate, newRate);
    }
    
    /**
     * @dev 更新默认授权期限
     * @param newDuration 新的授权期限（秒）
     */
    function updateAuthorizationDuration(uint64 newDuration) external onlyOwner {
        require(newDuration > 0, "Marketplace: Duration must be greater than 0");
        uint64 oldDuration = defaultAuthorizationDuration;
        defaultAuthorizationDuration = newDuration;
        emit AuthorizationDurationUpdated(oldDuration, newDuration);
    }
    
    /**
     * @dev 暂停合约
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 紧急提取USDT
     * @param to 接收地址
     * @param amount 提取金额
     */
    function emergencyWithdrawUSDT(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Marketplace: Invalid address");
        require(amount > 0, "Marketplace: Amount must be greater than 0");
        require(usdtToken.balanceOf(address(this)) >= amount, "Marketplace: Insufficient balance");
        
        require(usdtToken.transfer(to, amount), "Marketplace: Transfer failed");
        emit EmergencyWithdraw(address(usdtToken), to, amount);
    }
    
    /**
     * @dev 获取合约USDT余额
     * @return 合约USDT余额
     */
    function getContractUSDTBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }
    
    /**
     * @dev 获取总交易数
     * @return 总交易数
     */
    function getTotalTransactions() external view returns (uint256) {
        return _transactionIds;
    }
} 