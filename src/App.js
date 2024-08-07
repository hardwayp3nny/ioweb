import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Layout, Menu, Button, message } from 'antd';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import Home from './Home';
import ProcessorRewards from './ProcessorRewards';
import TutorialsList from './TutorialsList';
import Tutorial from './Tutorial';
import './styles.css';
const { Sider, Content, Header } = Layout;

function App() {
  const [account, setAccount] = useState(null);
  const [user, setUser] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

  const checkIfWalletIsConnected = useCallback(async () => {
    console.log("Checking wallet connection...");
    if (typeof window.ethereum !== 'undefined') {
      console.log("window.ethereum is defined");
      if (window.ethereum.isConnected()) {
        console.log("Ethereum is connected");
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          console.log("Accounts:", accounts);
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            message.success('Wallet automatically connected!');
          } else {
            message.info('Please connect your wallet.');
          }
        } catch (error) {
          console.error("An error occurred while checking the wallet connection:", error);
          message.error('Failed to check wallet connection.');
        }
      } else {
        console.log("Ethereum is not connected");
        message.info('MetaMask is not connected. Please connect your wallet.');
      }
    } else {
      console.log("window.ethereum is undefined");
      message.warning('Please install MetaMask!');
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const checkMetaMaskAvailability = () => {
      if (typeof window.ethereum !== 'undefined') {
        console.log("MetaMask is available");
        setIsMetaMaskAvailable(true);
        checkIfWalletIsConnected();
      } else {
        console.log("MetaMask not available, retrying...");
        setTimeout(checkMetaMaskAvailability, 1000); // retry until MetaMask is available
      }
    };

    checkMetaMaskAvailability();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('connect', handleConnect);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('connect', handleConnect);
      }
    };
  }, [checkIfWalletIsConnected]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        message.success('Wallet connected successfully!');
      } catch (error) {
        console.error("An error occurred while connecting the wallet:", error);
        if (error.code === 4001) {
          message.error('Connection rejected. Please try again and approve the connection.');
        } else {
          message.error(`Failed to connect wallet: ${error.message}`);
        }
      } finally {
        setIsConnecting(false);
      }
    } else {
      message.warning('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    message.success('Wallet disconnected successfully!');
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      message.info('Wallet disconnected.');
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      message.success('Account changed.');
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const handleConnect = () => {
    checkIfWalletIsConnected();
  };

  const handleGoogleLogin = (credentialResponse) => {
    const decodedToken = jwtDecode(credentialResponse.credential);
    setUser(decodedToken);
    message.success('Google login successful!');
  };

  const handleGoogleLogout = () => {
    setUser(null);
    message.success('Google logout successful!');
  };

  return (
    <GoogleOAuthProvider clientId="18131168214-e7lbqesmm1s8cgibcfqst8vq463cnlok.apps.googleusercontent.com">
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider width={200} className="site-layout-background">
            <div className="logo">
              <h1>IO.net</h1>
            </div>
            <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} style={{ height: '100%', borderRight: 0 }}>
              <Menu.Item key="1">
                <Link to="/">Home</Link>
              </Menu.Item>
              <Menu.Item key="2">
                <Link to="/processor-rewards">Processor Rewards</Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link to="/tutorials">Tutorials</Link>
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout>
            <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                {isMetaMaskAvailable ? (
                  isInitialized ? (
                    account ? (
                      <>
                        <span style={{ marginRight: '16px' }}>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
                        <Button onClick={disconnectWallet}>Disconnect Wallet</Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={connectWallet} disabled={isConnecting}>
                          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                        </Button>
                        <Button onClick={checkIfWalletIsConnected} style={{ marginLeft: '10px' }}>
                          Refresh Connection
                        </Button>
                      </>
                    )
                  ) : (
                    <span>Initializing...</span>
                  )
                ) : (
                  <span>Waiting for MetaMask...</span>
                )}
              </div>
              <div>
                {user ? (
                  <>
                    <span style={{ marginRight: '16px' }}>Welcome, {user.name}</span>
                    <Button onClick={handleGoogleLogout}>Logout from Google</Button>
                  </>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                      message.error('Google Login Failed');
                    }}
                  />
                )}
              </div>
            </Header>
            <Content style={{ padding: '0 24px', marginTop: '16px' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/processor-rewards" element={<ProcessorRewards />} />
                <Route path="/tutorials" element={<TutorialsList />} />
                <Route path="/tutorials/:name" element={<Tutorial />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;