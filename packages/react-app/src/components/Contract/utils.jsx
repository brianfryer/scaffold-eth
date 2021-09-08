import React from 'react';
import { ethers } from 'ethers';
import { Address } from '..';

const tryToDisplay = (thing) => {
  if (thing && thing.toNumber) {
    try {
      return thing.toNumber();
    } catch (e) {
      return `Ξ${ethers.utils.formatUnits(thing, 'ether')}`;
    }
  }

  if (thing?.indexOf('0x') === 0 && thing.length === 42) {
    return <Address address={thing} fontSize={22} />;
  }

  return JSON.stringify(thing);
};

export default tryToDisplay;
