import React, { useState, useEffect } from 'react';
import { Table, Typography, Spin, Alert, Input, Select, Button, Card, Space, Row, Col } from 'antd';
import { CalculatorOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

const columns = [
  {
    title: 'Processor Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'IO Reward',
    dataIndex: 'reward',
    key: 'reward',
    render: reward => reward.toFixed(6),
  },
  {
    title: 'USDT Reward',
    dataIndex: 'usdtReward',
    key: 'usdtReward',
    render: (text, record) => (record.reward * record.ioPrice).toFixed(2),
  },
  {
    title: 'CNY Reward',
    dataIndex: 'cnyReward',
    key: 'cnyReward',
    render: (text, record) => (record.reward * record.ioPrice * record.usdCnyRate).toFixed(2),
  },
];

function ProcessorRewards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProcessor, setSelectedProcessor] = useState(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [roi, setRoi] = useState(null);

  useEffect(() => {
    axios.get('https://my-worker.abcdjza.workers.dev/data/processor-data')
      .then(response => {
        const { ioPrice, usdCnyRate, processorData } = response.data;
        const latestData = processorData[processorData.length - 1].processors.map(processor => ({
          ...processor,
          ioPrice,
          usdCnyRate
        }));
        setData(latestData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError(err.response ? err.response.data : 'Error fetching data');
        setLoading(false);
      });
  }, []);

  const calculateRoi = () => {
    if (!selectedProcessor || !purchasePrice) {
      alert('请选择处理器并输入购买价格');
      return;
    }

    const processor = data.find(p => p.name === selectedProcessor);
    if (!processor) {
      alert('未找到所选处理器');
      return;
    }

    const dailyRewardCny = processor.reward * processor.ioPrice * processor.usdCnyRate * 24;
    const daysToRoi = purchasePrice / dailyRewardCny;
    setRoi(daysToRoi.toFixed(2));
  };

  if (loading) return <Spin size="large" tip="Loading..." />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Processor Rewards</Title>
      <Table dataSource={data} columns={columns} rowKey="name" style={{ marginBottom: '24px' }} />

      <Card
        title={<Space><CalculatorOutlined /> ROI 计算器</Space>}
        style={{ marginTop: '24px' }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="选择处理器"
              onChange={value => setSelectedProcessor(value)}
            >
              {data.map(processor => (
                <Option key={processor.name} value={processor.name}>{processor.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Input
              placeholder="输入购买价格 (RMB)"
              value={purchasePrice}
              onChange={e => setPurchasePrice(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Button type="primary" onClick={calculateRoi} block>
              计算 ROI
            </Button>
          </Col>
        </Row>
        {roi && (
          <Alert
            message="ROI 计算结果"
            description={`预计回本周期: ${roi} 天`}
            type="success"
            showIcon
            style={{ marginTop: '16px' }}
          />
        )}
      </Card>
    </div>
  );
}

export default ProcessorRewards;
