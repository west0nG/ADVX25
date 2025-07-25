const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RecipeNFT Contract", function () {
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
    });

    it("should return correct metadata via getRecipeMetadata", async function () {
      const [uri, isActive, createdAt, updatedAt] = await recipeNFT.getRecipeMetadata(1);
      expect(uri).to.equal("ipfs://meta1");
      expect(isActive).to.equal(true);
      expect(createdAt).to.be.gt(0);
      expect(updatedAt).to.be.gt(0);
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
  });

  // Placeholders for future features (authorization, pricing, etc.)
  describe("Future Features (placeholders)", function () {
    it("should allow setting and getting price (to be implemented)", async function () {
      // Placeholder for price logic
    });
    it("should allow authorized users to access private data (to be implemented)", async function () {
      // Placeholder for authorization logic
    });
    it("should allow owner to list NFT for sale (to be implemented)", async function () {
      // Placeholder for listing logic
    });
    it("should allow purchase and transfer of usage rights (to be implemented)", async function () {
      // Placeholder for purchase logic
    });
  });
}); 