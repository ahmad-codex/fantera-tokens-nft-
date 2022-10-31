import React from "react";
import { useEffect, useState } from "react";
import {
  connectWallet,
  getCurrentWalletConnected,
  obtainERC20Tokens,
  mintNft,
} from "./util/interact.js";

import logo from "./logo.svg";

const FanteraApp = () => {
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");

  useEffect(async () => {
    const { address, status } = await getCurrentWalletConnected();
    setWallet(address);
    setStatus(status);

    addWalletListener();
  }, []);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Follow the instructions.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onObtainTokenPressed = async () => {
    await obtainERC20Tokens(walletAddress);
  };

  const onMintNftPressed = async () => {
    await mintNft(walletAddress);
  };

  return (
    <div id="container">
      <img id="logo" src={logo}></img>
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <h2 style={{ paddingTop: "50px" }}>Instructions:</h2>
      <ui>
        <li>Connect your wallet 🦊</li>
        <li>Obtain ERC20 tokens</li>
        <li>Mint your NFT ✅</li>
      </ui>

      <button id="btnObtainToken" onClick={onObtainTokenPressed}>
        Obtain ERC-20 token
      </button>

      <button id="btnMintNft" onClick={onMintNftPressed}>
        Mint NFT
      </button>
    </div>
  );
};

export default FanteraApp;
