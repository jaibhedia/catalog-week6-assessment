import React, { useState, useEffect, useRef } from 'react';
import { SUPPORTED_CHAINS } from '../utils/chainconfig';

const ConnectWallet = ({ setAccount }) => {
    const [error, setError] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [connectedAccount, setConnectedAccount] = useState('');
    const [currentChainId, setCurrentChainId] = useState(null);
    const isMountedRef = useRef(true);
    const initialCheckDoneRef = useRef(false);

    // Track component mounting status
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Wrap setAccount to make it safe
    const safeSetAccount = (account) => {
        if (isMountedRef.current) {
            setAccount(account);
        }
    };

    // Handle wallet connection status
    useEffect(() => {
        // Skip if check was already done
        if (initialCheckDoneRef.current) return;
        initialCheckDoneRef.current = true;

        const initConnection = async () => {
            try {
                // First, check if ethereum is available
                if (!window.ethereum) {
                    setError('MetaMask is not installed. Please install it to use this app.');
                    return;
                }

                // Event handlers
                const handleAccountsChanged = (accounts) => {
                    if (!isMountedRef.current) return;
                    console.log('Accounts changed:', accounts);
                    
                    if (accounts.length > 0) {
                        setConnectedAccount(accounts[0]);
                        safeSetAccount(accounts[0]);
                    } else {
                        setConnectedAccount('');
                        safeSetAccount('');
                    }
                };

                const handleChainChanged = (chainId) => {
                    if (!isMountedRef.current) return;
                    console.log('Chain changed:', parseInt(chainId, 16));
                    setCurrentChainId(parseInt(chainId, 16));
                };

                // Set up listeners first
                window.ethereum.on('accountsChanged', handleAccountsChanged);
                window.ethereum.on('chainChanged', handleChainChanged);

                // Get chain ID
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                if (isMountedRef.current) {
                    setCurrentChainId(parseInt(chainId, 16));
                }

                // Check accounts
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (isMountedRef.current && accounts.length > 0) {
                    console.log('Found connected account:', accounts[0]);
                    setConnectedAccount(accounts[0]);
                    safeSetAccount(accounts[0]);
                }

                // Clean up on component unmount
                return () => {
                    if (window.ethereum?.removeListener) {
                        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                        window.ethereum.removeListener('chainChanged', handleChainChanged);
                    }
                };
            } catch (err) {
                console.error('Failed to initialize connection:', err);
                if (isMountedRef.current) {
                    setError('Failed to connect to wallet');
                }
            }
        };

        // Start the initialization process
        initConnection();
    }, []);

    const connectWallet = async () => {
        if (connecting || !window.ethereum) return;
        
        setConnecting(true);
        setError('');
        
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (isMountedRef.current) {
                if (accounts.length > 0) {
                    setConnectedAccount(accounts[0]);
                    safeSetAccount(accounts[0]);
                } else {
                    setError('No accounts found');
                }
            }
        } catch (err) {
            console.error('Connection error:', err);
            if (isMountedRef.current) {
                setError(`Failed to connect: ${err.message || 'Unknown error'}`);
            }
        } finally {
            if (isMountedRef.current) {
                setConnecting(false);
            }
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