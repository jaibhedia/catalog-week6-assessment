import React, { useState, useEffect } from 'react';
import { getWeb3 } from '../utils/web3';
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS } from './utils/chainConfig';

const ConnectWallet = ({ setAccount }) => {
    const [error, setError] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [connectedAccount, setConnectedAccount] = useState('');
    const [currentChainId, setCurrentChainId] = useState(null);

 
    useEffect(() => {
        const handleAccountsChanged = (accounts) => {
            console.log('Account changed to:', accounts[0]);
            if (accounts.length > 0) {
                setConnectedAccount(accounts[0]);
                setAccount(accounts[0]);
            } else {
                setConnectedAccount('');
                setAccount('');
            }
        };

        const handleChainChanged = (chainId) => {
            console.log('Network changed to:', parseInt(chainId, 16));
            setCurrentChainId(parseInt(chainId, 16));
            window.location.reload(); 
        };

        checkIfConnected();
        
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
        }
        
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, [setAccount]);

    const checkIfConnected = async () => {
        console.log("Checking if already connected...");
        
        if (!window.ethereum) {
            console.log("No ethereum provider detected");
            setError('MetaMask is not installed. Please install it to use this app.');
            return;
        }
        
        try {
          
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setCurrentChainId(parseInt(chainId, 16));
            
       
            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts'  
            });
            console.log("Current accounts:", accounts);
            
            if (accounts.length > 0) {
                console.log("Already connected to account:", accounts[0]);
                setConnectedAccount(accounts[0]);
                setAccount(accounts[0]);
                setError('');
            }
        } catch (err) {
            console.error("Error checking connection:", err);
        }
    };

    const switchNetwork = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${DEFAULT_CHAIN_ID.toString(16)}` }],
            });
            return true;
        } catch (error) {
            console.error('Failed to switch network:', error);
            setError(`Please switch to ${SUPPORTED_CHAINS[DEFAULT_CHAIN_ID]?.name || 'the correct network'}`);
            return false;
        }
    };

    const connectWallet = async () => {
        console.log("Attempting to connect wallet...");
        setConnecting(true);
        setError('');
        
        if (!window.ethereum) {
            console.error("No ethereum provider found");
            setError('MetaMask is not installed. Please install it to use this app.');
            setConnecting(false);
            return;
        }
        
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const currentChain = parseInt(chainId, 16);
            
            if (currentChain !== DEFAULT_CHAIN_ID) {
                const switched = await switchNetwork();
                if (!switched) {
                    setConnecting(false);
                    return;
                }
            }
            
            console.log("Requesting accounts...");
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            console.log("Accounts received:", accounts);
            
            if (accounts.length > 0) {
                setConnectedAccount(accounts[0]);
                setAccount(accounts[0]);
            } else {
                setError('No accounts found. Please check MetaMask.');
            }
        } catch (err) {
            console.error("Connection error:", err);
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