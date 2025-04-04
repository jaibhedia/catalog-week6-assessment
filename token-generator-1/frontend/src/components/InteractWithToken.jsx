import React, { useState, useEffect } from 'react';
import { getWeb3 } from '../utils/web3';
import { MyTokenArtifact } from '../utils/contractArtifact';
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS, isChainSupported } from '../utils/chainconfig';

function InteractWithToken({ account }) {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentChainId, setCurrentChainId] = useState(null);
  
  // Move useEffect to component level
  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setCurrentChainId(parseInt(chainId, 16));
      }
    };
    
    checkNetwork();
    
    if (window.ethereum) {
      const handleChainChanged = (chainId) => {
        setCurrentChainId(parseInt(chainId, 16));
      };
      
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);
  
  const getTokenInfo = async () => {
    if (!tokenAddress) return;
    
    setLoading(true);
    try {
      const web3 = getWeb3();
      const tokenContract = new web3.eth.Contract(
        MyTokenArtifact.abi,
        tokenAddress
      );
      
      const [name, symbol, totalSupply, decimals] = await Promise.all([
        tokenContract.methods.name().call(),
        tokenContract.methods.symbol().call(),
        tokenContract.methods.totalSupply().call(),
        tokenContract.methods.decimals().call(),
      ]);
      
      setTokenInfo({
        name,
        symbol,
        totalSupply: web3.utils.fromWei(totalSupply, 'ether'),
        decimals
      });
    } catch (error) {
      console.error('Error fetching token info:', error);
      alert('Error fetching token information. Make sure the address is correct.');
    } finally {
      setLoading(false);
    }
  };
  
  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}` }],
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
      alert(`Please manually switch to ${SUPPORTED_CHAINS[DEFAULT_CHAIN_ID]?.name || 'the correct network'}`);
    }
  };
  
  return (
    <div className="token-form-container">
      <h2>Interact with Existing Token</h2>
      
      {currentChainId !== DEFAULT_CHAIN_ID && (
        <div className="network-warning">
          <p>You are on the wrong network. Please switch to {SUPPORTED_CHAINS[DEFAULT_CHAIN_ID]?.name}.</p>
          <button onClick={switchNetwork} className="switch-network-button">
            Switch Network
          </button>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="token-address">Token Address:</label>
        <input
          id="token-address"
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="Enter token contract address"
        />
      </div>
      
      <button 
        onClick={getTokenInfo}
        disabled={!tokenAddress || loading || currentChainId !== DEFAULT_CHAIN_ID}
        className="deploy-button"
      >
        {loading ? 'Loading...' : 'Get Token Info'}
      </button>
      
      {tokenInfo && (
        <div className="token-details">
          <h3>Token Details</h3>
          <p><strong>Name:</strong> {tokenInfo.name}</p>
          <p><strong>Symbol:</strong> {tokenInfo.symbol}</p>
          <p><strong>Total Supply:</strong> {tokenInfo.totalSupply}</p>
          <p><strong>Decimals:</strong> {tokenInfo.decimals}</p>
        </div>
      )}
    </div>
  );
}

export default InteractWithToken;