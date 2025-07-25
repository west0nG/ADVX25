const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RecipeMarketplace", function () {
  let marketplace, mockUSDT, idnft, recipeNFT;
  let owner, seller, buyer, user1, user2;
  let recipeTokenId1, recipeTokenId2;
  const PRICE = ethers.parseUnits("100", 6); // 100 USDT (6位小数)
  const PLATFORM_FEE_RATE = 250; // 2.5%
  const DEFAULT_DURATION = 365 * 24 * 60 * 60; // 365 days

  beforeEach(async function () {
    [owner, seller, buyer, user1, user2] = await ethers.getSigners();

    // 部署模拟USDT
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy("Mock USDT", "mUSDT");

    // 部署ID NFT
    const IDNFT = await ethers.getContractFactory("IDNFT");
    idnft = await IDNFT.deploy("Bar ID NFT", "BIDNFT");

    // 部署Recipe NFT
    const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
    recipeNFT = await RecipeNFT.deploy("Recipe NFT", "RNFT");

    // 部署Marketplace
    const RecipeMarketplace = await ethers.getContractFactory("RecipeMarketplace");
    marketplace = await RecipeMarketplace.deploy(
      await mockUSDT.getAddress(),
      await idnft.getAddress(),
      await recipeNFT.getAddress()
    );

    // 为测试用户铸造USDT
    await mockUSDT.mint(seller.address, ethers.parseUnits("1000", 6));
    await mockUSDT.mint(buyer.address, ethers.parseUnits("1000", 6));

    // 为测试用户创建ID NFT
    await idnft.createIDNFT(seller.address, "ipfs://seller-metadata");
    await idnft.createIDNFT(buyer.address, "ipfs://buyer-metadata");

    // 为卖家铸造Recipe NFT
    const tx1 = await recipeNFT.connect(seller).mintRecipeNFT("ipfs://recipe1-metadata");
    const receipt1 = await tx1.wait();
    recipeTokenId1 = 1; // 第一个铸造的NFT ID为1
    
    const tx2 = await recipeNFT.connect(seller).mintRecipeNFT("ipfs://recipe2-metadata");
    const receipt2 = await tx2.wait();
    recipeTokenId2 = 2; // 第二个铸造的NFT ID为2

    // 设置Recipe价格和上架状态
    await recipeNFT.connect(seller).setPrice(recipeTokenId1, PRICE);
    await recipeNFT.connect(seller).setSaleStatus(recipeTokenId1, true);
    await recipeNFT.connect(seller).setPrice(recipeTokenId2, PRICE);
    await recipeNFT.connect(seller).setSaleStatus(recipeTokenId2, true);
  });

  describe("部署", function () {
    it("应该正确设置合约地址", async function () {
      expect(await marketplace.usdtToken()).to.equal(await mockUSDT.getAddress());
      expect(await marketplace.idnftContract()).to.equal(await idnft.getAddress());
      expect(await marketplace.recipeNFTContract()).to.equal(await recipeNFT.getAddress());
    });

    it("应该设置正确的默认参数", async function () {
      expect(await marketplace.platformFeeRate()).to.equal(PLATFORM_FEE_RATE);
      expect(await marketplace.defaultAuthorizationDuration()).to.equal(DEFAULT_DURATION);
    });
  });

  describe("购买授权", function () {
    beforeEach(async function () {
      // 买家授权Marketplace使用USDT
      await mockUSDT.connect(buyer).approve(await marketplace.getAddress(), PRICE);
    });

    it("应该成功购买Recipe授权", async function () {
      const initialBuyerBalance = await mockUSDT.balanceOf(buyer.address);
      const initialSellerBalance = await mockUSDT.balanceOf(seller.address);
      const initialContractBalance = await mockUSDT.balanceOf(await marketplace.getAddress());

      const tx = await marketplace.connect(buyer).purchaseAuthorization(recipeTokenId1, 0);
      const receipt = await tx.wait();

      // 检查USDT转移
      const platformFee = (PRICE * BigInt(PLATFORM_FEE_RATE)) / BigInt(10000);
      const sellerAmount = PRICE - platformFee;

      expect(await mockUSDT.balanceOf(buyer.address)).to.equal(initialBuyerBalance - PRICE);
      expect(await mockUSDT.balanceOf(seller.address)).to.equal(initialSellerBalance + sellerAmount);
      expect(await mockUSDT.balanceOf(await marketplace.getAddress())).to.equal(initialContractBalance + platformFee);

      // 检查授权设置
      const [authorizedUser, expires] = await recipeNFT.userOf(recipeTokenId1);
      expect(authorizedUser).to.equal(buyer.address);
      expect(expires).to.be.gt(Math.floor(Date.now() / 1000));

      // 检查访问权限
      expect(await recipeNFT.hasAccess(recipeTokenId1, buyer.address)).to.be.true;
    });

    it("应该创建交易记录", async function () {
      const tx = await marketplace.connect(buyer).purchaseAuthorization(recipeTokenId1, 0);
      const receipt = await tx.wait();

      const transaction = await marketplace.getTransaction(1);
      expect(transaction.transactionId).to.equal(1);
      expect(transaction.recipeTokenId).to.equal(recipeTokenId1);
      expect(transaction.buyer).to.equal(buyer.address);
      expect(transaction.seller).to.equal(seller.address);
      expect(transaction.price).to.equal(PRICE);
      expect(transaction.isCompleted).to.be.true;
    });

    it("应该拒绝没有ID NFT的用户购买", async function () {
      await expect(
        marketplace.connect(user1).purchaseAuthorization(recipeTokenId1, 0)
      ).to.be.revertedWith("Marketplace: User must have active ID NFT");
    });

    it("应该拒绝购买自己的Recipe", async function () {
      await mockUSDT.connect(seller).approve(await marketplace.getAddress(), PRICE);
      await expect(
        marketplace.connect(seller).purchaseAuthorization(recipeTokenId1, 0)
      ).to.be.revertedWith("Marketplace: Cannot purchase own recipe");
    });

    it("应该拒绝购买未上架的Recipe", async function () {
      await recipeNFT.connect(seller).setSaleStatus(recipeTokenId1, false);
      await expect(
        marketplace.connect(buyer).purchaseAuthorization(recipeTokenId1, 0)
      ).to.be.revertedWith("Marketplace: Recipe is not for sale");
    });

    it("应该拒绝USDT余额不足的购买", async function () {
      await mockUSDT.connect(buyer).approve(await marketplace.getAddress(), PRICE);
      await mockUSDT.connect(buyer).transfer(owner.address, await mockUSDT.balanceOf(buyer.address));
      
      await expect(
        marketplace.connect(buyer).purchaseAuthorization(recipeTokenId1, 0)
      ).to.be.revertedWith("Marketplace: Insufficient USDT balance");
    });

    it("应该拒绝USDT授权不足的购买", async function () {
      await mockUSDT.connect(buyer).approve(await marketplace.getAddress(), PRICE / 2n);
      
      await expect(
        marketplace.connect(buyer).purchaseAuthorization(recipeTokenId1, 0)
      ).to.be.revertedWith("Marketplace: Insufficient USDT allowance");
    });
  });

  describe("查询功能", function () {
    it("应该正确获取可购买的Recipe列表", async function () {
      const availableRecipes = await marketplace.getAvailableRecipes();
      expect(availableRecipes).to.include(BigInt(recipeTokenId1));
      expect(availableRecipes).to.include(BigInt(recipeTokenId2));
    });

    it("应该正确获取Recipe详细信息", async function () {
      const details = await marketplace.getRecipeDetails(recipeTokenId1);
      expect(details.uri).to.equal("ipfs://recipe1-metadata");
      expect(details.isActive).to.be.true;
      expect(details.price).to.equal(PRICE);
      expect(details.isForSale).to.be.true;
      expect(details.owner).to.equal(seller.address);
    });

    it("应该正确检查访问权限", async function () {
      expect(await marketplace.hasAccessToRecipe(recipeTokenId1, seller.address)).to.be.true;
      expect(await marketplace.hasAccessToRecipe(recipeTokenId1, buyer.address)).to.be.false;
    });
  });

  describe("管理员功能", function () {
    it("应该允许所有者更新平台费用比例", async function () {
      const newRate = 300; // 3%
      await marketplace.updatePlatformFeeRate(newRate);
      expect(await marketplace.platformFeeRate()).to.equal(newRate);
    });

    it("应该拒绝非所有者更新平台费用比例", async function () {
      await expect(
        marketplace.connect(buyer).updatePlatformFeeRate(300)
      ).to.be.revertedWithCustomError(marketplace, "OwnableUnauthorizedAccount");
    });

    it("应该允许所有者更新授权期限", async function () {
      const newDuration = 180 * 24 * 60 * 60; // 180 days
      await marketplace.updateAuthorizationDuration(newDuration);
      expect(await marketplace.defaultAuthorizationDuration()).to.equal(newDuration);
    });

    it("应该允许所有者暂停和恢复合约", async function () {
      await marketplace.pause();
      expect(await marketplace.paused()).to.be.true;

      await marketplace.unpause();
      expect(await marketplace.paused()).to.be.false;
    });

    it("应该允许所有者提取USDT", async function () {
      // 先进行一次购买以产生平台费用
      await mockUSDT.connect(buyer).approve(await marketplace.getAddress(), PRICE);
      await marketplace.connect(buyer).purchaseAuthorization(recipeTokenId1, 0);

      const contractBalance = await mockUSDT.balanceOf(await marketplace.getAddress());
      expect(contractBalance).to.be.gt(0);

      await marketplace.emergencyWithdrawUSDT(owner.address, contractBalance);
      expect(await mockUSDT.balanceOf(await marketplace.getAddress())).to.equal(0);
    });
  });

  describe("事件", function () {
    it("应该发出正确的事件", async function () {
      await mockUSDT.connect(buyer).approve(await marketplace.getAddress(), PRICE);
      
      await expect(marketplace.connect(buyer).purchaseAuthorization(recipeTokenId1, 0))
        .to.emit(marketplace, "TransactionCreated")
        .and.to.emit(marketplace, "TransactionCompleted");
    });
  });
}); 