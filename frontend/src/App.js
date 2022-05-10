import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import './App.css';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
    } catch (e) {
      console.log(e);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        document.querySelector('.dataContainer').innerHTML =
          '<h1>Please Install Metamask! from <a href="https://metamask.io/download/" target="_blank">here</a></h1>';
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
      } else{
        setCurrentAccount('');
      }
    } catch (e) {
      console.log(e);
    }
  };

  const send = async () => {

  }

  useEffect(() => {
    document.title = 'Ethereum Spotify Waveportal';
    setInterval(checkIfWalletIsConnected, 500);
  }, []);

  return (
    <div className="mainContainer">
      {
        currentAccount !== '' ?
          <div className="dataContainer">
            <div title={currentAccount} className="header">
              👋 Welcome, {currentAccount.substr(0, 6)}...{currentAccount.substr(34, 40)}
            </div>

            <div>
              <p className="bio">
                I am Saurav and this is a app that lets you send me a song or a playlist which will be stored on
                the blockchain, pretty cool right? Connect your Ethereum wallet and send me some music!
              </p>
            </div>

            <div className="container">
              <div className="musicInput">
                <input placeholder="share a spotify link" type="text" name="" id="" />
                <div className="greenBorder"></div>
              </div>
              <a className="loginButton" onClick={send} href="#">
                send me music!
              </a>
            </div>
          </div>
          :
          <div>
            <h2>
              No Authorized Account Found!
            </h2>
          </div>
      }

      {
        currentAccount == '' ?
          <button className="connectButton" onClick={connectWallet}>
            Connect Wallet
          </button>
          :
          null
      }
    </div>
  );
}
