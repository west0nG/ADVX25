const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RecipeNFT Contract", function () {
  let RecipeNFT;
  let recipeNFT;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    RecipeNFT = await ethers.getContractFactory("RecipeNFT");
    recipeNFT = await RecipeNFT.deploy("Bars Help Bars Recipe", "BHBR");
    await recipeNFT.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确设置合约名称和符号", async function () {
      expect(await recipeNFT.name()).to.equal("Bars Help Bars Recipe");
      expect(await recipeNFT.symbol()).to.equal("BHBR");
    });
  });

  describe("铸造Recipe NFT", function () {
    const testTokenURI = "ipfs://QmTestRecipeHash123";

    it("任何用户都可以铸造Recipe NFT", async function () {
      const tx = await recipeNFT.connect(user1).mintRecipeNFT(testTokenURI);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === "RecipeNFTCreated");
      expect(event).to.not.be.undefined;
      expect(event.args[0]).to.equal(1n);
      expect(event.args[1]).to.equal(user1.address);
      expect(event.args[2]).to.equal(testTokenURI);
      expect(await recipeNFT.ownerOf(1)).to.equal(user1.address);
      expect(await recipeNFT.tokenURI(1)).to.equal(testTokenURI);
    });

    it("不能铸造空URI的NFT", async function () {
      await expect(
        recipeNFT.connect(user1).mintRecipeNFT("")
      ).to.be.revertedWith("RecipeNFT: Token URI cannot be empty");
    });

    it("不同用户可以铸造不同NFT", async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://Hash1");
      await recipeNFT.connect(user2).mintRecipeNFT("ipfs://Hash2");
      expect(await recipeNFT.ownerOf(1)).to.equal(user1.address);
      expect(await recipeNFT.ownerOf(2)).to.equal(user2.address);
    });

    it("可以查询NFT的元数据URI", async function () {
      await recipeNFT.connect(user1).mintRecipeNFT(testTokenURI);
      expect(await recipeNFT.getTokenURI(1)).to.equal(testTokenURI);
    });
  });
}); 