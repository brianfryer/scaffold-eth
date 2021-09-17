import React, { useCallback, useEffect, useState } from 'react';
import { Col, Divider, Row } from 'antd';
import tryToDisplay from './utils';

const DisplayVariable = ({
  contractFunction,
  functionInfo,
  refreshRequired,
  triggerRefresh,
}) => {
  const [variable, setVariable] = useState('');

  const refresh = useCallback(async () => {
    try {
      const funcResponse = await contractFunction();
      setVariable(funcResponse);
      triggerRefresh(false);
    } catch (e) {
      console.log(e);
    }
  }, [setVariable, contractFunction, triggerRefresh]);

  useEffect(() => {
    refresh();
  }, [refresh, refreshRequired, contractFunction]);

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
        <Col span={14}>
          <h2>{tryToDisplay(variable)}</h2>
        </Col>
        <Col span={2}>
          <h2>
            <button onClick={refresh} type="button">
              🔄
            </button>
          </h2>
        </Col>
      </Row>
      <Divider />
    </div>
  );
};

export default DisplayVariable;
