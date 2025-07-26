// Debug script to check ID NFT status
const { ethers } = require("ethers");

async function checkIDNFTStatus() {
    // Your wallet address from the error log
    const userAddress = "0xAA53b750b4Cfb2BBd91CD6a7989a814d1a85ebba";
    
    // Contract addresses from deployment info
    const idnftAddress = "0x5e08cEF902655b2485208b8c72bf5961E3deF0d5";
    const recipeNFTAddress = "0x2AF8d627E7767411093163a8a2bCfEd581f8E98b";
    
    // RPC URL
    const rpcUrl = "https://clean-cool-dust.injective-testnet.quiknode.pro/f2dcf86a3537602a3470aa71713305c63797504d";
    
    // Create provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // IDNFT ABI (minimal for checking)
    const idnftABI = [
        "function hasActiveIDNFT(address user) external view returns (bool)",
        "function getTokenIdByAddress(address user) external view returns (uint256)",
        "function balanceOf(address owner) external view returns (uint256)",
        "function ownerOf(uint256 tokenId) external view returns (address)"
    ];
    
    // RecipeNFT ABI (minimal for checking)
    const recipeNFTABI = [
        "function idnftContract() external view returns (address)"
    ];
    
    try {
        // Create contract instances
        const idnftContract = new ethers.Contract(idnftAddress, idnftABI, provider);
        const recipeNFTContract = new ethers.Contract(recipeNFTAddress, recipeNFTABI, provider);
        
        console.log("=== ID NFT Status Check ===");
        console.log("User Address:", userAddress);
        console.log("IDNFT Contract:", idnftAddress);
        console.log("RecipeNFT Contract:", recipeNFTAddress);
        console.log("");
        
        // Check which IDNFT contract the RecipeNFT is using
        const linkedIDNFTAddress = await recipeNFTContract.idnftContract();
        console.log("RecipeNFT is configured to use IDNFT at:", linkedIDNFTAddress);
        console.log("Does it match our IDNFT?", linkedIDNFTAddress.toLowerCase() === idnftAddress.toLowerCase());
        console.log("");
        
        // Check user's NFT balance
        const balance = await idnftContract.balanceOf(userAddress);
        console.log("User's ID NFT balance:", balance.toString());
        
        if (balance > 0) {
            // Get token ID
            const tokenId = await idnftContract.getTokenIdByAddress(userAddress);
            console.log("User's token ID:", tokenId.toString());
            
            if (tokenId > 0) {
                // Check if user owns the token
                const owner = await idnftContract.ownerOf(tokenId);
                console.log("Token owner:", owner);
                console.log("Is user the owner?", owner.toLowerCase() === userAddress.toLowerCase());
            }
        }
        
        // Check if user has active ID NFT
        const hasActiveIDNFT = await idnftContract.hasActiveIDNFT(userAddress);
        console.log("Has active ID NFT:", hasActiveIDNFT);
        
    } catch (error) {
        console.error("Error checking ID NFT status:", error);
    }
}

checkIDNFTStatus();