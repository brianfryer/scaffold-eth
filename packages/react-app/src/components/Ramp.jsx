import React, { useState } from 'react';
import { Button, Divider, Modal } from 'antd';
import { DollarCircleOutlined } from '@ant-design/icons';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';

// added display of 0 if price={price} is not provided

/*
  ~ What it does? ~

  Displays current ETH price and gives options to buy ETH through Wyre/Ramp/Coinbase
                            or get through Rinkeby/Ropsten/Kovan/Goerli

  ~ How can I use? ~

  <Ramp
    price={price}
    address={address}
  />

  ~ Features ~

  - Ramp opens directly in the application, component uses RampInstantSDK
  - Provide price={price} and current ETH price will be displayed
  - Provide address={address} and your address will be pasted into Wyre/Ramp instantly
*/

const Ramp = ({ networks, price, address }) => {
  const [modalUp, setModalUp] = useState('down');
  const type = 'default';
  const sendWyreUrl = `https://pay.sendwyre.com/purchase?destCurrency=ETH&sourceAmount=25&dest=${address}`;

  const allFaucets = Object
    .entries(networks)
    .filter(([, value]) => value.chainId !== 31337 && value.chainId !== 1)
    .map(([, {
      chainId,
      color,
      faucet,
      name,
    }]) => (
      <p key={chainId}>
        <Button
          style={{ color }}
          type={type}
          size="large"
          shape="round"
          onClick={() => window.open(faucet)}
        >
          {name}
        </Button>
      </p>
    ));

  return (
    <div>
      <Button
        size="large"
        shape="round"
        onClick={() => setModalUp('up')}
      >
        <DollarCircleOutlined style={{ color: '#52c41a' }} />
        {typeof price === 'undefined' ? 0 : price.toFixed(2)}
      </Button>
      <Modal
        title="Buy ETH"
        visible={modalUp === 'up'}
        onCancel={() => setModalUp('down')}
        footer={[
          <Button
            key="back"
            onClick={() => setModalUp('down')}
          >
            cancel
          </Button>,
        ]}
      >
        <p>
          <Button
            type={type}
            size="large"
            shape="round"
            onClick={() => window.open(sendWyreUrl)}
          >
            <span style={{ paddingRight: 15 }} role="img">
              <span role="img" aria-label="flag-us">🇺🇸</span>
            </span>
            Wyre
          </Button>
        </p>
        <p>
          <Button
            type={type}
            size="large"
            shape="round"
            onClick={() => (
              new RampInstantSDK({
                hostAppName: 'scaffold-eth',
                hostLogoUrl: 'https://scaffoldeth.io/scaffold-eth.png',
                swapAmount: '100000000000000000', // 0.1 ETH in wei  ?
                swapAsset: 'ETH',
                userAddress: address,
              })
                .on('*', (e) => console.log(e))
                .show()
            )}
          >
            <span style={{ paddingRight: 15 }} role="img">
              <span role="img" aria-label="flag-gb">🇬🇧</span>
            </span>
            Ramp
          </Button>
        </p>

        <p>
          <Button
            type={type}
            size="large"
            shape="round"
            onClick={() => window.open('https://www.coinbase.com/buy-ethereum')}
          >
            <span style={{ paddingRight: 15 }} role="img" aria-label="bank">
              🏦
            </span>
            Coinbase
          </Button>
        </p>

        <Divider />

        <h2>Testnet ETH</h2>

        {allFaucets}

      </Modal>
    </div>
  );
};

export default Ramp;
