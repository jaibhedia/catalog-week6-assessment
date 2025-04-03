import Web3 from 'web3';
import { MyTokenArtifact } from './contractArtifact';

let web3;

if (typeof window !== 'undefined' && window.ethereum) {
    web3 = new Web3(window.ethereum);
} else {
   
    const provider = new Web3.providers.HttpProvider(
        'http://localhost:8545'
    );
    web3 = new Web3(provider);
}

export const getWeb3 = () => {
    return web3;
};

export async function requestAccount() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });
            return accounts[0];
        } catch (error) {
            console.error('Error connecting to MetaMask', error);
            throw new Error('Error connecting to MetaMask');
        }
    } else {
        throw new Error('MetaMask not detected');
    }
}


export async function validateNetwork() {
    if (!window.ethereum) throw new Error('MetaMask not detected');
    
    
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const chainIdDecimal = parseInt(chainId, 16);
    
    console.log('Current chainId:', chainIdDecimal);

    
    const validChainIds = [1, 5, 11155111, 31337, 1337];
    
    if (!validChainIds.includes(chainIdDecimal)) {
        throw new Error(`Please connect to a supported network. Current network ID: ${chainIdDecimal}`);
    }
    
    return chainIdDecimal;
}
export async function deployToken(name, symbol, initialSupply) {
    if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Ethereum provider not available');
    }
    
    await requestAccount();
    
    try {
     
        const chainId = await validateNetwork();
        console.log(`Deploying on chain ID: ${chainId}`);
        
        const web3Instance = getWeb3();
        const accounts = await web3Instance.eth.getAccounts();
        
        if (!accounts || accounts.length === 0) {
            throw new Error('No Ethereum accounts available. Please check MetaMask.');
        }
        
        console.log(`Deploying token: ${name} (${symbol}) with supply: ${initialSupply}`);
        console.log('Using account:', accounts[0]);
        
        
        const nonce = await web3Instance.eth.getTransactionCount(accounts[0], 'pending');
        console.log(`Using nonce: ${nonce}`);
        
    
        const newContract = new web3Instance.eth.Contract(MyTokenArtifact.abi);
        
        
        const deployTx = newContract.deploy({
            data: MyTokenArtifact.bytecode,
            arguments: [name, symbol, initialSupply]
        });
        
       
        let gasPrice;
        try {
            gasPrice = await web3Instance.eth.getGasPrice();
            console.log(`Current gas price: ${gasPrice}`);
        } catch (error) {
            console.log('Error getting gas price, using default');
            gasPrice = '20000000000';
        }
        
        
        let gasLimit;
        try {
            const estimatedGas = await deployTx.estimateGas({ from: accounts[0] });
            gasLimit = Math.round(estimatedGas * 1.5); 
            console.log(`Estimated gas: ${estimatedGas}, Using gas limit: ${gasLimit}`);
        } catch (error) {
            console.error('Error estimating gas:', error);
            gasLimit = 3000000; 
            console.log(`Using default gas limit: ${gasLimit}`);
        }
        
        console.log(`Sending transaction with params:
            from: ${accounts[0]}
            gas: ${gasLimit}
            gasPrice: ${gasPrice}
            nonce: ${nonce}
            chainId: ${chainId}
        `);
        
        const deployParams = {
            from: accounts[0],
            gas: gasLimit,
            gasPrice: gasPrice,
            nonce: nonce
        };
        
    
        if (chainId !== 31337 && chainId !== 1337) {
            deployParams.chainId = chainId;
        }
        
        const deployedContract = await deployTx.send(deployParams);
        
        console.log('Token successfully deployed at:', deployedContract.options.address);
        return deployedContract.options.address;
    } catch (error) {
        console.error('Error deploying token:', error);
        
       
        if (error.message.includes('User denied transaction signature')) {
            throw new Error('You rejected the transaction in MetaMask.');
        } else if (error.code === -32603) {
            throw new Error('Transaction failed. This might be because: \n1. Your local blockchain is not running \n2. You need to reset your MetaMask account (Settings > Advanced > Reset Account)');
        } else if (error.message.includes('chainId')) {
            throw new Error('Network mismatch error. Please switch to the correct network.');
        }
        
        throw error;
    }
}

export async function switchToCorrectNetwork() {
    if (!window.ethereum) throw new Error('MetaMask not detected');
    
    try {
        
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7A69' }], 
        });
        return "31337"; 
    } catch (switchError) {
       
        if (switchError.code === 4902 || switchError.code === -32603) {
            try {
              
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0x539' }], 
                });
                return "1337";
            } catch (secondError) {
               
                if (secondError.code === 4902 || secondError.code === -32603) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: '0x7A69', 
                                    chainName: 'Hardhat Local',
                                    nativeCurrency: {
                                        name: 'Ethereum',
                                        symbol: 'ETH',
                                        decimals: 18
                                    },
                                    rpcUrls: ['http://127.0.0.1:8545'],
                                    blockExplorerUrls: null
                                }
                            ],
                        });
                        return "31337"; 
                    } catch (addError) {
                        throw new Error(`Error adding network: ${addError.message}`);
                    }
                }
                throw new Error(`Error switching network: ${secondError.message}`);
            }
        }
        throw new Error(`Error switching network: ${switchError.message}`);
    }
}