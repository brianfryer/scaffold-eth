import Blockies from 'react-blockies';
import React, { useState, useCallback } from 'react';
import { Input, Button, Tooltip } from 'antd';
import { parseEther } from '@ethersproject/units';
import { SendOutlined } from '@ant-design/icons';
import { useLookupAddress } from 'eth-hooks';

import { Transactor } from '../helpers';

import Wallet from './Wallet';

// improved a bit by converting address to ens if it exists
// added option to directly input ens name
// added placeholder option

/*
  ~ What it does? ~

  Displays a local faucet to send ETH to given address, also wallet is provided

  ~ How can I use? ~

  <Faucet
    price={price}
    localProvider={localProvider}
    ensProvider={mainnetProvider}
    placeholder={'Send local faucet'}
  />

  ~ Features ~

  - Provide price={price} of ether and convert between USD and ETH in a wallet
  - Provide localProvider={localProvider} to be able to send ETH to given address
  - Provide ensProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. '0xa870' => 'user.eth') or you can enter directly ENS name instead of address
              works both in input field & wallet
  - Provide placeholder="Send local faucet' value for the input
*/

const Faucet = ({
  ensProvider,
  localProvider,
  onChange,
  placeholder,
  price,
}) => {
  const [address, setAddress] = useState();
  const blockie = (address && typeof address.toLowerCase === 'function')
    ? <Blockies seed={address.toLowerCase()} size={8} scale={4} />
    : <div />;

  const ens = useLookupAddress(ensProvider, address);

  const updateAddress = useCallback(
    async (newValue) => {
      if (typeof newValue !== 'undefined') {
        let _address = newValue;
        if (_address.indexOf('.eth') > 0 || _address.indexOf('.xyz') > 0) {
          try {
            const possibleAddress = await ensProvider.resolveName(_address);
            if (possibleAddress) {
              _address = possibleAddress;
            }
            // eslint-disable-next-line no-empty
          } catch (e) {}
        }
        setAddress(_address);
      }
    },
    [ensProvider],
  );

  const tx = Transactor(localProvider);

  return (
    <span>
      <Input
        size="large"
        placeholder={placeholder || 'local faucet'}
        prefix={blockie}
        // value={address}
        value={ens || address}
        onChange={(e) => {
          // setAddress(e.target.value);
          updateAddress(e.target.value);
        }}
        suffix={(
          <Tooltip title="Faucet: Send local ether to an address.">
            <Button
              onClick={() => {
                tx({
                  to: address,
                  value: parseEther('0.5'),
                });
                setAddress('');
              }}
              shape="circle"
              icon={<SendOutlined />}
            />
            <Wallet
              color="#888888"
              ensProvider={ensProvider}
              price={price}
              provider={localProvider}
            />
          </Tooltip>
        )}
      />
    </span>
  );
};

export default Faucet;
