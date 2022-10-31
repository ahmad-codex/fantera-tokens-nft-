const { loadFixture, solidity } = require("ethereum-waffle");
const { expect, use } = require("chai");

use(solidity);

const initialSupply = ethers.utils.parseEther("1000000000.0");
const erc20MintAmount = ethers.utils.parseEther("100.0");
const baseNFTUri = "https://gateway.pinata.cloud/ipfs/QmXvcZCPKFA39pJ5XFf2Vz2S6iosJEGJkk44GHJ8WgGEg6/"

// Define a fixture to reuse the same setup in every test.
async function fixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1, account2, account3] = await ethers.getSigners();

    const FanERC20Token = await ethers.getContractFactory("FanERC20Token")
    const fanERC20Token = await FanERC20Token.deploy()
    await fanERC20Token.deployed()

    const FanNFT = await ethers.getContractFactory("FanNFT")
    const fanNFT = await FanNFT.deploy(fanERC20Token.address)
    await fanNFT.deployed()

    return { fanERC20Token, fanNFT, owner, account1, account2, account3 };
}

describe("ERC20 Tests", function () {
    it('Should return the total supply', async () => {
        const { fanERC20Token } = await loadFixture(fixture);

        const supply = await fanERC20Token.totalSupply();
        expect(supply.eq(initialSupply));
    });

    it('Should return the correct initial balance', async () => {
        const { fanERC20Token, owner } = await loadFixture(fixture);

        const balance = await fanERC20Token.balanceOf(owner.address);
        expect(balance.eq(initialSupply));
    });

    it('Should transfer token', async () => {
        const { fanERC20Token, owner, account1 } = await loadFixture(fixture);

        const amount = ethers.utils.parseEther('100');
        const transfer = await fanERC20Token.transfer(account1.address, amount);
        const ownerBalance = await fanERC20Token.balanceOf(owner.address);
        const otherBalance = await fanERC20Token.balanceOf(account1.address);

        expect(ownerBalance.eq(initialSupply.sub(amount)));
        expect(otherBalance.eq(amount));
        expect(transfer).to.emit(fanERC20Token, "Transfer");
    });

    it('Should NOT transfer token if balance is not enough', async () => {
        const { fanERC20Token, account1 } = await loadFixture(fixture);

        const amount = ethers.utils.parseEther('1000000000000');
        await expect(fanERC20Token.transfer(account1.address, amount)).to.be.revertedWith(
            "token balance too low"
        );
    });

    it('Should NOT transfer token if not approved', async () => {
        const { fanERC20Token, account1, account2 } = await loadFixture(fixture);

        const amount = ethers.utils.parseEther('100');
        await fanERC20Token.transfer(account1.address, amount);

        await expect(fanERC20Token.transferFrom(account1.address, account2.address, amount)).to.be.revertedWith(
            "allowance too low"
        );
    });

    it("Should increase total supply when minting new ERC20 tokens", async function () {
        const { fanERC20Token } = await loadFixture(fixture);

        const totalSupplyBefore = await fanERC20Token.totalSupply();
        await fanERC20Token.faucet();
        const totalSupplyAfter = await fanERC20Token.totalSupply();

        expect(erc20MintAmount.eq(totalSupplyAfter.sub(totalSupplyBefore)));
    });

    it("Should send tokens to the trx sender when minting new ERC20 tokens", async function () {
        const { fanERC20Token, owner } = await loadFixture(fixture);

        const balanceBefore = await fanERC20Token.balanceOf(owner.address);
        await fanERC20Token.faucet();
        const balanceAfter = await fanERC20Token.balanceOf(owner.address);

        expect(erc20MintAmount.eq(balanceAfter.sub(balanceBefore)));
    });

    it("Should emit event when minting new ERC20 tokens", async function () {
        const { fanERC20Token, owner } = await loadFixture(fixture);

        const fau = await fanERC20Token.faucet();
        expect(fau).to.emit(fanERC20Token, "Transfer");
    });
});

describe("NFT Tests", function () {
    it('Should NOT transfer if not owner', async () => {
        const { fanNFT, owner, account1 } = await loadFixture(fixture);

        await fanNFT.mintNFT(baseNFTUri + "1");
        await fanNFT.transferFrom(owner.address, account1.address, 1)

        await expect(fanNFT.transferFrom(owner.address, account1.address, 1)).to.be.revertedWith(
            "ERC721: caller is not token owner nor approved"
        );
    });

    it('Should transfer if owner', async () => {
        const { fanNFT, owner, account1 } = await loadFixture(fixture);

        await fanNFT.mintNFT(baseNFTUri + "2");
        const ownerBefore = await fanNFT.ownerOf(2);
        const transfer = await fanNFT.transferFrom(owner.address, account1.address, 2)
        const ownerAfter = await fanNFT.ownerOf(2);

        expect(ownerBefore === owner.address);
        expect(ownerAfter === account1.address);
        expect(transfer).to.emit(fanNFT, "Transfer");
    });

    it('Should mint NFT if owns ERC20 tokens', async () => {
        const { fanERC20Token, fanNFT, owner } = await loadFixture(fixture);

        const erc20Balance = await fanERC20Token.balanceOf(owner.address);
        const balanceBefore = await fanNFT.balanceOf(owner.address);
        const mintNFT1 = await fanNFT.mintNFT(baseNFTUri + "1");
        const mintNFT2 = await fanNFT.mintNFT(baseNFTUri + "2");
        const balanceAfter = await fanNFT.balanceOf(owner.address);
        const owner1 = await fanNFT.ownerOf(1);
        const owner2 = await fanNFT.ownerOf(2);

        expect(erc20Balance.gt(0));
        expect(balanceAfter.sub(balanceBefore).toNumber() === 2);
        expect(owner1 === owner.address);
        expect(owner2 === owner.address);
        expect(mintNFT1).to.emit(fanNFT, "Transfer");
        expect(mintNFT2).to.emit(fanNFT, "Transfer");
    });

    it('Should NOT mint NFT if does not own ERC20 tokens', async () => {
        const { fanERC20Token, fanNFT, owner, account1 } = await loadFixture(fixture);

        // Transfer all ERC20 tokens
        const allTokens = await fanERC20Token.balanceOf(owner.address);
        await fanERC20Token.transfer(account1.address, allTokens);

        await expect(fanNFT.mintNFT(baseNFTUri + "1")).to.be.revertedWith(
            "fanToken balance is 0"
        );
    });
});
