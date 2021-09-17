import React, { useState } from 'react';
import { formatEther } from '@ethersproject/units';
import { usePoller } from 'eth-hooks';

import { useBalance } from '../hooks';

/*
  ~ What it does? ~

  Displays a balance of given address in ether & dollar

  ~ How can I use? ~

  <Balance
    address={address}
    provider={mainnetProvider}
    price={price}
  />

  ~ If you already have the balance as a bignumber ~
  <Balance
    balance={balance}
    price={price}
  />

  ~ Features ~

  - Provide address={address} and get balance corresponding to given address
  - Provide provider={mainnetProvider} to access balance on mainnet
    or any other network (ex. localProvider)
  - Provide price={price} of ether and get your balance converted to dollars
*/

const Balance = ({
  address,
  balance,
  dollarMultiplier,
  price,
  provider,
  size,
  value,
}) => {
  const [dollarMode, setDollarMode] = useState(true);
  const [listening, setListening] = useState(false);

  const _balance = useBalance(provider, address);

  let floatBalance = parseFloat('0.00');

  let usingBalance = _balance;

  if (typeof balance !== 'undefined') {
    usingBalance = balance;
  }
  if (typeof value !== 'undefined') {
    usingBalance = value;
  }

  if (usingBalance) {
    const etherBalance = formatEther(usingBalance);
    parseFloat(etherBalance).toFixed(2);
    floatBalance = parseFloat(etherBalance);
  }

  let displayBalance = floatBalance.toFixed(4);

  const _price = price || dollarMultiplier;

  if (_price && dollarMode) {
    displayBalance = `$${(floatBalance * _price).toFixed(2)}`;
  }

  return (
    <span
      style={{
        cursor: 'pointer',
        padding: 8,
        fontSize: size || 24,
        verticalAlign: 'middle',
      }}
      onClick={() => setDollarMode(!dollarMode)}
      onKeyDown={() => setDollarMode(!dollarMode)}
      role="button"
      tabIndex={0}
    >
      {displayBalance}
    </span>
  );
};

export default Balance;
