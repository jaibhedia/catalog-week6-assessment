import React, { useState } from 'react';
import ConnectWallet from './components/ConnectWallet';
import TokenForm from './components/TokenForm';
import './App.css';

function App() {
  const [account, setAccount] = useState('');

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ERC20 Token Generator</h1>
        <ConnectWallet setAccount={setAccount} />
      </header>
      
      <main className="app-main">
      {account ? (
  <>
    <TokenForm account={account} />
    <InteractWithToken account={account} />
  </>
  ) : (
  <div className="connect-prompt">
    <p>Please connect your wallet to create or interact with tokens</p>
  </div>
  )}
      </main>
      
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Token Generator</p>
      </footer>
    </div>
  );
}

export default App;