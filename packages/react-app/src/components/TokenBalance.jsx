import React, { useState } from 'react';
import { formatEther } from '@ethersproject/units';
import { useTokenBalance } from 'eth-hooks';

const TokenBalance = ({
  address,
  balance,
  contracts,
  dollarMultiplier,
  img,
  name,
}) => {
  const [dollarMode, setDollarMode] = useState(true);
  const tokenContract = contracts && contracts[name];
  const _balance = useTokenBalance(tokenContract, address, 1777);
  let floatBalance = parseFloat('0.00');
  let usingBalance = _balance;

  if (typeof balance !== 'undefined') {
    usingBalance = balance;
  }

  if (usingBalance) {
    const etherBalance = formatEther(usingBalance);
    parseFloat(etherBalance).toFixed(2);
    floatBalance = parseFloat(etherBalance);
  }

  const displayBalance = dollarMultiplier && dollarMode
    ? `$${(floatBalance * dollarMultiplier).toFixed(2)}`
    : floatBalance.toFixed(4);

  return (
    <span
      style={{
        cursor: 'pointer',
        fontSize: 24,
        padding: 8,
        verticalAlign: 'middle',
      }}
      onClick={() => setDollarMode(!dollarMode)}
      onKeyDown={() => setDollarMode(!dollarMode)}
      role="button"
      tabIndex={0}
    >
      {img}
      {displayBalance}
    </span>
  );
};

export default TokenBalance;
