import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getWeb3 } from '../utils/web3';
import { DEFAULT_CHAIN_ID, SUPPORTED_CHAINS } from '../utils/chainconfig';

const ConnectWallet = ({ setAccount }) => {
    const [error, setError] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [connectedAccount, setConnectedAccount] = useState('');
    const [currentChainId, setCurrentChainId] = useState(null);
    const isMounted = useRef(true);

    // Track component mounting status
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Safe state setters
    const safeSetError = useCallback((value) => {
        if (isMounted.current) setError(value);
    }, []);
    
    const safeSetCurrentChainId = useCallback((value) => {
        if (isMounted.current) setCurrentChainId(value);
    }, []);
    
    const safeSetConnectedAccount = useCallback((value) => {
        if (isMounted.current) setConnectedAccount(value);
    }, []);

    useEffect(() => {
        // Check if already connected - defined inside to avoid closure issues
        const checkIfConnected = async () => {
            console.log("Checking if already connected...");
            
            if (!window.ethereum) {
                console.log("No ethereum provider detected");
                safeSetError('MetaMask is not installed. Please install it to use this app.');
                return;
            }
            
            try {
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                
                // Check if component is still mounted before proceeding
                if (!isMounted.current) return;
                safeSetCurrentChainId(parseInt(chainId, 16));
                
                const accounts = await window.ethereum.request({ 
                    method: 'eth_accounts'  
                });
                console.log("Current accounts:", accounts);
                
                // Check again if component is still mounted
                if (!isMounted.current) return;
                
                if (accounts.length > 0) {
                    console.log("Already connected to account:", accounts[0]);
                    safeSetConnectedAccount(accounts[0]);
                    setAccount(accounts[0]);
                    safeSetError('');
                }
            } catch (err) {
                console.error("Error checking connection:", err);
            }
        };

        const handleAccountsChanged = (accounts) => {
            if (!isMounted.current) return;
            
            console.log('Account changed to:', accounts[0]);
            if (accounts.length > 0) {
                safeSetConnectedAccount(accounts[0]);
                setAccount(accounts[0]);
            } else {
                safeSetConnectedAccount('');
                setAccount('');
            }
        };

        const handleChainChanged = (chainId) => {
            if (!isMounted.current) return;
            
            console.log('Network changed to:', parseInt(chainId, 16));
            safeSetCurrentChainId(parseInt(chainId, 16));
            window.location.reload(); // Best practice for chain changes
        };
        
        // Run the initial check
        checkIfConnected();
        
        // Set up event listeners
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
        }
        
        // Clean up event listeners
        return () => {
            isMounted.current = false; // Ensure this happens first
            if (window.ethereum && window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            }
        };
    }, [setAccount, safeSetError, safeSetCurrentChainId, safeSetConnectedAccount]);

    // Rest of your component...
    const switchNetwork = async () => {
        /* Your existing code */
    };

    const connectWallet = async () => {
        /* Your existing code */
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