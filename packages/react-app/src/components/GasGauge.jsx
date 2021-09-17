import React from 'react';
import { Button } from 'antd';

// added display of 0 instead of NaN if gas price is not provided

/*
  ~ What it does? ~

  Displays gas gauge

  ~ How can I use? ~

  <GasGauge gasPrice={gasPrice} />

  ~ Features ~

  - Provide gasPrice={gasPrice} and get current gas gauge
*/

const GasGauge = ({ gasPrice }) => {
  const label = `${typeof gasPrice === 'undefined' ? 0 : parseInt(gasPrice, 10) / 10 ** 9}g`;

  return (
    <Button
      onClick={() => window.open('https://ethgasstation.info/')}
      size="large"
      shape="round"
    >
      <span style={{ marginRight: 8 }}>
        <span role="img" aria-label="fuelpump">⛽️</span>
      </span>
      {label}
    </Button>
  );
};

export default GasGauge;
