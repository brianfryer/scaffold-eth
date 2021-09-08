// import BufferList from 'bl';
import Authereum from 'authereum';
import Fortmatic from 'fortmatic';
import ipfsAPI from 'ipfs-http-client';
import Portis from '@portis/web3';
import React, { useCallback, useEffect, useState } from 'react';
import ReactJson from 'react-json-view';
import StackGrid from 'react-stack-grid';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';
import Web3Modal from 'web3modal';
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  InputNumber,
  List,
  Menu,
  Modal,
  Row,
  // Switch as SwitchD,
  // Tooltip,
} from 'antd';
import {
  BrowserRouter,
  Route,
  Link,
  Switch,
} from 'react-router-dom';
import { ethers } from 'ethers';
import { format } from 'date-fns';
import { formatEther, parseEther } from '@ethersproject/units';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { LinkOutlined } from '@ant-design/icons';
// import { useThemeSwitcher } from 'react-css-theme-switcher';
import { useUserAddress } from 'eth-hooks';

import {
  INFURA_ID,
  DAI_ADDRESS,
  DAI_ABI,
  NETWORK,
  NETWORKS,
} from './constants';
import { Transactor } from './helpers';
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useEventListener,
  useExchangePrice,
  useExternalContractLoader,
  useGasPrice,
  useOnBlock,
  useUserSigner,
} from './hooks';
// import { ExampleUI, Hints, Subgraph } from './views';
import {
  Account,
  Address,
  AddressInput,
  Contract,
  Faucet,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
} from './components';

import 'antd/dist/antd.css';
import './App.scss';

import assets from './assets';

const ipfs = ipfsAPI({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' });

console.log('📦 Assets: ', assets);

/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/austintgriffith/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)

    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.rinkeby;

// 😬 Sorry for all the console logging
const DEBUG = true;

// EXAMPLE STARTING JSON:
const STARTING_JSON = {
  description: 'It\'s actually a bison?',
  external_url: 'https://austingriffith.com/portfolio/paintings/', // <-- this can link to a page for the specific file too
  image: 'https://austingriffith.com/images/paintings/buffalo.jpg',
  name: 'Buffalo',
  attributes: [
    {
      trait_type: 'BackgroundColor',
      value: 'green',
    },
    {
      trait_type: 'Eyes',
      value: 'googly',
    },
  ],
};

// helper function to "Get" from IPFS
// you usually go content.toString() after this...
const getFromIPFS = async (hashToGet) => {
  console.log('hashToGet', hashToGet);
  // for await (const file of ipfs.get(hashToGet)) {
  //   console.log(file.path);
  //   if (!file.content) continue;
  //   const content = new BufferList();
  //   for await (const chunk of file.content) {
  //     content.append(chunk);
  //   }
  //   console.log(content);
  //   return content;
  // }
  return {};
};

// 🛰 providers

// const mainnetProvider = getDefaultProvider('mainnet', {
//   infura: INFURA_ID,
//   etherscan: ETHERSCAN_KEY,
//   quorum: 1,
// });
// const mainnetProvider = new InfuraProvider('mainnet', INFURA_ID);

// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
const scaffoldEthProvider = new JsonRpcProvider('https://rpc.scaffoldeth.io:48544');
const poktMainnetProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider(
    'https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406',
  )
  : null;
const mainnetInfura = new JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_I

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER
  ? process.env.REACT_APP_PROVIDER
  : localProviderUrl;
if (DEBUG) console.log('🏠 Connecting to provider:', localProviderUrlFromEnv);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const { blockExplorer } = targetNetwork;

// Coinbase walletLink init
const walletLink = new WalletLink({
  appName: 'coinbase',
});

// WalletLink provider
const walletLinkProvider = walletLink.makeWeb3Provider(`https://mainnet.infura.io/v3/${INFURA_ID}`, 1);

// Web3 modal helps us "connect" external wallets:
const web3Modal = new Web3Modal({
  network: 'mainnet', // Optional. If using WalletConnect on xDai, change network to 'xdai' and add RPC info below for xDai chain.
  cacheProvider: true, // optional
  theme: 'light', // optional. Change to 'dark' for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: 'https://polygon.bridge.walletconnect.org',
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          42: `https://kovan.infura.io/v3/${INFURA_ID}`,
          100: 'https://dai.poa.network', // xDai
        },
      },
    },
    portis: {
      display: {
        logo: 'https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png',
        name: 'Portis',
        description: 'Connect to Portis App',
      },
      package: Portis,
      options: {
        id: '6255fb2b-58c8-433b-a2c9-62098c05ddc9',
      },
    },
    fortmatic: {
      package: Fortmatic, // required
      options: {
        key: 'pk_live_5A7C91B2FC585A17', // required
      },
    },
    // torus: {
    //   package: Torus,
    //   options: {
    //     networkParams: {
    //       host: "https://localhost:8545", // optional
    //       chainId: 1337, // optional
    //       networkId: 1337 // optional
    //     },
    //     config: {
    //       buildEnv: "development" // optional
    //     },
    //   },
    // },
    'custom-walletlink': {
      display: {
        logo: 'https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0',
        name: 'Coinbase',
        description: 'Connect to Coinbase Wallet (not Coinbase App)',
      },
      package: walletLinkProvider,
      connector: async (provider, options) => {
        await provider.enable();
        return provider;
      },
    },
    authereum: {
      package: Authereum, // required
    },
  },
});

const App = () => {
  // eslint-disable-next-line no-nested-ternary
  const mainnetProvider = poktMainnetProvider && poktMainnetProvider._isProvider
    ? poktMainnetProvider
    : scaffoldEthProvider && scaffoldEthProvider._network
      ? scaffoldEthProvider
      : mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (
      injectedProvider
      && injectedProvider.provider
      && typeof injectedProvider.provider.disconnect === 'function'
    ) {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  // 💵 This hook will get the price of ETH from 🦄 Uniswap:
  const price = useExchangePrice(targetNetwork, mainnetProvider);

  // 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation
  const gasPrice = useGasPrice(targetNetwork, 'fast');

  // Use your injected provider from 🦊 Metamask or if you
  // don't have it then instantly generate a 🔥 burner wallet.
  const userSigner = useUserSigner(injectedProvider, localProvider);

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId = userSigner
    && userSigner.provider
    && userSigner.provider._network
    && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, { chainId: localChainId });

  // EXTERNAL CONTRACT EXAMPLE:
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  const mainnetDAIContract = useExternalContractLoader(mainnetProvider, DAI_ADDRESS, DAI_ABI);

  // Then read your DAI balance like:
  const myMainnetDAIBalance = useContractReader(
    { DAI: mainnetDAIContract },
    'DAI',
    'balanceOf',
    ['0x34aA3F359A9D614239015126635CE7732c18fDF3'],
  );

  // keep track of a variable from the contract in the local React state:
  const balance = useContractReader(readContracts, 'YourCollectible', 'balanceOf', [address]);

  // 📟 Listen for broadcast events
  const transferEvents = useEventListener(readContracts, 'YourCollectible', 'Transfer', localProvider, 1);

  const [modalVisible, setModalVisible] = useState(false);
  // const [viewModalVisible, setViewModalVisible] = useState(false); slack
  const [auctionDetails, setAuctionDetails] = useState({ price: '', duration: '' });
  const [auctionToken, setAuctionToken] = useState('');
  // const [viewAuctionToken, setViewAuctionToken] = useState('');

  // 🧠 This effect will update yourCollectibles by polling when your balance changes
  // const yourBalance = balance && balance.toNumber && balance.toNumber();
  // const [yourCollectibles, setYourCollectibles] = useState();
  const [yourCollectibles] = useState();

  // useEffect(()=>{
  //   const updateYourCollectibles = async () => {
  //     let collectibleUpdate = []
  //     for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
  //       try {
  //         console.log('Getting token index: ', tokenIndex)
  //         const tokenId =
  //           await readContracts.YourCollectible.tokenOfOwnerByIndex(address, tokenIndex);
  //         console.log('tokenId: ', tokenId);
  //         const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
  //         console.log('tokenURI: ', tokenURI);
  //         const ipfsHash = tokenURI.replace('https://ipfs.io/ipfs/', '');
  //         console.log('ipfsHash', ipfsHash);

  //         const jsonManifestBuffer = await getFromIPFS(ipfsHash);

  //         try {
  //           const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
  //           // console.log('jsonManifest",jsonManifest)
  //           collectibleUpdate.push({
  //             id: tokenId,
  //             uri: tokenURI,
  //             owner: address,
  //             ...jsonManifest
  //           });
  //         }
  //         catch (e) {
  //           console.log(e);
  //         }
  //       }
  //       catch (e) {
  //         console.log(e);
  //       }
  //     }
  //     setYourCollectibles(collectibleUpdate);
  //   }
  //   updateYourCollectibles();
  // }, [address, yourBalance]);

  // const addressFromENS = useResolveName(mainnetProvider, "austingriffith.eth");
  // console.log('🏷 Resolved austingriffith.eth as:",addressFromENS)

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG
      && address
      && mainnetContracts
      && mainnetProvider
      && readContracts
      && selectedChainId
      && writeContracts
      && yourLocalBalance
      && yourMainnetBalance
    ) {
      console.log('_____________________________________ 🏗 scaffold-eth _____________________________________');
      console.log('🌎 mainnetProvider', mainnetProvider);
      console.log('🏠 localChainId', localChainId);
      console.log('👩‍💼 selected address:', address);
      console.log('🕵🏻‍♂️ selectedChainId:', selectedChainId);
      console.log('💵 yourLocalBalance', yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : '...');
      console.log('💵 yourMainnetBalance', yourMainnetBalance ? ethers.utils.formatEther(yourMainnetBalance) : '...');
      console.log('📝 readContracts', readContracts);
      console.log('🌍 DAI contract on mainnet:', mainnetContracts);
      console.log('💵 yourMainnetDAIBalance', myMainnetDAIBalance);
      console.log('🔐 writeContracts', writeContracts);
    }
  }, [
    address,
    localChainId,
    mainnetContracts,
    mainnetProvider,
    myMainnetDAIBalance,
    readContracts,
    selectedChainId,
    writeContracts,
    yourLocalBalance,
    yourMainnetBalance,
  ]);

  const networkDisplay = (localChainId && selectedChainId && localChainId !== selectedChainId)
    ? (
      <div
        style={{
          position: 'absolute',
          zIndex: 2,
          top: 60,
          right: 0,
          padding: 16,
        }}
      >
        <Alert
          message="⚠️ Wrong Network"
          description={(
            <div>
              You have
              <strong>{NETWORK(selectedChainId).name}</strong>
              selected and you need to be on
              <strong>{NETWORK(localChainId).name}</strong>
            </div>
          )}
          type="error"
          closable={false}
        />
      </div>
    ) : (
      <div
        style={{
          position: 'absolute',
          zIndex: -1,
          top: 28,
          right: 154,
          padding: 16,
          color: targetNetwork.color,
        }}
      >
        {targetNetwork.name}
      </div>
    );

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();

  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  const faucetAvailable = localProvider?.connection?.url?.indexOf(window.location.hostname) >= 0
    && !process.env.REACT_APP_PROVIDER
    && price > 1;

  const [faucetClicked, setFaucetClicked] = useState(false);

  const faucetHint = (
    !faucetClicked
    && localProvider?._network?.chainId === 31337
    && yourLocalBalance
    && formatEther(yourLocalBalance) <= 0
  ) ? (
    <div style={{ padding: 16 }}>
      <Button
        type="primary"
        onClick={() => {
          faucetTx({
            to: address,
            value: parseEther('0.01'),
          });
          setFaucetClicked(true);
        }}
      >
        💰 Grab funds from the faucet ⛽️
      </Button>
    </div>
    ) : '';

  const [yourJSON, setYourJSON] = useState(STARTING_JSON);
  const [sending, setSending] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [ipfsDownHash, setIpfsDownHash] = useState();

  const [downloading, setDownloading] = useState();
  const [ipfsContent, setIpfsContent] = useState();
  const [yourBid, setYourBid] = useState({});

  const [transferToAddresses, setTransferToAddresses] = useState({});

  const [loadedAssets, setLoadedAssets] = useState();

  const updateYourCollectibles = useCallback(async () => {
    const assetUpdate = await Promise.all(Object.keys(assets).map(async (key) => {
      const forSale = await readContracts.YourCollectible.forSale(ethers.utils.id(key));
      let owner;
      let auctionInfo;

      if (!forSale) {
        const tokenId = await readContracts.YourCollectible.uriToTokenId(ethers.utils.id(key));
        owner = await readContracts.YourCollectible.ownerOf(tokenId);
        const nftAddress = readContracts.YourCollectible.address;
        auctionInfo = await readContracts.Auction.getTokenAuctionDetails(nftAddress, tokenId);
      }

      return {
        id: key,
        ...assets[key],
        forSale,
        owner,
        auctionInfo,
      };
    }));

    setLoadedAssets(assetUpdate);
  }, [readContracts]);

  useEffect(() => {
    if (readContracts && readContracts.YourCollectible) {
      updateYourCollectibles();
    }
  }, [readContracts, transferEvents, updateYourCollectibles]);

  const startAuction = (tokenUri) => async () => {
    setAuctionToken(tokenUri);
    setModalVisible(true);
  };

  const placeBid = async (tokenUri, ethAmount) => {
    const tokenId = await readContracts.YourCollectible.uriToTokenId(ethers.utils.id(tokenUri));
    const nftAddress = readContracts.YourCollectible.address;
    await tx(writeContracts.Auction.bid(nftAddress, tokenId, {
      value: parseEther(ethAmount.toString()),
    }));
    updateYourCollectibles();
  };

  const completeAuction = (tokenUri) => async () => {
    const tokenId = await readContracts.YourCollectible.uriToTokenId(ethers.utils.id(tokenUri));
    const nftAddress = readContracts.YourCollectible.address;
    await tx(writeContracts.Auction.executeSale(nftAddress, tokenId));
    updateYourCollectibles();
  };

  const cancelAuction = (tokenUri) => async () => {
    const tokenId = await readContracts.YourCollectible.uriToTokenId(ethers.utils.id(tokenUri));
    const nftAddress = readContracts.YourCollectible.address;
    await tx(writeContracts.Auction.cancelAution(nftAddress, tokenId));
    updateYourCollectibles();
  };

  const galleryList = loadedAssets?.slice(0, 6).map((a) => {
    const actions = [];
    const details = [];

    if (loadedAssets[a].forSale) {
      actions.push(
        <div>
          <Button
            onClick={() => tx(writeContracts.YourCollectible.mintItem(loadedAssets[a].id, {
              gasPrice,
            }))}
          >
            Mint
          </Button>
        </div>,
      );
      details.push(null);
    } else {
      const { auctionInfo } = loadedAssets[a];
      const deadline = new Date(auctionInfo.duration * 1000);
      const isEnded = deadline <= new Date();

      actions.push(
        <div>
          <div>
            owned by:
            <Address
              address={loadedAssets[a].owner}
              blockExplorer={blockExplorer}
              ensProvider={mainnetProvider}
              minimized
            />
          </div>
          {!loadedAssets[a].auctionInfo.isActive && address === loadedAssets[a].owner && (
            <>
              <Button
                disabled={address !== loadedAssets[a].owner}
                onClick={startAuction(loadedAssets[a].id)}
                style={{ marginBottom: 10 }}
              >
                Start auction
              </Button>
              <br />
            </>
          )}
          {loadedAssets[a].auctionInfo.isActive
          && address === loadedAssets[a].auctionInfo.seller
          && (
            <>
              <Button
                onClick={completeAuction(loadedAssets[a].id)}
                style={{ marginBottom: 10 }}
              >
                Complete auction
              </Button>
              <br />
              <Button
                onClick={cancelAuction(loadedAssets[a].id)}
                style={{ marginBottom: 10 }}
              >
                Cancel auction
              </Button>
              <br />
            </>
          )}
        </div>,
      );

      details.push(auctionInfo.isActive ? (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontWeight: 'bold' }}>Auction is in progress</p>
          <p style={{ margin: 0, marginBottom: 2 }}>
            Minimal price is
            {ethers.utils.formatEther(auctionInfo.price)}
            ETH
          </p>
          <p style={{ marginTop: 0 }}>
            {isEnded
              ? 'Auction has already ended'
              : `Auction ends at ${format(deadline, 'MMMM dd, hh:mm:ss')}`}
          </p>
          <div>
            {auctionInfo.maxBidUser === ethers.constants.AddressZero ? 'Highest bid was not made yet' : (
              <>
                Highest bid by:
                <Address
                  address={auctionInfo.maxBidUser}
                  ensProvider={mainnetProvider}
                  blockExplorer={blockExplorer}
                  minimized
                />
                <p>
                  {ethers.utils.formatEther(auctionInfo.maxBid)}
                  ETH
                </p>
              </>
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
              <p style={{ margin: 0, marginRight: 15 }}>Your bid in ETH:</p>
              <InputNumber
                onChange={(newBid) => setYourBid({ ...yourBid, [loadedAssets[a].id]: newBid })}
                placeholder="0.1"
                style={{ flexGrow: 1 }}
                value={yourBid[loadedAssets[a].id]}
              />
            </div>
            <Button
              style={{ marginTop: 7 }}
              onClick={() => placeBid(loadedAssets[a].id, yourBid[loadedAssets[a].id])}
              disabled={!yourBid[loadedAssets[a].id] || isEnded}
            >
              Place a bid
            </Button>
          </div>
        </div>
      ) : null);
    }

    return (
      <Card
        actions={actions}
        key={loadedAssets[a].name}
        style={{ width: 300 }}
        title={(
          <div>
            {loadedAssets[a].name}
            <a
              href={loadedAssets[a].external_url}
              rel="noreferrer"
              style={{ cursor: 'pointer', opacity: 0.33 }}
              target="_blank"
            >
              <LinkOutlined />
            </a>
          </div>
        )}
      >
        <img style={{ maxWidth: 130 }} src={loadedAssets[a].image} alt="" />
        <div style={{ opacity: 0.77 }}>
          {loadedAssets[a].description}
        </div>
        {details}
      </Card>
    );
  });

  const handleOk = async () => {
    setModalVisible(false);
    const { price: p, duration } = auctionDetails;
    const tokenId = await readContracts.YourCollectible.uriToTokenId(ethers.utils.id(auctionToken));

    const auctionAddress = readContracts.Auction.address;
    const nftAddress = readContracts.YourCollectible.address;
    await writeContracts.YourCollectible.approve(auctionAddress, tokenId);

    const ethPrice = ethers.utils.parseEther(p.toString());
    const blockDuration = Math.floor(new Date().getTime() / 1000) + duration;

    await tx(writeContracts.Auction.createTokenAuction(
      nftAddress,
      tokenId,
      ethPrice,
      blockDuration,
      { gasPrice },
    ));

    const auctionInfo = await readContracts.Auction.getTokenAuctionDetails(nftAddress, tokenId);
    console.log('auctionInfo', auctionInfo);
  };

  const handleCancel = () => setModalVisible(false);

  return (
    <div className="App">

      <Modal
        okButtonProps={{ disabled: !auctionDetails.price || !auctionDetails.duration }}
        okText="Start"
        onCancel={handleCancel}
        onOk={handleOk}
        title="Start auction"
        visible={modalVisible}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <p style={{ margin: 0, marginRight: 15 }}>ETH price (minimal bid): </p>
          <InputNumber
            placeholder="0.1"
            value={auctionDetails.price}
            onChange={(newPrice) => setAuctionDetails({ ...auctionDetails, price: newPrice })}
            style={{ flexGrow: 1 }}
          />
        </div>
        <br />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <p style={{ margin: 0, marginRight: 15 }}>Duration in seconds: </p>
          <InputNumber
            placeholder="3600"
            value={auctionDetails.duration}
            onChange={(newDuration) => setAuctionDetails({
              ...auctionDetails,
              duration: newDuration,
            })}
            style={{ flexGrow: 1 }}
          />
        </div>
      </Modal>

      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      {networkDisplay}

      <BrowserRouter>

        <Menu style={{ textAlign: 'center' }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link onClick={() => setRoute('/')} to="/">Gallery</Link>
          </Menu.Item>
          <Menu.Item key="/yourcollectibles">
            <Link onClick={() => setRoute('/yourcollectibles')} to="/yourcollectibles">YourCollectibles</Link>
          </Menu.Item>
          <Menu.Item key="/transfers">
            <Link onClick={() => setRoute('/transfers')} to="/transfers">Transfers</Link>
          </Menu.Item>
          <Menu.Item key="/ipfsup">
            <Link onClick={() => setRoute('/ipfsup')} to="/ipfsup">IPFS Upload</Link>
          </Menu.Item>
          <Menu.Item key="/ipfsdown">
            <Link onClick={() => setRoute('/ipfsdown')} to="/ipfsdown">IPFS Download</Link>
          </Menu.Item>
          <Menu.Item key="/debugcontracts">
            <Link onClick={() => setRoute('/debugcontracts')} to="/debugcontracts">Debug Contracts</Link>
          </Menu.Item>
        </Menu>

        <Switch>
          <Route exact path="/">
            {/*
              🎛 this scaffolding is full of commonly used components
              this <Contract /> component will automatically parse your ABI
              and give you a form to interact with it locally
            */}

            <div
              style={{
                maxWidth: 1024,
                margin: 'auto',
                marginTop: 32,
                paddingBottom: 56,
              }}
            >
              <Button
                disabled={galleryList?.length === 0}
                onClick={updateYourCollectibles}
                style={{ marginBottom: 25 }}
              >
                Update collectibles
              </Button>
              <StackGrid
                columnWidth={300}
                gutterHeight={16}
                gutterWidth={16}
              >
                {galleryList}
              </StackGrid>
            </div>

          </Route>

          <Route path="/yourcollectibles">
            <div
              style={{
                width: 640,
                margin: 'auto',
                marginTop: 32,
                paddingBottom: 32,
              }}
            >
              <List
                bordered
                dataSource={yourCollectibles}
                renderItem={(item) => {
                  const id = item.id.toNumber();
                  return (
                    // <List.Item key={id+"_"+item.uri+"_"+item.owner}>
                    <List.Item key={`${id}_${item.uri}_${item.owner}`}>
                      <Card
                        title={(
                          <div>
                            <span style={{ fontSize: 16, marginRight: 8 }}>
                              {`#${id}`}
                            </span>
                            {item.name}
                          </div>
                        )}
                      >
                        <div><img src={item.image} style={{ maxWidth: 150 }} alt="" /></div>
                        <div>{item.description}</div>
                      </Card>

                      <div>
                        owner:
                        <Address
                          address={item.owner}
                          blockExplorer={blockExplorer}
                          ensProvider={mainnetProvider}
                          fontSize={16}
                        />
                        <AddressInput
                          ensProvider={mainnetProvider}
                          placeholder="transfer to address"
                          value={transferToAddresses[id]}
                          onChange={(newValue) => {
                            const update = {};
                            update[id] = newValue;
                            setTransferToAddresses({ ...transferToAddresses, ...update });
                          }}
                        />
                        <Button
                          onClick={() => {
                            console.log('writeContracts: ', writeContracts);
                            tx(writeContracts.YourCollectible.transferFrom(
                              address,
                              transferToAddresses[id],
                              id,
                            ));
                          }}
                        >
                          Transfer
                        </Button>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          </Route>

          <Route path="/transfers">
            <div
              style={{
                width: 600,
                margin: 'auto',
                marginTop: 32,
                paddingBottom: 32,
              }}
            >
              <List
                bordered
                dataSource={transferEvents}
                renderItem={(item) => (
                  <List.Item key={`${item[0]}_${item[1]}_${item.blockNumber_item[2].toNumber()}`}>
                    <span style={{ fontSize: 16, marginRight: 8 }}>
                      {`#${item[2].toNumber()}`}
                    </span>
                    <Address
                      address={item[0]}
                      ensProvider={mainnetProvider}
                      fontSize={16}
                    />
                    =&gt;
                    <Address
                      address={item[1]}
                      ensProvider={mainnetProvider}
                      fontSize={16}
                    />
                  </List.Item>
                )}
              />
            </div>
          </Route>

          <Route path="/ipfsup">
            <div
              style={{
                paddingTop: 32,
                width: 740,
                margin: 'auto',
                textAlign: 'left',
              }}
            >
              <ReactJson
                enableClipboard={false}
                onAdd={(add, a) => setYourJSON(add.updated_src)}
                onDelete={(del, a) => setYourJSON(del.updated_src)}
                onEdit={(edit, a) => setYourJSON(edit.updated_src)}
                src={yourJSON}
                style={{ padding: 8 }}
                theme="pop"
              />
            </div>

            <Button
              style={{ margin: 8 }}
              loading={sending}
              size="large"
              shape="round"
              type="primary"
              onClick={async () => {
                console.log('UPLOADING... ', yourJSON);
                setSending(true);
                setIpfsHash();
                // addToIPFS(JSON.stringify(yourJSON))
                const result = await ipfs.add(JSON.stringify(yourJSON));
                if (result && result.path) {
                  setIpfsHash(result.path);
                }
                setSending(false);
                console.log('RESULT: ', result);
              }}
            >
              Upload to IPFS
            </Button>

            <div style={{ padding: 16, paddingBottom: 150 }}>
              {ipfsHash}
            </div>

          </Route>
          <Route path="/ipfsdown">
            <div style={{ paddingTop: 32, width: 740, margin: 'auto' }}>
              <Input
                value={ipfsDownHash}
                placeHolder="IPFS hash (like QmadqNw8zkdrrwdtPFK1pLi8PPxmkQ4pDJXY8ozHtz6tZq)"
                onChange={(e) => setIpfsDownHash(e.target.value)}
              />
            </div>
            <Button
              style={{ margin: 8 }}
              loading={sending}
              size="large"
              shape="round"
              type="primary"
              onClick={async () => {
                console.log('DOWNLOADING... ', ipfsDownHash);
                setDownloading(true);
                setIpfsContent();
                // addToIPFS(JSON.stringify(yourJSON))
                const result = await getFromIPFS(ipfsDownHash);
                if (result && result.toString) {
                  setIpfsContent(result.toString());
                }
                setDownloading(false);
              }}
            >
              Download from IPFS
            </Button>

            <pre
              style={{
                width: 500,
                margin: 'auto',
                padding: 16,
                paddingBottom: 150,
              }}
            >
              {ipfsContent}
            </pre>
          </Route>
          <Route path="/debugcontracts">
            <Contract
              address={address}
              blockExplorer={blockExplorer}
              name="YourCollectible"
              provider={localProvider}
              signer={userSigner?.getSigner()}
            />
          </Route>
        </Switch>
      </BrowserRouter>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div
        style={{
          position: 'fixed',
          textAlign: 'right',
          right: 0,
          top: 0,
          padding: 10,
        }}
      >
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          mainnetProvider={mainnetProvider}
          price={price}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
        {faucetHint}
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: 0,
          padding: 10,
          textAlign: 'left',
        }}
      >
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: 'center', opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: 'center', opacity: 1 }}>
            <Button
              onClick={() => window.open('https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA')}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">💬</span>
              Support
            </Button>
          </Col>
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              // if the local provider has a signer, let's show the faucet:
              !faucetAvailable ? '' : (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              )
            }
          </Col>
        </Row>
      </div>

    </div>
  );
};

if (window.ethereum) {
  window.ethereum.on('chainChanged', (chainId) => {
    console.log('chainId: ', chainId);
    setTimeout(() => {
      window.location.reload();
    }, 1);
  });
}

export default App;
