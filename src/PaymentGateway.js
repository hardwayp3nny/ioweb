import React, { useState } from 'react';
import { Card, Input, Button, message } from 'antd';
import Web3 from 'web3';

const PaymentGateway = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const targetWallet = '0x1234567890123456789012345678901234567890'; // 替换为实际的目标钱包地址
  const pdfUrl = 'https://example.com/your-pdf-file.pdf'; // 替换为实际的 PDF 文件 URL

  const handlePayment = async () => {
    if (!window.ethereum) {
      message.error('Please install MetaMask!');
      return;
    }

    setLoading(true);

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(window.ethereum);

      const accounts = await web3.eth.getAccounts();
      const weiAmount = web3.utils.toWei(amount, 'ether');

      await web3.eth.sendTransaction({
        from: accounts[0],
        to: targetWallet,
        value: weiAmount
      });

      message.success('Payment successful! Downloading PDF...');
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Payment failed:', error);
      message.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Payment Gateway" style={{ maxWidth: 400, margin: '0 auto' }}>
      <Input
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Button type="primary" onClick={handlePayment} loading={loading} block>
        Pay and Download PDF
      </Button>
    </Card>
  );
};

export default PaymentGateway;
