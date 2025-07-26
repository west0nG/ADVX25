const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CA4 Public Permissions Test", function () {
  let mockUSDT, idnft, recipeNFT, marketplace;
  let owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // 部署合约
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy("Mock USDT", "mUSDT");
    await mockUSDT.waitForDeployment();

    const IDNFT6551 = await ethers.getContractFactory("IDNFT6551");
    idnft = await IDNFT6551.deploy("Bars Help Bars ID", "BHBI");
    await idnft.waitForDeployment();

    const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
    recipeNFT = await RecipeNFT.deploy("Bars Help Bars Recipe", "BHBR", await idnft.getAddress());
    await recipeNFT.waitForDeployment();

    const RecipeMarketplace = await ethers.getContractFactory("RecipeMarketplace");
    marketplace = await RecipeMarketplace.deploy(
      await mockUSDT.getAddress(),
      await idnft.getAddress(),
      await recipeNFT.getAddress()
    );
    await marketplace.waitForDeployment();
  });

  describe("MockUSDT - Public Minting", function () {
    it("should allow any user to mint USDT", async function () {
      const amount = ethers.parseUnits("1000", 6);
      
      // user1 铸造USDT给自己
      await mockUSDT.connect(user1).mint(user1.address, amount);
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(amount);
      
      // user2 铸造USDT给user3
      await mockUSDT.connect(user2).mint(user3.address, amount);
      expect(await mockUSDT.balanceOf(user3.address)).to.equal(amount);
    });

    it("should allow any user to burn USDT", async function () {
      const amount = ethers.parseUnits("1000", 6);
      
      // 先铸造一些USDT
      await mockUSDT.connect(user1).mint(user1.address, amount);
      
      // user2 销毁user1的USDT
      await mockUSDT.connect(user2).burn(user1.address, amount);
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(0);
    });
  });

  describe("IDNFT6551 - Public Creation", function () {
    it("should allow any user to create ID NFT", async function () {
      const uri = "ipfs://QmTestIDNFT123456789";
      
      // user1 为user2创建ID NFT
      await idnft.connect(user1).createIDNFT(user2.address, uri);
      expect(await idnft.ownerOf(1)).to.equal(user2.address);
      expect(await idnft.getTokenIdByAddress(user2.address)).to.equal(1);
    });

    it("should allow any user to set Injective mode", async function () {
      // user1 设置Injective模式
      await idnft.connect(user1).setInjectiveMode(true);
      expect(await idnft.injectiveMode()).to.be.true;
      
      // user2 关闭Injective模式
      await idnft.connect(user2).setInjectiveMode(false);
      expect(await idnft.injectiveMode()).to.be.false;
    });
  });

  describe("RecipeNFT - Public Configuration", function () {
    beforeEach(async function () {
      // 创建ID NFT
      await idnft.connect(user1).createIDNFT(user1.address, "ipfs://test");
      await idnft.connect(user2).createIDNFT(user2.address, "ipfs://test");
      
      // 铸造Recipe NFT
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://recipe1");
      await recipeNFT.connect(user2).mintRecipeNFT("ipfs://recipe2");
    });

    it("should allow any user to set ID NFT contract", async function () {
      const newContract = await ethers.getSigner(3);
      
      // user1 设置新的ID NFT合约地址
      await recipeNFT.connect(user1).setIDNFTContract(newContract.address);
      expect(await recipeNFT.idnftContract()).to.equal(newContract.address);
    });
  });

  describe("RecipeMarketplace - Public Administration", function () {
    it("should allow any user to update platform fee rate", async function () {
      // user1 更新平台费用比例
      await marketplace.connect(user1).updatePlatformFeeRate(300); // 3%
      expect(await marketplace.platformFeeRate()).to.equal(300);
      
      // user2 再次更新
      await marketplace.connect(user2).updatePlatformFeeRate(500); // 5%
      expect(await marketplace.platformFeeRate()).to.equal(500);
    });

    it("should allow any user to update authorization duration", async function () {
      // user1 更新授权期限
      await marketplace.connect(user1).updateAuthorizationDuration(180 days);
      expect(await marketplace.defaultAuthorizationDuration()).to.equal(180 days);
      
      // user2 再次更新
      await marketplace.connect(user2).updateAuthorizationDuration(365 days);
      expect(await marketplace.defaultAuthorizationDuration()).to.equal(365 days);
    });

    it("should allow any user to pause/unpause contract", async function () {
      // user1 暂停合约
      await marketplace.connect(user1).pause();
      expect(await marketplace.paused()).to.be.true;
      
      // user2 恢复合约
      await marketplace.connect(user2).unpause();
      expect(await marketplace.paused()).to.be.false;
    });

    it("should allow any user to emergency withdraw USDT", async function () {
      const amount = ethers.parseUnits("1000", 6);
      
      // 铸造USDT到marketplace
      await mockUSDT.connect(user1).mint(await marketplace.getAddress(), amount);
      
      // user2 紧急提款
      await marketplace.connect(user2).emergencyWithdrawUSDT(user3.address, amount);
      expect(await mockUSDT.balanceOf(user3.address)).to.equal(amount);
    });
  });

  describe("Complete Workflow Test", function () {
    it("should allow complete workflow with public permissions", async function () {
      // 1. 用户铸造USDT
      const usdtAmount = ethers.parseUnits("10000", 6);
      await mockUSDT.connect(user1).mint(user1.address, usdtAmount);
      await mockUSDT.connect(user2).mint(user2.address, usdtAmount);
      
      // 2. 用户创建ID NFT
      await idnft.connect(user1).createIDNFT(user1.address, "ipfs://user1-id");
      await idnft.connect(user2).createIDNFT(user2.address, "ipfs://user2-id");
      
      // 3. 用户铸造Recipe NFT
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://recipe1");
      await recipeNFT.connect(user2).mintRecipeNFT("ipfs://recipe2");
      
      // 4. 设置Recipe为可授权状态
      const price = ethers.parseUnits("10", 6);
      await recipeNFT.connect(user1).setPrice(1, price);
      await recipeNFT.connect(user1).setSaleStatus(1, true);
      
      // 5. 用户购买授权
      await mockUSDT.connect(user2).approve(await marketplace.getAddress(), price);
      await marketplace.connect(user2).purchaseRecipeAuthorization(1);
      
      // 6. 验证授权
      const [authorizedUser, expires] = await recipeNFT.userOf(1);
      expect(authorizedUser).to.equal(user2.address);
      expect(expires).to.be.gt(0);
      
      // 7. 验证访问权限
      expect(await recipeNFT.hasAccess(1, user2.address)).to.be.true;
    });
  });
}); 