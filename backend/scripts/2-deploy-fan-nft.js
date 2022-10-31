  async function main() {
    const FanNFT = await ethers.getContractFactory("FanNFT");
    const fanNFT = await FanNFT.deploy(process.env.FAN_ERC20_Token_ADDRESS);
    console.log("FAN ERC20 Token address:", process.env.FAN_ERC20_Token_ADDRESS);
    console.log("Contract deployed to address:", fanNFT.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });