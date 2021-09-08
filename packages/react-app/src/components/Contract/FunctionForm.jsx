import Blockies from 'react-blockies';
import React, { useState } from 'react';
import {
  Button,
  Col,
  Divider,
  Input,
  Row,
  Tooltip,
} from 'antd';
import { BigNumber } from '@ethersproject/bignumber';
import { hexlify } from '@ethersproject/bytes';
import { utils } from 'ethers';

import tryToDisplay from './utils';
import { Transactor } from '../../helpers';

const FunctionForm = ({
  contractFunction,
  functionInfo,
  gasPrice,
  provider,
  triggerRefresh,
}) => {
  const [form, setForm] = useState({});
  const [txValue, setTxValue] = useState();
  const [returnValue, setReturnValue] = useState();

  const tx = Transactor(provider, gasPrice);

  const inputs = functionInfo.inputs.map((input, i) => {
    const key = `${functionInfo.name}_${input.name}_${input.type}_${i}`;

    const handleToBytes32Click = async () => {
      if (utils.isHexString(form[key])) {
        const formUpdate = { ...form };
        formUpdate[key] = utils.parseBytes32String(form[key]);
        setForm(formUpdate);
      } else {
        const formUpdate = { ...form };
        formUpdate[key] = utils.formatBytes32String(form[key]);
        setForm(formUpdate);
      }
    };

    const handleToHexClick = async () => {
      if (utils.isHexString(form[key])) {
        const formUpdate = { ...form };
        formUpdate[key] = utils.toUtf8String(form[key]);
        setForm(formUpdate);
      } else {
        const formUpdate = { ...form };
        formUpdate[key] = utils.hexlify(utils.toUtf8Bytes(form[key]));
        setForm(formUpdate);
      }
    };

    const handleToUint256Click = async () => {
      const formUpdate = { ...form };
      formUpdate[key] = utils.parseEther(form[key]);
      setForm(formUpdate);
    };

    let buttons = '';

    if (input.type === 'bytes32') {
      buttons = (
        <Tooltip placement="right" title="to bytes32">
          <div
            type="dashed"
            style={{ cursor: 'pointer' }}
            onClick={handleToBytes32Click}
            onKeyDown={handleToBytes32Click}
            role="button"
            tabIndex={0}
          >
            #️⃣
          </div>
        </Tooltip>
      );
    } else if (input.type === 'bytes') {
      buttons = (
        <Tooltip placement="right" title="to hex">
          <div
            type="dashed"
            style={{ cursor: 'pointer' }}
            onClick={handleToHexClick}
            onKeyDown={handleToHexClick}
            role="button"
            tabIndex={0}
          >
            #️⃣
          </div>
        </Tooltip>
      );
    } else if (input.type === 'uint256') {
      buttons = (
        <Tooltip placement="right" title="* 10 * 18">
          <div
            type="dashed"
            style={{ cursor: 'pointer' }}
            onClick={handleToUint256Click}
            onKeyDown={handleToUint256Click}
            role="button"
            tabIndex={0}
          >
            ✴️
          </div>
        </Tooltip>
      );
    } else if (input.type === 'address') {
      const possibleAddress = form[key]?.toLowerCase().trim();
      if (possibleAddress && possibleAddress.length === 42) {
        buttons = (
          <Tooltip placement="right" title="blockie">
            <Blockies seed={possibleAddress} scale={3} />
          </Tooltip>
        );
      }
    }

    return (
      <div style={{ margin: 2 }} key={key}>
        <Input
          size="large"
          placeholder={input.name ? `${input.type} ${input.name}` : input.type}
          autoComplete="off"
          value={form[key]}
          name={key}
          onChange={(event) => {
            const formUpdate = { ...form };
            formUpdate[event.target.name] = event.target.value;
            setForm(formUpdate);
          }}
          suffix={buttons}
        />
      </div>
    );
  });

  const handleTooltipAClick = async () => {
    const floatValue = parseFloat(txValue);
    if (floatValue) {
      setTxValue(String(floatValue * 10 ** 18));
    }
  };

  const handleTooltipBClick = async () => {
    setTxValue(BigNumber.from(txValue).toHexString());
  };

  const txValueInput = (
    <div style={{ margin: 2 }} key="txValueInput">
      <Input
        placeholder="transaction value"
        onChange={(e) => setTxValue(e.target.value)}
        value={txValue}
        addonAfter={(
          <div>
            <Row>
              <Col span={16}>
                <Tooltip placement="right" title=" * 0^18 ">
                  <div
                    type="dashed"
                    style={{ cursor: 'pointer' }}
                    onClick={handleTooltipAClick}
                    onKeyDown={handleTooltipAClick}
                    role="button"
                    tabIndex={0}
                  >
                    ✳️
                  </div>
                </Tooltip>
              </Col>
              <Col span={16}>
                <Tooltip placement="right" title="number to ex">
                  <div
                    type="dashed"
                    style={{ cursor: 'pointer' }}
                    onClick={handleTooltipBClick}
                    onKeyDown={handleTooltipBClick}
                    role="button"
                    tabIndex={0}
                  >
                    #️⃣
                  </div>
                </Tooltip>
              </Col>
            </Row>
          </div>
        )}
      />
    </div>
  );

  if (functionInfo.payable) {
    inputs.push(txValueInput);
  }

  const buttonIcon = functionInfo.type === 'call' ? 'Read📡' : 'Send💸';

  const handleClick = async () => {
    const args = functionInfo.inputs.map((input, i) => {
      const key = `${functionInfo.name}_${input.name}_${input.type}_${i}`;
      let value = form[key];

      if (input.baseType === 'array') {
        value = JSON.parse(value);
      } else if (input.type === 'bool') {
        if (
          value === 'true'
          || value === '1'
          || value === '0x1'
          || value === '0x01'
          || value === '0x0001'
        ) {
          value = 1;
        } else {
          value = 0;
        }
      }

      return value;
    });

    let result;
    if (functionInfo.stateMutability === 'view' || functionInfo.stateMutability === 'pure') {
      const returned = await contractFunction(...args);
      result = tryToDisplay(returned);
    } else {
      const overrides = {};
      if (txValue) {
        overrides.value = txValue; // ethers.utils.parseEther()
      }
      // Uncomment this if you want to skip the gas estimation for each transaction
      // overrides.gasLimit = hexlify(1200000);

      // console.log("Running with extras",extras)
      const returned = await tx(contractFunction(...args, overrides));
      result = tryToDisplay(returned);
    }

    console.log('SETTING RESULT: ', result);
    setReturnValue(result);
    triggerRefresh(true);
  };

  inputs.push(
    <div style={{ cursor: 'pointer', margin: 2 }} key="goButton">
      <Input
        onChange={(e) => setReturnValue(e.target.value)}
        defaultValue=""
        bordered={false}
        disabled
        value={returnValue}
        suffix={(
          <div
            style={{ width: 50, height: 30, margin: 0 }}
            type="default"
            onClick={handleClick}
            onKeyDown={handleClick}
            role="button"
            tabIndex={0}
          >
            <span style={{ marginLeft: -32 }}>{buttonIcon}</span>
          </div>
        )}
      />
    </div>,
  );

  return (
    <div>
      <Row>
        <Col
          span={8}
          style={{
            fontSize: 24,
            opacity: 0.333,
            paddingRight: 6,
            textAlign: 'right',
          }}
        >
          {functionInfo.name}
        </Col>
        <Col span={16}>{inputs}</Col>
      </Row>
      <Divider />
    </div>
  );
};

export default FunctionForm;
