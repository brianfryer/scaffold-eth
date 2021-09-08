import Notify from 'bnc-notify';
import { hexlify } from '@ethersproject/bytes';
import { notification } from 'antd';
import { parseUnits } from '@ethersproject/units';

import { BLOCKNATIVE_DAPPID } from '../constants';

// this should probably just be renamed to 'notifier'
// it is basically just a wrapper around BlockNative's wonderful Notify.js
// https://docs.blocknative.com/notify

const Transactor = (provider, gasPrice, etherscan) => {
  if (typeof provider === 'undefined') return;

  // eslint-disable-next-line consistent-return
  return async (tx) => {
    const signer = provider.getSigner();
    const network = await provider.getNetwork();
    console.log('network', network);
    const options = {
      dappId: BLOCKNATIVE_DAPPID, // GET YOUR OWN KEY AT https://account.blocknative.com
      system: 'ethereum',
      networkId: network.chainId,
      // darkMode: Boolean, // (default: false)
      // eslint-disable-next-line consistent-return
      transactionHandler: (txInformation) => console.log('HANDLE TX', txInformation),
    };
    const notify = Notify(options);

    const etherscanNetwork = network.name && network.chainId > 1
      ? `${network.name}.`
      : '';

    const etherscanTxUrl = network.chainId === 100
      ? 'https://blockscout.com/poa/xdai/tx/'
      : `https://${etherscanNetwork}etherscan.io/tx/`;

    try {
      let result;
      if (tx instanceof Promise) {
        console.log('AWAITING TX', tx);
        result = await tx;
      } else {
        if (!tx.gasPrice) {
          // eslint-disable-next-line no-param-reassign
          tx.gasPrice = gasPrice || parseUnits('4.1', 'gwei');
        }
        if (!tx.gasLimit) {
          // eslint-disable-next-line no-param-reassign
          tx.gasLimit = hexlify(120000);
        }
        console.log('RUNNING TX', tx);
        result = await signer.sendTransaction(tx);
      }
      console.log('RESULT:', result);
      // console.log('Notify', notify);

      // if it is a valid Notify.js network, use that, if not, just send a default notification
      if ([1, 3, 4, 5, 42, 100].indexOf(network.chainId) >= 0) {
        const { emitter } = notify.hash(result.hash);
        emitter.on('all', (transaction) => ({
          onclick: () => window.open(`${etherscan || etherscanTxUrl}${transaction.hash}`),
        }));
      } else {
        notification.info({
          message: 'Local Transaction Sent',
          description: result.hash,
          placement: 'bottomRight',
        });
      }

      return result;
    } catch (e) {
      console.log(e);
      console.log('Transaction Error:', e.message);
      notification.error({
        message: 'Transaction Error',
        description: e.message,
      });
    }
  };
};

export default Transactor;
