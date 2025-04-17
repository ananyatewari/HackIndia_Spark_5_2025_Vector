import React, { useState, useEffect } from 'react';
import { Card, Row, Col, List, Typography, Button, Space, Statistic, Tag, Empty, Spin } from 'antd';
import { 
  PlusOutlined, 
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { meetingService, Meeting } from '../services/meetingService';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [pastMeetings, stats] = await Promise.all([
        meetingService.getMeetings({ past: true }),
        meetingService.getMeetingStatistics()
      ]);

      setRecentMeetings(pastMeetings.slice(0, 5));
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'zoom':
        return 'blue';
      case 'google-meet':
        return 'green';
      case 'teams':
        return 'purple';
      default:
        return 'default';
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Welcome to Speakly</Title>
          <Text type="secondary">Your AI Meeting Assistant</Text>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/meetings')}
            style={{ 
              background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
              border: 'none'
            }}
          >
            New Meeting
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                <span>Recent Meetings</span>
              </Space>
            }
            bordered={false}
            className="dashboard-card"
          >
            <Spin spinning={loading}>
              {recentMeetings.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={recentMeetings}
                  renderItem={(meeting) => (
                    <List.Item
                      extra={
                        <Space>
                          <Tag color={getMeetingTypeColor(meeting.type)}>
                            {meeting.type}
                          </Tag>
                        </Space>
                      }
                    >
                      <List.Item.Meta
                        title={meeting.title}
                        description={
                          <Space>
                            <ClockCircleOutlined />
                            {`${dayjs(meeting.date).format('MMM D, YYYY')} at ${meeting.time}`}
                          </Space>
                        }
                      />
                      {meeting.description && (
                        <Text type="secondary">{meeting.description}</Text>
                      )}
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No recent meetings" />
              )}
            </Spin>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <CheckCircleOutlined />
                <span>Meeting Statistics</span>
              </Space>
            }
            bordered={false}
            className="dashboard-card"
          >
            <Spin spinning={loading}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Total Meetings"
                    value={statistics?.totalMeetings || 0}
                    prefix={<CalendarOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Recurring Meetings"
                    value={statistics?.recurringMeetings || 0}
                    prefix={<TeamOutlined />}
                  />
                </Col>
              </Row>
              {statistics?.meetingsByType && (
                <div style={{ marginTop: 24 }}>
                  <Text strong>Meeting Types</Text>
                  <div style={{ marginTop: 8 }}>
                    {Object.entries(statistics.meetingsByType).map(([type, count]) => (
                      <Tag 
                        color={getMeetingTypeColor(type)} 
                        style={{ margin: '4px' }}
                        key={type}
                      >
                        {type}: {count}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Spin>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .dashboard-card {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 
                      0 2px 4px rgba(0, 0, 0, 0.03), 
                      0 4px 8px rgba(0, 0, 0, 0.03);
          border-radius: 8px;
          height: 100%;
        }
        .ant-list-item {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 8px;
          border: 1px solid #f0f2f5;
          transition: all 0.3s;
        }
        .ant-list-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
          background: #fafafa;
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 