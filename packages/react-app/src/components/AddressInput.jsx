import QrReader from 'react-qr-reader';
import React, { useState, useCallback } from 'react';
import { CameraOutlined, QrcodeOutlined } from '@ant-design/icons';
import { Input, Badge } from 'antd';
import { useLookupAddress } from 'eth-hooks';

import Blockie from './Blockie';

// probably we need to change value={toAddress} to address={toAddress}

/*
  ~ What it does? ~

  Displays an address input with QR scan option

  ~ How can I use? ~

  <AddressInput
    autoFocus
    ensProvider={mainnetProvider}
    placeholder="Enter address"
    value={toAddress}
    onChange={setToAddress}
  />

  ~ Features ~

  - Provide ensProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth") or you can enter directly ENS name instead of address
  - Provide placeholder="Enter address" value for the input
  - Value of the address input is stored in value={toAddress}
  - Control input change by onChange={setToAddress}
                          or onChange={address => { setToAddress(address);}}
*/

const AddressInput = ({
  autoFocus,
  ensProvider,
  onChange,
  placeholder,
  value,
}) => {
  const [val, setVal] = useState(value);
  const [scan, setScan] = useState(false);

  const currentValue = typeof value !== 'undefined' ? value : val;
  const ens = useLookupAddress(ensProvider, currentValue);

  const scannerButton = (
    <div
      style={{ marginTop: 4, cursor: 'pointer' }}
      onClick={() => setScan(!scan)}
      onKeyDown={() => setScan(!scan)}
      role="button"
      tabIndex={0}
    >
      <Badge
        count={(
          <CameraOutlined style={{ fontSize: 9 }} />
        )}
      >
        <QrcodeOutlined style={{ fontSize: 18 }} />
      </Badge>
      Scan
    </div>
  );

  const updateAddress = useCallback(
    async (newValue) => {
      if (typeof newValue !== 'undefined') {
        let address = newValue;
        if (address.indexOf('.eth') > 0 || address.indexOf('.xyz') > 0) {
          try {
            const possibleAddress = await ensProvider.resolveName(address);
            if (possibleAddress) {
              address = possibleAddress;
            }
            // eslint-disable-next-line no-empty
          } catch (e) {}
        }
        setVal(address);
        if (typeof onChange === 'function') {
          onChange(address);
        }
      }
    },
    [ensProvider, onChange],
  );

  const scanner = !scan ? '' : (
    <div
      style={{
        position: 'absolute',
        zIndex: 256,
        top: 0,
        left: 0,
        width: '100%',
      }}
      onClick={() => setScan(false)}
      onKeyDown={() => setScan(false)}
      role="button"
      tabIndex={0}
    >
      <QrReader
        delay={250}
        resolution={1200}
        onError={(e) => {
          console.log('SCAN ERROR: ', e);
          setScan(false);
        }}
        onScan={(newValue) => {
          if (newValue) {
            console.log('SCAN VALUE: ', newValue);
            let possibleNewValue = newValue;
            if (possibleNewValue.indexOf('/') >= 0) {
              possibleNewValue = possibleNewValue.substr(possibleNewValue.lastIndexOf('0x'));
              console.log('CLEANED VALUE: ', possibleNewValue);
            }
            setScan(false);
            updateAddress(possibleNewValue);
          }
        }}
        style={{ width: '100%' }}
      />
    </div>
  );

  return (
    <div>
      {scanner}
      <Input
        id="0xAddress" // name it something other than address for auto fill doxxing
        name="0xAddress" // name it something other than address for auto fill doxxing
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={placeholder || 'address'}
        prefix={<Blockie address={currentValue} size={8} scale={3} />}
        value={ens || currentValue}
        addonAfter={scannerButton}
        onChange={(e) => updateAddress(e.target.value)}
      />
    </div>
  );
};

export default AddressInput;
