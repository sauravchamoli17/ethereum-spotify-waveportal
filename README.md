# Ethereum Spotify Waveportal

This project demonstrates a basic blockchain use case. It lets the users to send a spotify song recommendation to you, have that data stored on the blockchain and if they're lucky they might even win some ETH. The contract is deployed on rinkeby ethereum test network.

## Project Configuration:-
- npm install
- Rename the .env.example to .env.
- Create a project on [Alchemy](https://www.alchemy.com), use rinkeby test network. Grab the api key and paste it in the .env file with the varibale name STAGING_ALCHEMY_KEY.
- Grab your wallet private key and paste it in the .env file with the variable name PRIVATE_KEY.
- Deploy the contract: npx hardhat run scripts/run.js --network rinkeby
- You will get the contract address on console, assign the address to contractAddress variable in the App.js file.
- Open the Waveportal.json file under artifacts>contracts directory, copy all of its contents and paste it in the Waveportal.json file which is under frontend>src>utils folder.

## To run the project:-
- cd frontend 
- npm install
- npm start
