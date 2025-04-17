import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Menu, Typography, Space } from 'antd';
import {
  DashboardOutlined,
  VideoCameraOutlined,
  TeamOutlined,
  BarChartOutlined,
  AudioOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set a default user ID if not present
    if (!localStorage.getItem('userId')) {
      const defaultUserId = 'user-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', defaultUserId);
    }
  }, []);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'meetings',
      icon: <VideoCameraOutlined />,
      label: 'Meetings',
      onClick: () => navigate('/meetings'),
    },
    {
      key: 'community',
      icon: <TeamOutlined />,
      label: 'Community',
      onClick: () => navigate('/community'),
    },
    {
      key: 'analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
      onClick: () => navigate('/analytics'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sider 
        width={250} 
        theme="light"
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="logo" style={{ 
          height: 80, 
          padding: '16px', 
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0',
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Space direction="vertical" size={0}>
            <Title level={3} style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AudioOutlined /> Speakly
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '12px' }}>
              Your AI Meeting Companion
            </Text>
          </Space>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          style={{ 
            borderRight: 0,
            height: 'calc(100vh - 80px)',
            overflowY: 'auto'
          }}
        />
      </Sider>
      <Layout style={{ marginLeft: 250, minHeight: '100vh' }}>
        <Content style={{ 
          margin: '24px',
          minHeight: 280,
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout; 