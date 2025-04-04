export const SUPPORTED_CHAINS = {
    1: {
      name: 'Ethereum Mainnet',
      currency: 'ETH',
      explorerUrl: 'https://etherscan.io'
    },
    11155111: {
      name: 'Sepolia Testnet',
      currency: 'ETH',
      explorerUrl: 'https://sepolia.etherscan.io'
    },
    5: {
      name: 'Goerli Testnet',
      currency: 'ETH',
      explorerUrl: 'https://goerli.etherscan.io'
    }
  };
  
  export const DEFAULT_CHAIN_ID = process.env.REACT_APP_CHAIN_ID 
    ? parseInt(process.env.REACT_APP_CHAIN_ID) 
    : 11155111; 
  
  export const isChainSupported = (chainId) => {
    return Object.keys(SUPPORTED_CHAINS).includes(chainId.toString());
  };
