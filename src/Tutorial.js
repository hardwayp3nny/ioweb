import './styles.css';
import React, { useState, useEffect } from 'react';
import { Typography, Spin, Alert } from 'antd';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { marked } from 'marked';

const { Title } = Typography;

function Tutorial() {
  const { name } = useParams();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);  // Reset error on new request
    axios.get(`/api/tutorials/${name}`)
      .then(response => {
        setContent(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load content');
        setLoading(false);
        console.error(err);
      });
  }, [name]);

  if (loading) return <Spin tip="Loading..." />;
  if (error) return <Alert message={error} type="error" />;

  return (
    <div>
      <Title level={2}>{name}</Title>
      <div dangerouslySetInnerHTML={{ __html: marked(content) }} />
    </div>
  );
}

export default Tutorial;

