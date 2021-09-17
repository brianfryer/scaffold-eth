import React, { useState, useEffect } from 'react';
import { Input } from 'antd';

// small change in useEffect, display currentValue if it's provided by user

/*
  ~ What it does? ~

  Displays input field for ETH/USD amount, with an option to convert between ETH and USD

  ~ How can I use? ~

  <EtherInput
    autofocus
    price={price}
    value=100
    placeholder="Enter amount"
    onChange={value => {
      setAmount(value);
    }}
  />

  ~ Features ~

  - Provide price={price} of ether and easily convert between USD and ETH
  - Provide value={value} to specify initial amount of ether
  - Provide placeholder='Enter amount' value for the input
  - Control input change by onChange={value => { setAmount(value);}}
*/

const EtherInput = ({
  autoFocus,
  onChange,
  placeholder,
  price,
  value,
}) => {
  const [mode, setMode] = useState(price ? 'USD' : 'ETH');
  const [display, setDisplay] = useState();
  const [val, setVal] = useState();

  const currentValue = typeof value !== 'undefined' ? value : val;

  const handleClick = () => {
    if (mode === 'USD') {
      setMode('ETH');
      setDisplay(currentValue);
    } else {
      setMode('USD');
      if (currentValue) {
        const usdValue = String(parseFloat(currentValue) * price).toFixed(2);
        setDisplay(usdValue);
      } else {
        setDisplay(currentValue);
      }
    }
  };

  const option = (title) => (!price ? '' : (
    <div
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
      onKeyDown={handleClick}
      role="button"
      tabIndex={0}
    >
      {title}
    </div>
  ));

  let prefix;
  let addonAfter;
  if (mode === 'USD') {
    prefix = '$';
    addonAfter = option('USD 🔀');
  } else {
    prefix = 'Ξ';
    addonAfter = option('ETH 🔀');
  }

  useEffect(() => {
    if (!currentValue) {
      setDisplay('');
    }
  }, [currentValue]);

  return (
    <Input
      placeholder={placeholder || `amount in ${mode}`}
      autoFocus={autoFocus}
      prefix={prefix}
      value={display}
      addonAfter={addonAfter}
      onChange={async (e) => {
        const newValue = e.target.value;
        if (mode === 'USD') {
          const possibleNewValue = parseFloat(newValue);
          if (possibleNewValue) {
            const ethValue = possibleNewValue / price;
            setVal(ethValue);
            if (typeof onChange === 'function') {
              onChange(ethValue);
            }
            setDisplay(newValue);
          } else {
            setDisplay(newValue);
          }
        } else {
          setVal(newValue);
          if (typeof onChange === 'function') {
            onChange(newValue);
          }
          setDisplay(newValue);
        }
      }}
    />
  );
};

export default EtherInput;
