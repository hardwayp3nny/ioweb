import React, { useState, useEffect } from 'react';
import { List, Typography } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './styles.css';


const { Title } = Typography;

function TutorialsList() {
  const [tutorials, setTutorials] = useState([]);

  useEffect(() => {
    axios.get('/api/tutorials')
      .then(response => setTutorials(response.data));
  }, []);

  return (
    <div>
      <Title level={2}>Tutorials</Title>
      <List
        bordered
        dataSource={tutorials}
        renderItem={item => (
          <List.Item>
            <Link to={`/tutorials/${item}`}>{item}</Link>
          </List.Item>
        )}
      />
    </div>
  );
}

export default TutorialsList;
