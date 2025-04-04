import React, { useState } from 'react';
import { SUPPORTED_CHAINS } from '../utils/chainconfig';

const ConnectWallet = ({ setAccount }) => {
    const [error, setError] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [connectedAccount, setConnectedAccount] = useState('');
    const [currentChainId, setCurrentChainId] = useState(null);

    // Only attempt connection when button is clicked
    const connectWallet = async () => {
        if (connecting || !window.ethereum) {
            setError('MetaMask is not installed');
            return;
        }
        
        setConnecting(true);
        setError('');
        
        try {
            // Setup chain change handler
            const handleChainChanged = (chainId) => {
                setCurrentChainId(parseInt(chainId, 16));
                window.location.reload();
            };
            
            // Setup account change handler
            const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                    setConnectedAccount(accounts[0]);
                    setAccount(accounts[0]);
                } else {
                    setConnectedAccount('');
                    setAccount('');
                }
            };
            
            // Set up event listeners
            window.ethereum.on('chainChanged', handleChainChanged);
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            
            // Get current chain
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setCurrentChainId(parseInt(chainId, 16));
            
            // Request accounts access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts.length > 0) {
                setConnectedAccount(accounts[0]);
                setAccount(accounts[0]);
            } else {
                setError('No accounts found');
            }
        } catch (err) {
            console.error('Connection error:', err);
            setError(`Failed to connect: ${err.message || 'Unknown error'}`);
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="wallet-connection">
            {connectedAccount ? (
                <div className="connected-status">
                    <span className="connected-badge">Connected</span>
                    <span className="account-address">
                        {connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}
                    </span>
                    {currentChainId && (
                        <span className="network-badge">
                            {SUPPORTED_CHAINS[currentChainId]?.name || `Chain ID: ${currentChainId}`}
                        </span>
                    )}
                </div>
            ) : (
                <button 
                    onClick={connectWallet} 
                    disabled={connecting}
                    className="connect-button"
                >
                    {connecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
            )}
            
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default ConnectWallet;