import React, { useEffect, useState } from 'react';
import { Typography, Button, Card, Spin, Tabs } from 'antd';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, TimeScale, LinearScale, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';
import axios from 'axios';
import './styles.css';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Legend, Filler);

function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProcessor, setSelectedProcessor] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://my-worker.abcdjza.workers.dev/data/processor-data', {
          timeout: 5000,
        });
        console.log('API response:', response.data);
        setData(response.data);
        if (response.data.processorData && response.data.processorData.length > 0) {
          setSelectedProcessor(response.data.processorData[0].processors[0].name);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Spin tip="Loading..." />;

  if (error) return <Typography.Text>数据加载失败: {error.message}</Typography.Text>;

  if (!data || !data.processorData) {
    console.error('Data format error:', data);
    return <Typography.Text>数据加载失败: 数据格式错误</Typography.Text>;
  }

  const processorNames = Array.from(new Set(data.processorData.flatMap(item => item.processors.map(p => p.name))));

  const generateChartData = () => ({
    labels: data.processorData.map(item => new Date(item.datetime)),
    datasets: processorNames.map((name, index) => {
      const isSelected = selectedProcessor === name;
      const color = getRandomColor(index);
      return {
        label: name,
        data: data.processorData.map(item => {
          const processor = item.processors.find(p => p.name === name);
          return processor ? parseFloat(processor.reward) : null;
        }),
        borderColor: isSelected ? color : 'rgba(128, 128, 128, 0.5)',
        backgroundColor: isSelected ? `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.1)` : 'rgba(128, 128, 128, 0.1)',
        fill: isSelected ? 'start' : false,
        spanGaps: true,
        borderWidth: isSelected ? 3 : 1,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      };
    })
  });

  const chartOptions = {
  responsive: true,
  scales: {
    x: {
      type: 'time',
      time: { unit: 'hour' },
      title: { display: true, text: 'Time' },
      grid: { display: false },
    },
    y: {
      title: { display: true, text: 'Reward IO/hour' },
      grid: { color: 'rgba(200, 200, 200, 0.3)' }
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      filter: function(tooltipItem) {
        return tooltipItem.datasetIndex === processorNames.indexOf(selectedProcessor);
      },
      callbacks: {
        label: function (context) {
          return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
        }
      }
    }
  },
  elements: {
    line: { tension: 0.4 }
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  },
  hover: {
    mode: 'nearest',
    intersect: false
  }
};

  return (
    <div style={{ minHeight: '100vh', padding: '0 24px' }}>
      <div style={{ textAlign: 'center' }}>
        <Title>Welcome to Our Platform</Title>
        <Paragraph>Explore the latest processor rewards and performance data.</Paragraph>
        <div>
          <Button type="primary" style={{ margin: '10px' }}>
            <Link to="/processor-rewards">View Processor Rewards</Link>
          </Button>
          <Button type="primary" style={{ margin: '10px' }}>
            <Link to="/tutorials">Our Tutorials</Link>
          </Button>
        </div>
        <Card title="Processor Reward Chart" style={{ marginTop: '20px' }}>
          <Tabs onChange={setSelectedProcessor} activeKey={selectedProcessor}>
            {processorNames.map(name => (
              <TabPane tab={name} key={name}>
                <Line data={generateChartData()} options={chartOptions} />
              </TabPane>
            ))}
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function getRandomColor(index) {
  const colors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
  ];
  return colors[index % colors.length];
}

export default Home;
