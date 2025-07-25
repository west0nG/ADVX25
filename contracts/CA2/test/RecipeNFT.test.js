const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RecipeNFT Contract (ERC-4907)", function () {
  let RecipeNFT, recipeNFT, owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    RecipeNFT = await ethers.getContractFactory("RecipeNFT");
    recipeNFT = await RecipeNFT.deploy("Bars Help Bars Recipe", "BHBR");
    await recipeNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      expect(await recipeNFT.name()).to.equal("Bars Help Bars Recipe");
      expect(await recipeNFT.symbol()).to.equal("BHBR");
    });
    it("should start with zero tokens", async function () {
      await expect(recipeNFT.ownerOf(1)).to.be.reverted;
    });
  });

  describe("Minting", function () {
    it("should allow any user to mint a Recipe NFT", async function () {
      const uri = "ipfs://QmTestRecipeHash1";
      await expect(recipeNFT.connect(user1).mintRecipeNFT(uri))
        .to.emit(recipeNFT, "RecipeNFTCreated")
        .withArgs(1, user1.address, uri);
      expect(await recipeNFT.ownerOf(1)).to.equal(user1.address);
      expect(await recipeNFT.tokenURI(1)).to.equal(uri);
    });

    it("should increment tokenId for each mint", async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://1");
      await recipeNFT.connect(user2).mintRecipeNFT("ipfs://2");
      expect(await recipeNFT.ownerOf(1)).to.equal(user1.address);
      expect(await recipeNFT.ownerOf(2)).to.equal(user2.address);
    });

    it("should not allow minting with empty URI", async function () {
      await expect(recipeNFT.connect(user1).mintRecipeNFT(""))
        .to.be.revertedWith("RecipeNFT: Token URI cannot be empty");
    });

    it("should allow the same user to mint multiple NFTs", async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://1");
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://2");
      expect(await recipeNFT.ownerOf(1)).to.equal(user1.address);
      expect(await recipeNFT.ownerOf(2)).to.equal(user1.address);
    });
  });

  describe("Metadata and State", function () {
    beforeEach(async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://meta1");
    });

    it("should store metadata with correct fields", async function () {
      const meta = await recipeNFT.recipeMetadata(1);
      expect(meta.tokenURI).to.equal("ipfs://meta1");
      expect(meta.isActive).to.equal(true);
      expect(meta.createdAt).to.be.gt(0);
      expect(meta.updatedAt).to.be.gt(0);
      expect(meta.price).to.equal(0);
      expect(meta.isForSale).to.equal(false);
    });

    it("should return correct metadata via getRecipeMetadata", async function () {
      const [uri, isActive, createdAt, updatedAt, price, isForSale] = await recipeNFT.getRecipeMetadata(1);
      expect(uri).to.equal("ipfs://meta1");
      expect(isActive).to.equal(true);
      expect(createdAt).to.be.gt(0);
      expect(updatedAt).to.be.gt(0);
      expect(price).to.equal(0);
      expect(isForSale).to.equal(false);
    });

    it("should return correct token URI via getTokenURI", async function () {
      expect(await recipeNFT.getTokenURI(1)).to.equal("ipfs://meta1");
    });

    it("should return all tokenIds owned by an address", async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://meta2");
      const tokenIds = await recipeNFT.getTokenIdsByOwner(user1.address);
      // Convert BigNumber/BigInt to Number for assertion
      const tokenIdNums = tokenIds.map(t => Number(t));
      expect(tokenIdNums).to.include(1);
      expect(tokenIdNums).to.include(2);
    });

    it("should return empty array for address with no tokens", async function () {
      const tokenIds = await recipeNFT.getTokenIdsByOwner(user2.address);
      expect(tokenIds.length).to.equal(0);
    });
  });

  describe("Ownership and Access Control", function () {
    beforeEach(async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://meta1");
    });

    it("should not allow non-owner to update metadata", async function () {
      await expect(
        recipeNFT.connect(user2).updateTokenURI(1, "ipfs://new")
      ).to.be.revertedWith("RecipeNFT: Not the token owner");
    });

    it("should not allow non-owner to deactivate/reactivate", async function () {
      await expect(
        recipeNFT.connect(user2).deactivateRecipeNFT(1)
      ).to.be.revertedWith("RecipeNFT: Not the token owner");
      await expect(
        recipeNFT.connect(user2).reactivateRecipeNFT(1)
      ).to.be.revertedWith("RecipeNFT: Not the token owner");
    });
  });

  describe("Activation/Deactivation/Reactivate", function () {
    beforeEach(async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://meta1");
    });

    it("should allow owner to deactivate NFT", async function () {
      await expect(recipeNFT.connect(user1).deactivateRecipeNFT(1))
        .to.emit(recipeNFT, "RecipeNFTDeactivated")
        .withArgs(1);
      const meta = await recipeNFT.recipeMetadata(1);
      expect(meta.isActive).to.equal(false);
    });

    it("should not allow deactivation if already inactive", async function () {
      await recipeNFT.connect(user1).deactivateRecipeNFT(1);
      await expect(
        recipeNFT.connect(user1).deactivateRecipeNFT(1)
      ).to.be.revertedWith("RecipeNFT: Token is not active");
    });

    it("should allow owner to reactivate NFT", async function () {
      await recipeNFT.connect(user1).deactivateRecipeNFT(1);
      await expect(recipeNFT.connect(user1).reactivateRecipeNFT(1))
        .to.emit(recipeNFT, "RecipeNFTReactivated")
        .withArgs(1);
      const meta = await recipeNFT.recipeMetadata(1);
      expect(meta.isActive).to.equal(true);
    });

    it("should not allow reactivation if already active", async function () {
      await expect(
        recipeNFT.connect(user1).reactivateRecipeNFT(1)
      ).to.be.revertedWith("RecipeNFT: Token is already active");
    });
  });

  describe("Metadata Update", function () {
    beforeEach(async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://meta1");
    });

    it("should allow owner to update metadata when active", async function () {
      await expect(recipeNFT.connect(user1).updateTokenURI(1, "ipfs://new"))
        .to.emit(recipeNFT, "RecipeMetadataUpdated")
        .withArgs(1, "ipfs://new");
      expect(await recipeNFT.tokenURI(1)).to.equal("ipfs://new");
      const meta = await recipeNFT.recipeMetadata(1);
      expect(meta.tokenURI).to.equal("ipfs://new");
    });

    it("should not allow update with empty URI", async function () {
      await expect(
        recipeNFT.connect(user1).updateTokenURI(1, "")
      ).to.be.revertedWith("RecipeNFT: Token URI cannot be empty");
    });

    it("should not allow update when deactivated", async function () {
      await recipeNFT.connect(user1).deactivateRecipeNFT(1);
      await expect(
        recipeNFT.connect(user1).updateTokenURI(1, "ipfs://new")
      ).to.be.revertedWith("RecipeNFT: Token is not active");
    });

    it("should update updatedAt timestamp on metadata update", async function () {
      const metaBefore = await recipeNFT.recipeMetadata(1);
      await recipeNFT.connect(user1).updateTokenURI(1, "ipfs://new");
      const metaAfter = await recipeNFT.recipeMetadata(1);
      expect(metaAfter.updatedAt).to.be.gt(metaBefore.updatedAt);
    });
  });

  describe("Pricing and Sale Status", function () {
    beforeEach(async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://meta1");
    });

    it("should allow owner to set price", async function () {
      const price = ethers.parseEther("100"); // 100 USDT
      await expect(recipeNFT.connect(user1).setPrice(1, price))
        .to.emit(recipeNFT, "PriceSet")
        .withArgs(1, price);
      
      const meta = await recipeNFT.recipeMetadata(1);
      expect(meta.price).to.equal(price);
    });

    it("should not allow non-owner to set price", async function () {
      const price = ethers.parseEther("100");
      await expect(
        recipeNFT.connect(user2).setPrice(1, price)
      ).to.be.revertedWith("RecipeNFT: Not the token owner");
    });

    it("should not allow setting price for inactive token", async function () {
      await recipeNFT.connect(user1).deactivateRecipeNFT(1);
      const price = ethers.parseEther("100");
      await expect(
        recipeNFT.connect(user1).setPrice(1, price)
      ).to.be.revertedWith("RecipeNFT: Token is not active");
    });

    it("should allow owner to set sale status", async function () {
      await expect(recipeNFT.connect(user1).setSaleStatus(1, true))
        .to.emit(recipeNFT, "SaleStatusChanged")
        .withArgs(1, true);
      
      const meta = await recipeNFT.recipeMetadata(1);
      expect(meta.isForSale).to.equal(true);
    });

    it("should not allow non-owner to set sale status", async function () {
      await expect(
        recipeNFT.connect(user2).setSaleStatus(1, true)
      ).to.be.revertedWith("RecipeNFT: Not the token owner");
    });

    it("should not allow setting sale status for inactive token", async function () {
      await recipeNFT.connect(user1).deactivateRecipeNFT(1);
      await expect(
        recipeNFT.connect(user1).setSaleStatus(1, true)
      ).to.be.revertedWith("RecipeNFT: Token is not active");
    });
  });

  describe("ERC-4907 User Authorization", function () {
    beforeEach(async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://meta1");
      await recipeNFT.connect(user1).setSaleStatus(1, true);
    });

    it("should return zero address and zero expires for token without user", async function () {
      const [user, expires] = await recipeNFT.userOf(1);
      expect(user).to.equal(ethers.ZeroAddress);
      expect(expires).to.equal(0);
    });

    it("should allow owner to set user", async function () {
      const expires = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      await expect(recipeNFT.connect(user1).setUser(1, user2.address, expires))
        .to.emit(recipeNFT, "UserUpdated")
        .withArgs(1, user2.address, expires);
      
      const [user, userExpires] = await recipeNFT.userOf(1);
      expect(user).to.equal(user2.address);
      expect(userExpires).to.equal(expires);
    });

    it("should not allow non-owner to set user", async function () {
      const expires = Math.floor(Date.now() / 1000) + 3600;
      await expect(
        recipeNFT.connect(user2).setUser(1, user3.address, expires)
      ).to.be.revertedWith("RecipeNFT: Not the token owner");
    });

    it("should not allow setting user for inactive token", async function () {
      await recipeNFT.connect(user1).deactivateRecipeNFT(1);
      const expires = Math.floor(Date.now() / 1000) + 3600;
      await expect(
        recipeNFT.connect(user1).setUser(1, user2.address, expires)
      ).to.be.revertedWith("RecipeNFT: Token is not active");
    });

    it("should not allow setting user for token not for sale", async function () {
      await recipeNFT.connect(user1).setSaleStatus(1, false);
      const expires = Math.floor(Date.now() / 1000) + 3600;
      await expect(
        recipeNFT.connect(user1).setUser(1, user2.address, expires)
      ).to.be.revertedWith("RecipeNFT: Token is not for sale");
    });

    it("should not allow setting user with past expiration", async function () {
      const expires = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      await expect(
        recipeNFT.connect(user1).setUser(1, user2.address, expires)
      ).to.be.revertedWith("RecipeNFT: Expiration time must be in the future");
    });

    it("should allow owner to remove user", async function () {
      const expires = Math.floor(Date.now() / 1000) + 3600;
      await recipeNFT.connect(user1).setUser(1, user2.address, expires);
      
      await expect(recipeNFT.connect(user1).removeUser(1))
        .to.emit(recipeNFT, "UserUpdated")
        .withArgs(1, ethers.ZeroAddress, 0);
      
      const [user, userExpires] = await recipeNFT.userOf(1);
      expect(user).to.equal(ethers.ZeroAddress);
      expect(userExpires).to.equal(0);
    });

    it("should not allow non-owner to remove user", async function () {
      const expires = Math.floor(Date.now() / 1000) + 3600;
      await recipeNFT.connect(user1).setUser(1, user2.address, expires);
      
      await expect(
        recipeNFT.connect(user2).removeUser(1)
      ).to.be.revertedWith("RecipeNFT: Not the token owner");
    });

    it("should update authorized user list when setting user", async function () {
      const expires = Math.floor(Date.now() / 1000) + 3600;
      await recipeNFT.connect(user1).setUser(1, user2.address, expires);
      
      const authorizedTokens = await recipeNFT.getAuthorizedTokenIdsByUser(user2.address);
      expect(authorizedTokens.length).to.equal(1);
      expect(Number(authorizedTokens[0])).to.equal(1);
    });

    it("should remove from authorized user list when removing user", async function () {
      const expires = Math.floor(Date.now() / 1000) + 3600;
      await recipeNFT.connect(user1).setUser(1, user2.address, expires);
      await recipeNFT.connect(user1).removeUser(1);
      
      const authorizedTokens = await recipeNFT.getAuthorizedTokenIdsByUser(user2.address);
      expect(authorizedTokens.length).to.equal(0);
    });

    it("should replace existing user when setting new user", async function () {
      const expires1 = Math.floor(Date.now() / 1000) + 3600;
      const expires2 = Math.floor(Date.now() / 1000) + 7200;
      
      await recipeNFT.connect(user1).setUser(1, user2.address, expires1);
      await recipeNFT.connect(user1).setUser(1, user3.address, expires2);
      
      const [user, expires] = await recipeNFT.userOf(1);
      expect(user).to.equal(user3.address);
      expect(expires).to.equal(expires2);
      
      // Check that user2 is removed from authorized list
      const user2Tokens = await recipeNFT.getAuthorizedTokenIdsByUser(user2.address);
      expect(user2Tokens.length).to.equal(0);
      
      // Check that user3 is added to authorized list
      const user3Tokens = await recipeNFT.getAuthorizedTokenIdsByUser(user3.address);
      expect(user3Tokens.length).to.equal(1);
      expect(Number(user3Tokens[0])).to.equal(1);
    });
  });

  describe("Access Control", function () {
    beforeEach(async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://meta1");
      await recipeNFT.connect(user1).setSaleStatus(1, true);
    });

    it("should return true for token owner", async function () {
      expect(await recipeNFT.hasAccess(1, user1.address)).to.equal(true);
    });

    it("should return false for unauthorized user", async function () {
      expect(await recipeNFT.hasAccess(1, user2.address)).to.equal(false);
    });

    it("should return true for authorized user before expiration", async function () {
      const expires = Math.floor(Date.now() / 1000) + 3600;
      await recipeNFT.connect(user1).setUser(1, user2.address, expires);
      expect(await recipeNFT.hasAccess(1, user2.address)).to.equal(true);
    });

    it("should return false for authorized user after expiration", async function () {
      // Set expiration to 1 second from now
      const expires = Math.floor(Date.now() / 1000) + 1;
      await recipeNFT.connect(user1).setUser(1, user2.address, expires);
      
      // Check access is granted before expiration
      expect(await recipeNFT.hasAccess(1, user2.address)).to.equal(true);
      
      // Wait for expiration (2 seconds to be safe)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check access is revoked after expiration
      expect(await recipeNFT.hasAccess(1, user2.address)).to.equal(false);
    });
  });

  describe("Marketplace Functions", function () {
    beforeEach(async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://meta1");
      await recipeNFT.connect(user2).mintRecipeNFT("ipfs://meta2");
      await recipeNFT.connect(user1).setSaleStatus(1, true);
      await recipeNFT.connect(user2).setSaleStatus(2, true);
    });

    it("should return all tokens for sale", async function () {
      const forSaleTokens = await recipeNFT.getForSaleTokens();
      expect(forSaleTokens.length).to.equal(2);
      
      const tokenIds = forSaleTokens.map(t => Number(t));
      expect(tokenIds).to.include(1);
      expect(tokenIds).to.include(2);
    });

    it("should not include inactive tokens in for sale list", async function () {
      await recipeNFT.connect(user1).deactivateRecipeNFT(1);
      const forSaleTokens = await recipeNFT.getForSaleTokens();
      expect(forSaleTokens.length).to.equal(1);
      expect(Number(forSaleTokens[0])).to.equal(2);
    });

    it("should not include tokens not for sale in for sale list", async function () {
      await recipeNFT.connect(user1).setSaleStatus(1, false);
      const forSaleTokens = await recipeNFT.getForSaleTokens();
      expect(forSaleTokens.length).to.equal(1);
      expect(Number(forSaleTokens[0])).to.equal(2);
    });
  });

  describe("Multiple Users and Tokens", function () {
    it("should allow multiple users to mint and manage their own NFTs", async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://u1-1");
      await recipeNFT.connect(user2).mintRecipeNFT("ipfs://u2-1");
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://u1-2");
      expect(await recipeNFT.ownerOf(1)).to.equal(user1.address);
      expect(await recipeNFT.ownerOf(2)).to.equal(user2.address);
      expect(await recipeNFT.ownerOf(3)).to.equal(user1.address);

      const u1Tokens = await recipeNFT.getTokenIdsByOwner(user1.address);
      const u1TokenNums = u1Tokens.map(t => Number(t));
      expect(u1TokenNums).to.include(1);
      expect(u1TokenNums).to.include(3);

      const u2Tokens = await recipeNFT.getTokenIdsByOwner(user2.address);
      const u2TokenNums = u2Tokens.map(t => Number(t));
      expect(u2TokenNums).to.include(2);
    });

    it("should keep ownerToTokenIds mapping up to date", async function () {
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://u1-1");
      await recipeNFT.connect(user1).mintRecipeNFT("ipfs://u1-2");
      const tokens = await recipeNFT.getTokenIdsByOwner(user1.address);
      expect(tokens.length).to.equal(2);
    });
  });

  describe("Security and Validation", function () {
    it("should revert on querying metadata for nonexistent token", async function () {
      await expect(recipeNFT.getRecipeMetadata(999)).to.be.revertedWith("ERC721: invalid token ID");
    });

    it("should revert on querying tokenURI for nonexistent token", async function () {
      await expect(recipeNFT.getTokenURI(999)).to.be.reverted;
    });

    it("should revert on deactivating nonexistent token", async function () {
      await expect(recipeNFT.connect(user1).deactivateRecipeNFT(999)).to.be.reverted;
    });

    it("should revert on updating metadata for nonexistent token", async function () {
      await expect(recipeNFT.connect(user1).updateTokenURI(999, "ipfs://fail")).to.be.reverted;
    });

    it("should revert on setting price for nonexistent token", async function () {
      await expect(recipeNFT.connect(user1).setPrice(999, ethers.parseEther("100"))).to.be.reverted;
    });

    it("should revert on setting user for nonexistent token", async function () {
      const expires = Math.floor(Date.now() / 1000) + 3600;
      await expect(recipeNFT.connect(user1).setUser(999, user2.address, expires)).to.be.reverted;
    });
  });
});