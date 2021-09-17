import Blockies from 'react-blockies';
import React from 'react';
import { Skeleton, Typography } from 'antd';
import { useThemeSwitcher } from 'react-css-theme-switcher';

import { useLookupAddress } from '../hooks';

// changed value={address} to address={address}

/*
  ~ What it does? ~

  Displays an address with a blockie image and option to copy address

  ~ How can I use? ~

  <Address
    address={address}
    ensProvider={mainnetProvider}
    blockExplorer={blockExplorer}
    fontSize={fontSize}
  />

  ~ Features ~

  - Provide ensProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth")
  - Provide blockExplorer={blockExplorer}, click on address and get the link
              (ex. by default "https://etherscan.io/" or for xdai "https://blockscout.com/poa/xdai/")
  - Provide fontSize={fontSize} to change the size of address text
*/

const { Text } = Typography;

const blockExplorerLink = (address, blockExplorer) => `${blockExplorer || 'https://etherscan.io/'}${'address/'}${address}`;

const Address = ({
  address,
  blockExplorer,
  ensProvider,
  fontSize,
  minimized,
  onChange,
  size,
  value,
}) => {
  const _address = value || address;
  const ens = useLookupAddress(ensProvider, _address);
  const { currentTheme } = useThemeSwitcher();

  if (!_address) {
    return (
      <span>
        <Skeleton avatar paragraph={{ rows: 1 }} />
      </span>
    );
  }

  let displayAddress = _address.substr(0, 6);

  if (ens?.indexOf('0x') < 0) {
    displayAddress = ens;
  } else if (size === 'short') {
    displayAddress += `...${_address.substr(-4)}`;
  } else if (size === 'long') {
    displayAddress = _address;
  }

  const etherscanLink = blockExplorerLink(_address, blockExplorer);

  if (minimized) {
    return (
      <span style={{ verticalAlign: 'middle' }}>
        <a
          href={etherscanLink}
          rel="noopener noreferrer"
          style={{ color: currentTheme === 'light' ? '#222222' : '#ddd' }}
          target="_blank"
        >
          <Blockies seed={_address.toLowerCase()} size={8} scale={2} />
        </a>
      </span>
    );
  }

  let text;
  if (onChange) {
    text = (
      <Text editable={{ onChange }} copyable={{ text: _address }}>
        <a
          href={etherscanLink}
          rel="noopener noreferrer"
          style={{ color: currentTheme === 'light' ? '#222222' : '#ddd' }}
          target="_blank"
        >
          {displayAddress}
        </a>
      </Text>
    );
  } else {
    text = (
      <Text copyable={{ text: _address }}>
        <a
          href={etherscanLink}
          rel="noopener noreferrer"
          style={{ color: currentTheme === 'light' ? '#222222' : '#ddd' }}
          target="_blank"
        >
          {displayAddress}
        </a>
      </Text>
    );
  }

  return (
    <span>
      <span style={{ verticalAlign: 'middle' }}>
        <Blockies
          seed={_address.toLowerCase()}
          size={8}
          scale={fontSize ? fontSize / 7 : 4}
        />
      </span>
      <span
        style={{
          verticalAlign: 'middle',
          paddingLeft: 5,
          fontSize: fontSize || 28,
        }}
      >
        {text}
      </span>
    </span>
  );
};

export default Address;
