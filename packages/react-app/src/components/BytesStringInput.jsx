import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { utils, constants } from 'ethers';

/*
  ~ What it does? ~

  Displays input field with options to convert between STRING and BYTES32

  ~ How can I use? ~

  <BytesStringInput
    autofocus
    value={'scaffold-eth'}
    placeholder='Enter value...'
    onChange={value => {
      setVal(value);
    }}
  />

  ~ Features ~

  - Provide value={value} to specify initial string
  - Provide placeholder='Enter value...' value for the input
  - Control input change by onChange={value => { setVal(value);}}

*/

const BytesStringInput = ({
  autoFocus,
  onChange,
  placeholder,
  price,
  value,
}) => {
  const [mode, setMode] = useState('STRING');
  const [display, setDisplay] = useState();
  const [val, setVal] = useState(constants.HashZero);

  // current value is the value in bytes32
  const currentValue = typeof value !== 'undefined' ? value : val;

  const option = (title) => {
    const handleClick = () => {
      if (mode === 'STRING') {
        setMode('BYTES32');
        if (!utils.isHexString(currentValue)) {
          // in case user enters invalid bytes32 number,
          // it considers it as string and converts to bytes32
          const changedValue = utils.formatBytes32String(currentValue);
          setDisplay(changedValue);
        } else {
          setDisplay(currentValue);
        }
      } else {
        setMode('STRING');
        if (currentValue && utils.isHexString(currentValue)) {
          setDisplay(utils.parseBytes32String(currentValue));
        } else {
          setDisplay(currentValue);
        }
      }
    };

    return (
      <div
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
        onKeyDown={handleClick}
        role="button"
        tabIndex={0}
      >
        {title}
      </div>
    );
  };

  const addonAfter = (mode === 'STRING') ? option('STRING 🔀') : option('BYTES32 🔀');

  useEffect(() => {
    if (!currentValue) {
      setDisplay('');
    }
  }, [currentValue]);

  return (
    <Input
      placeholder={placeholder || `Enter value in ${mode}`}
      autoFocus={autoFocus}
      value={display}
      addonAfter={addonAfter}
      onChange={async (e) => {
        if (mode === 'STRING') {
          // const ethValue = parseFloat(newValue) / price;
          // setVal(ethValue);
          if (typeof onChange === 'function') {
            onChange(utils.formatBytes32String(e.target.value));
          }
          setVal(utils.formatBytes32String(e.target.value));
          setDisplay(e.target.value);
        } else {
          if (typeof onChange === 'function') {
            onChange(e.target.value);
          }
          setVal(e.target.value);
          setDisplay(e.target.value);
        }
      }}
    />
  );
};

export default BytesStringInput;
