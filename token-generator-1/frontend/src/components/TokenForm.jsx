import React, { useState, useEffect } from 'react';
import { deployToken, validateNetwork, switchToCorrectNetwork } from '../utils/web3';

function TokenForm({ account }) {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenSupply, setTokenSupply] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [status, setStatus] = useState('');
  const [networkStatus, setNetworkStatus] = useState('');
  const [deployedTokenAddress, setDeployedTokenAddress] = useState('');
  const [currentChainId, setCurrentChainId] = useState(null);
  const [networkError, setNetworkError] = useState(false);
 const [deployedContracts, setDeployedContracts] = useState([]);

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const chainId = await validateNetwork();
        setCurrentChainId(chainId);
        setNetworkStatus(`Connected to network ID: ${chainId}`);
        setNetworkError(false);
      } catch (error) {
        console.log("Network validation error:", error);
        setNetworkStatus(`⚠️ ${error.message}`);
        setNetworkError(true);
      }
    };
    
    if (account) {
      checkNetwork();
    }
    
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        console.log("Network changed");
        checkNetwork();
      });
    }
    
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('chainChanged', checkNetwork);
      }
    };
  }, [account]);

  const handleNetworkSwitch = async () => {
    try {
      setStatus('Switching network...');
      await switchToCorrectNetwork();
      setStatus('Network switched successfully. Now you can deploy your token.');
    } catch (error) {
      setStatus(`Error switching network: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) {
      setStatus('Please connect your wallet first');
      return;
    }

    setIsDeploying(true);
    setStatus('Deploying token... Please confirm in MetaMask');

    try {

      await validateNetwork();
      
      console.log(`Creating token: ${tokenName}, Symbol: ${tokenSymbol}, Count: ${tokenSupply}`);
      const tokenAddress = await deployToken(tokenName, tokenSymbol, parseInt(tokenSupply));
      setDeployedTokenAddress(tokenAddress);
      setStatus(`Token deployed successfully at: ${tokenAddress}`);
    } catch (error) {
      console.error('Error deploying token:', error);
      
      if (error.code === -32603) {
        setStatus(`Error: MetaMask transaction failed. This might be because: 
          1. You rejected the transaction 
          2. There's a mismatch in network settings
          3. Your local blockchain node is not running`);
      } else {
        setStatus(`Error: ${error.message}`);
      }
    } finally {
      setIsDeploying(false);
    }
  };
  setDeployedContracts(prev => [...prev, {
    address: deployedTokenAddress,
    name: tokenName,
    symbol: tokenSymbol,
    supply: tokenSupply
  }]);
  
  return (
    <div className="token-form-container">
      <h2>Create Your ERC20 Token</h2>
      
      {networkStatus && (
        <div className={`network-status ${networkError ? 'warning' : 'success'}`}>
          {networkStatus}
          {networkError && (
            <button 
              onClick={handleNetworkSwitch}
              className="network-switch-button"
            >
              Switch Network
            </button>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="token-form">
        <div className="form-group">
          <label htmlFor="token-name">Token Name:</label>
          <input
            id="token-name"
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="e.g. My Awesome Token"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="token-symbol">Token Symbol:</label>
          <input
            id="token-symbol"
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            placeholder="e.g. MAT"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="token-supply">Initial Supply:</label>
          <input
            id="token-supply"
            type="number"
            value={tokenSupply}
            onChange={(e) => setTokenSupply(e.target.value)}
            placeholder="e.g. 1000000"
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!account || isDeploying || networkError}
          className="deploy-button"
        >
          {isDeploying ? 'Deploying...' : 'Deploy Token'}
        </button>
      </form>
      
      {status && (
        <div className={`status-message ${status.includes('Error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
      
      {deployedTokenAddress && (
        <div className="token-details">
          <h3>Deployed Token Details</h3>
          <p><strong>Address:</strong> {deployedTokenAddress}</p>
          <p><strong>Name:</strong> {tokenName}</p>
          <p><strong>Symbol:</strong> {tokenSymbol}</p>
          <p><strong>Initial Supply:</strong> {tokenSupply}</p>
          <button 
            onClick={() => {
              const explorerUrl = currentChainId === 1 ? 
                `https://etherscan.io/token/${deployedTokenAddress}` : 
                currentChainId === 5 ? 
                  `https://goerli.etherscan.io/token/${deployedTokenAddress}` :
                  currentChainId === 11155111 ?
                    `https://sepolia.etherscan.io/token/${deployedTokenAddress}` :
                    `#`; 
              
              if (explorerUrl !== '#') {
                window.open(explorerUrl, '_blank');
              } else {
                alert('No block explorer available for local networks');
              }
            }}
            className="view-on-explorer"
            disabled={[1337, 31337].includes(currentChainId)}
          >
            View on Explorer
          </button>
        </div>
      )}
    </div>
  );
}

export default TokenForm;