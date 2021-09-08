import React from 'react';
import Blockies from 'react-blockies';

// provides a blockie image for the address using 'react-blockies' library

const Blockie = ({ address, ...rest }) => {
  if (!address || typeof address.toLowerCase !== 'function') {
    return <span />;
  }
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Blockies seed={address.toLowerCase()} {...rest} />;
};

export default Blockie;
