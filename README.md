# Ethereum Token Generator

This project allows users to create their own ERC20 tokens on the Ethereum blockchain. It consists of a Solidity smart contract for the token and a React-based frontend application that interacts with the Ethereum network through MetaMask.

## Project Structure

- **contracts/Token.sol**: Contains the Solidity smart contract defining the ERC20 token's name, symbol, and initial supply.
  
- **frontend/**: The frontend application built with React.
  - **public/index.html**: Main HTML file for the frontend.
  - **src/components/**: Contains React components for wallet connection, token form, and deployment status.
    - **ConnectWallet.jsx**: Handles MetaMask wallet connection.
    - **TokenForm.jsx**: Form for entering token details (name, symbol, initial supply).
    - **DeployStatus.jsx**: Displays deployment status messages.
  - **src/utils/**: Utility files for Web3 and contract interactions.
    - **web3.js**: Initializes Web3 instance and provides blockchain interaction functions.
    - **contractHelpers.js**: Contains helper functions for deploying and interacting with the smart contract.
  - **src/App.jsx**: Main React component that renders the application.
  - **src/index.js**: Entry point for the React application.
  - **src/styles/**: Contains CSS files for styling the application.
    - **App.css**: Styles specific to the App component.
    - **index.css**: Global styles for the application.
  
- **scripts/**: Contains scripts for compiling and deploying the smart contracts.
  - **compile.js**: Compiles the Solidity smart contracts using Hardhat.
  - **deploy.js**: Deploys the compiled contracts to the Ethereum network.

- **hardhat.config.js**: Configuration file for Hardhat, including network settings and compiler options.

## Getting Started

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd token-generator
   ```

2. **Install dependencies**:
   Navigate to the `frontend` directory and install the required packages:
   ```
   cd frontend
   npm install
   ```

3. **Compile the smart contracts**:
   From the root directory, run:
   ```
   npx hardhat compile
   ```

4. **Deploy the smart contracts**:
   Make sure you have configured your Ethereum network settings in `hardhat.config.js`, then run:
   ```
   npx hardhat run scripts/deploy.js --network <network-name>
   ```

5. **Run the frontend application**:
   In the `frontend` directory, start the React application:
   ```
   npm start
   ```

6. **Connect your MetaMask wallet** and use the form to create your own ERC20 token!
