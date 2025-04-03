import React, { useState, useEffect } from 'react';
import { getWeb3 } from '../utils/web3';

const ConnectWallet = ({ setAccount }) => {
    const [error, setError] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [connectedAccount, setConnectedAccount] = useState('');

    
    useEffect(() => {
        checkIfConnected();
        
       
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('Account changed to:', accounts[0]);
                if (accounts.length > 0) {
                    setConnectedAccount(accounts[0]);
                    setAccount(accounts[0]);
                } else {
                    setConnectedAccount('');
                    setAccount('');
                }
            });
        }
        
        return () => {
           
            if (window.ethereum && window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', () => {
                    console.log('Listener removed');
                });
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
            console.log("Requesting accounts...");
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            console.log("Accounts received:", accounts);
            
            if (accounts.length > 0) {
                setConnectedAccount(accounts[0]);
                setAccount(accounts[0]);
                
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                console.log("Connected to chain:", chainId);
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