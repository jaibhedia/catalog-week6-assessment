import React, { useState, useEffect, useRef } from 'react';
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
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        const handleAccountsChanged = (accounts) => {
            if (!isMounted.current) return;
            
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
            if (!isMounted.current) return;
            
            console.log('Network changed to:', parseInt(chainId, 16));
            setCurrentChainId(parseInt(chainId, 16));
            window.location.reload(); // Best practice for chain changes
        };

        // Initial connection check
        const initialCheck = async () => {
            await checkIfConnected();
        };
        
        initialCheck();
        
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
            if (isMounted.current) setError('MetaMask is not installed. Please install it to use this app.');
            return;
        }
        
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (isMounted.current) setCurrentChainId(parseInt(chainId, 16));
            
            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts'  
            });
            console.log("Current accounts:", accounts);
            
            if (accounts.length > 0 && isMounted.current) {
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
            if (isMounted.current) setError(`Please switch to ${SUPPORTED_CHAINS[DEFAULT_CHAIN_ID]?.name || 'the correct network'}`);
            return false;
        }
    };

    const connectWallet = async () => {
        console.log("Attempting to connect wallet...");
        if (!isMounted.current) return;
        
        setConnecting(true);
        setError('');
        
        if (!window.ethereum) {
            console.error("No ethereum provider found");
            if (isMounted.current) {
                setError('MetaMask is not installed. Please install it to use this app.');
                setConnecting(false);
            }
            return;
        }
        
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const currentChain = parseInt(chainId, 16);
            
            if (currentChain !== DEFAULT_CHAIN_ID) {
                const switched = await switchNetwork();
                if (!switched || !isMounted.current) {
                    if (isMounted.current) setConnecting(false);
                    return;
                }
            }
            
            console.log("Requesting accounts...");
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            console.log("Accounts received:", accounts);
            
            if (accounts.length > 0 && isMounted.current) {
                setConnectedAccount(accounts[0]);
                setAccount(accounts[0]);
            } else if (isMounted.current) {
                setError('No accounts found. Please check MetaMask.');
            }
        } catch (err) {
            console.error("Connection error:", err);
            if (isMounted.current) setError(`Failed to connect: ${err.message || 'Unknown error'}`);
        } finally {
            if (isMounted.current) setConnecting(false);
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