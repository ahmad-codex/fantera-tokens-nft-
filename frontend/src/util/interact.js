require("dotenv").config();
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const erc20TokenAddress = '0x0C63d6a64A510dECa0579035ee268b47E399eC2C';
const nftAddress = '0x2F9Cfe81D1B13d7F336123df921f876C137A5De7';

const FanERC20Token = require("../contracts/FanERC20Token.json");
const FanNFT = require("../contracts/FanNFT.json");

export const erc20Contract = new web3.eth.Contract(
    FanERC20Token.abi,
    erc20TokenAddress
);

export const nftContract = new web3.eth.Contract(
    FanNFT.abi,
    nftAddress
);

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const obj = {
                status: "👆🏽 You are connected.",
                address: addressArray[0],
            };
            return obj;
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,
            };
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "}
                        🦊{" "}
                        <a target="_blank" href={`https://metamask.io/download.html`}>
                            You must install Metamask, a virtual Ethereum wallet, in your
                            browser.
                        </a>
                    </p>
                </span>
            ),
        };
    }
};

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            });
            if (addressArray.length > 0) {
                return {
                    address: addressArray[0],
                    status: "👆🏽 You are connected.",
                };
            } else {
                return {
                    address: "",
                    status: "🦊 Connect to Metamask using the top right button.",
                };
            }
        } catch (err) {
            return {
                address: "",
                status: "😥 " + err.message,
            };
        }
    } else {
        return {
            address: "",
            status: (
                <span>
                    <p>
                        {" "}
                        🦊{" "}
                        <a target="_blank" href={`https://metamask.io/download.html`}>
                            You must install Metamask, a virtual Ethereum wallet, in your
                            browser.
                        </a>
                    </p>
                </span>
            ),
        };
    }
};

export const obtainERC20Tokens = async (address) => {
    if (!window.ethereum || address === null) {
        return {
            status:
                "💡 Connect your Metamask wallet to update the message on the blockchain.",
        };
    }

    //set up transaction parameters
    const transactionParameters = {
        to: erc20TokenAddress, // Required except during contract publications.
        from: address, // must match user's active address.
        data: erc20Contract.methods.faucet().encodeABI(),
    };

    //sign the transaction
    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParameters],
        });
        return {
            status: (
                <span>
                    ✅{" "}
                    <a target="_blank" href={`https://goerli.etherscan.io/tx/${txHash}`}>
                        View the status of your transaction on Etherscan!
                    </a>
                    <br />
                </span>
            ),
        };
    } catch (error) {
        return {
            status: "😥 " + error.message,
        };
    }
};

export const mintNft = async (address) => {
    if (!window.ethereum || address === null) {
        return {
            status:
                "💡 Connect your Metamask wallet to update the message on the blockchain.",
        };
    }

    const baseTokenUri = "https://gateway.pinata.cloud/ipfs/QmXvcZCPKFA39pJ5XFf2Vz2S6iosJEGJkk44GHJ8WgGEg6/"
    let tokenId = randonNum(5);

    //set up transaction parameters
    const transactionParameters = {
        to: nftAddress, // Required except during contract publications.
        from: address, // must match user's active address.
        data: nftContract.methods.mintNFT(baseTokenUri + tokenId.toString()).encodeABI(),
    };

    //sign the transaction
    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParameters],
        });
        return {
            status: (
                <span>
                    ✅{" "}
                    <a target="_blank" href={`https://goerli.etherscan.io/tx/${txHash}`}>
                        View the status of your transaction on Etherscan!
                    </a>
                    <br />
                </span>
            ),
        };
    } catch (error) {
        return {
            status: "😥 " + error.message,
        };
    }
};

const randonNum = (max) => {
    const rnd = Math.floor(Math.random() * max) + 1;
    return rnd;
}