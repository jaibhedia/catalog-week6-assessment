import React from 'react';
import { SUPPORTED_CHAINS } from '../utils/chainconfig';

// Convert to class component to avoid functional component re-render issues
class ConnectWallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      connecting: false,
      connectedAccount: '',
      currentChainId: null
    };

    // Bind methods
    this.connectWallet = this.connectWallet.bind(this);
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
    this.handleChainChanged = this.handleChainChanged.bind(this);
  }

  componentDidMount() {
    // Check if already connected when component mounts
    this.checkConnection();
    
    // Set up event listeners
    if (window.ethereum) {
      window.ethereum.on('chainChanged', this.handleChainChanged);
      window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    }
  }
  
  componentWillUnmount() {
    // Clean up event listeners
    if (window.ethereum?.removeListener) {
      window.ethereum.removeListener('chainChanged', this.handleChainChanged);
      window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
    }
  }
  
  // Handle account changes
  handleAccountsChanged(accounts) {
    if (accounts.length > 0) {
      this.setState({ connectedAccount: accounts[0] });
      this.props.setAccount(accounts[0]);
    } else {
      this.setState({ connectedAccount: '' });
      this.props.setAccount('');
    }
  }
  
  // Handle network changes
  handleChainChanged(chainId) {
    this.setState({ currentChainId: parseInt(chainId, 16) });
    window.location.reload();
  }
  
  // Check if already connected
  async checkConnection() {
    if (!window.ethereum) return;
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        this.setState({ connectedAccount: accounts[0] });
        this.props.setAccount(accounts[0]);
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        this.setState({ currentChainId: parseInt(chainId, 16) });
      }
    } catch (err) {
      console.error('Failed to check connection:', err);
    }
  }
  
  // Connect wallet
  async connectWallet() {
    if (!window.ethereum) {
      this.setState({ error: 'MetaMask is not installed' });
      return;
    }
    
    this.setState({ connecting: true, error: '' });
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (accounts.length > 0) {
        this.setState({
          connectedAccount: accounts[0],
          currentChainId: parseInt(chainId, 16)
        });
        this.props.setAccount(accounts[0]);
      } else {
        this.setState({ error: 'No accounts found' });
      }
    } catch (err) {
      console.error('Connection error:', err);
      this.setState({ error: `Failed to connect: ${err.message || 'Unknown error'}` });
    } finally {
      this.setState({ connecting: false });
    }
  }

  render() {
    const { error, connecting, connectedAccount, currentChainId } = this.state;
    
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
            onClick={this.connectWallet} 
            disabled={connecting}
            className="connect-button"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
        
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }
}

export default ConnectWallet;