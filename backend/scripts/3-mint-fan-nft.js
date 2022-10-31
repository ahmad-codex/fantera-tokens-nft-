// Get Alchemy API Key
const API_KEY = process.env.API_KEY;

// Define an Alchemy Provider
const provider = new ethers.providers.AlchemyProvider('goerli', API_KEY);
const contract = require("../artifacts/contracts/FanNFT.sol/FanNFT.json");

// Create a signer
const privateKey = process.env.PRIVATE_KEY
const signer = new ethers.Wallet(privateKey, provider)

// Get contract ABI and address
const abi = contract.abi
const contractAddress = process.env.FAN_NFT_ADDRESS;

// Create a contract instance
const nftContract = new ethers.Contract(contractAddress, abi, signer)

// Get the NFT Metadata IPFS Base URL
const baseTokenUri = "https://gateway.pinata.cloud/ipfs/QmXvcZCPKFA39pJ5XFf2Vz2S6iosJEGJkk44GHJ8WgGEg6/"

const mintNFT = async () => {
    let tokenId = randonNum(5);
    let nftTxn = await nftContract.mintNFT(baseTokenUri + tokenId.toString())
    await nftTxn.wait()
    console.log(`NFT Minted! Check it out at: https://goerli.etherscan.io/tx/${nftTxn.hash}`)
}

const randonNum = (max) => {
    const rnd = Math.floor(Math.random() * max) + 1;
    return rnd;
}

mintNFT()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });