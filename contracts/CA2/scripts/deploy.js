const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  const recipeNFT = await RecipeNFT.deploy("Bars Help Bars Recipe", "BHBR");
  await recipeNFT.waitForDeployment();

  console.log("RecipeNFT deployed to:", await recipeNFT.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 