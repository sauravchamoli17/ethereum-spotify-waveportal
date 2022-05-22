import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from './utils/WavePortal.json';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isWaveExecuting, setIsWaveExecuting] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const contractAddress = '0xc4Cd80D53bb3ad575dAb15bdcdAC5fe1Ba25E979';
  const contractABI = abi.abi;

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
    } catch (e) {
      console.log(e);
    }
  };

  const validateLink = (link) => {
    let pattern = /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/playlist\/))(.*)$/mg;
    let verified = pattern.test(link);
    return verified;
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
      } else {
        setCurrentAccount('');
      }
    } catch (e) {
      console.log(e);
    }
  }

  const getRecommendations = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        let allRecommendations = await wavePortalContract.getRecommendations();
        let recommendationsCleaned = [];
        allRecommendations.forEach(recommendation => {
          recommendationsCleaned.push({
            address: recommendation.waver,
            timestamp: new Date(recommendation.timestamp * 1000),
            link: recommendation.musicLink
          });
        });
        recommendationsCleaned.reverse();
        setRecommendations(recommendationsCleaned);
      } else {
        console.log("ethereum object doesn't exist!");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const send = async () => {
    try {
      var link = document.getElementById('spotifyLink');
      let linkValue = link.value;
      if (validateLink(linkValue)) {
        if (!isWaveExecuting) {
          link.disabled = true;
          setIsWaveExecuting(true);
          const { ethereum } = window;
          if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
            const waveTxn = await wavePortalContract.sendRecommendation(linkValue, { gasLimit: 300000 });
            console.log("Mining...", waveTxn.hash);
            await waveTxn.wait();
            console.log("Mined -- ", waveTxn.hash);
            link.disabled = false;
            link.value = '';
            toast.success('You have successfully send me a recommendation!', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              transition: Slide,
              theme: 'colored'
            });
            let allRecommendations = await wavePortalContract.getRecommendations();
            let recommendationsCleaned = [];
            allRecommendations.forEach(recommendation => {
              recommendationsCleaned.push({
                address: recommendation.waver,
                timestamp: new Date(recommendation.timestamp * 1000),
                link: recommendation.musicLink
              });
            });
            recommendationsCleaned.reverse();
            setRecommendations(recommendationsCleaned);
            setIsWaveExecuting(false);
          } else {
            console.log("ethereum object doesn't exist!");
          }
        } else {
          toast.error("Woah! Too many clicks on send button! Slow down, let this transaction complete!", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            transition: Slide,
            theme: 'colored'
          });
        }
      } else {
        toast.error("Doesn't seem like a spotify song link!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          transition: Slide,
          theme: 'colored'
        });
      }
    } catch (e) {
      console.log(e);
      link.disabled = false;
      setIsWaveExecuting(false);
    }
  }

  useEffect(() => {
    document.title = 'Ethereum Spotify Waveportal';
    setInterval(checkIfWalletIsConnected, 500);
    async function fetchData() {
      await getRecommendations();
    }
    fetchData();
  }, []);

  useEffect(() => {
    let wavePortalContract;
    const onNewRecommendation = (from, timestamp, link) => {
      console.log("NewWave", from, timestamp, link);
      let temp = {address: from, timestamp: new Date(timestamp * 1000), link: link};
      setRecommendations(prevState => [
        temp,
        ...prevState
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewRecommendation", onNewRecommendation);
    }
  
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewRecommendation", onNewRecommendation);
      }
    };
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
                I am Saurav and this is a app that lets you send me a song and if you're lucky you might get
                some ETH, pretty cool right? Connect your Ethereum wallet and send me some music!
              </p>
            </div>

            <div className="container">
              <div className="musicInput">
                <input autoComplete="off" placeholder="share a spotify link" type="text" name="spotify_link" id="spotifyLink" />
                <div className="greenBorder"></div>
              </div>
              <button className="loginButton" onClick={send} href="#">
                send me music!
              </button>
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

      {
        recommendations.length > 0 ?
        <h2 style={{ marginTop: "7rem" }}>Past Recommendations</h2>
         :
        null
      }

      {recommendations.map((recommendation, index) => {
        let link = `https://embed.spotify.com/?uri=${recommendation.link}`;
        return (
          <div key={index} style={{ marginTop: "16px", marginBottom: "2.5rem", padding: "8px" }}>
            <iframe src={link} title="Spotify Preview" width="100%" height="80" frameborder="0"></iframe>
            <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>Address: {recommendation.address}</div>
            <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>Time: {recommendation.timestamp.toUTCString()}</div>
            <div style={{ border: "2px solid #777777", marginTop: "4px" }}></div>
          </div>
        )
      })}

      <ToastContainer />
    </div>
  );
}
