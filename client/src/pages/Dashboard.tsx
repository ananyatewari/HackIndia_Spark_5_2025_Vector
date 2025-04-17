import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, List, Typography, Button, Space, Statistic, Tag, Empty, Spin, Progress, Timeline, Tooltip, Avatar } from 'antd';
import { 
  PlusOutlined, 
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  AudioOutlined,
  FileTextOutlined,
  UserOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';
import { meetingService, Meeting } from '../services/meetingService';

const { Title, Text, Paragraph } = Typography;

interface Activity {
  id: string;
  type: 'processed' | 'scheduled' | 'cancelled' | 'minutes';
  meetingTitle: string;
  timestamp: string;
  description: string;
}

interface DashboardStats {
  totalMeetings: number;
  recurringMeetings: number;
  processedRecordings: number;
  meetingMinutes: number;
  meetingsByType: { [key: string]: number };
  recentActivities: Activity[];
}

const Dashboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [statistics, setStatistics] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
  
    if (!canvas || !ctx) return;
  
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
  
    const pastelColors = [
      '#ffd1dc', '#d1cfff', '#c0f7ff', '#d2f5c4',
      '#fff3b0', '#ffdfba', '#e0c3fc', '#fce1e4'
    ];
  
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      hover: boolean;
    }[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.3,
      vy: (Math.random() - 0.5) * 1.6,
      radius: Math.random() * 6 + 8,
      color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
      hover: false,
    }));
  
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        ctx.font = `${p.radius * 2}px Arial`;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillText('AI', p.x, p.y);
        ctx.shadowBlur = 0;
  
        p.x += p.vx;
        p.y += p.vy;
  
        if (p.x - p.radius < 0 || p.x + p.radius > width) p.vx *= -1;
        if (p.y - p.radius < 0 || p.y + p.radius > height) p.vy *= -1;
      });
      requestAnimationFrame(draw);
    };
  
    draw();
  
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [pastMeetings, stats, audioStats] = await Promise.all([
        meetingService.getMeetings({ past: true }),
        meetingService.getMeetingStatistics(),
        axios.get('http://localhost:5000/api/analytics')
      ]);

      const processedCount = audioStats.data.processedAudios || 0;
      const totalRecordings = audioStats.data.totalAudios || 0;

      const activities: Activity[] = [];
      
      if (audioStats.data.recentAudios) {
        audioStats.data.recentAudios.forEach((audio: any) => {
          if (audio.processed) {
            activities.push({
              id: `proc-${audio._id}`,
              type: 'processed',
              meetingTitle: audio.filename,
              timestamp: audio.processedDate || audio.uploadDate,
              description: `Recording processed: "${audio.filename}"`
            });
          }
        });
      }

      pastMeetings.slice(0, 10).forEach((meeting: Meeting) => {
        if (meeting.hasRecording && meeting.processed) {
          activities.push({
            id: `proc-${meeting._id}`,
            type: 'processed',
            meetingTitle: meeting.title,
            timestamp: meeting.processedDate || meeting.uploadDate || '',
            description: `Recording processed for "${meeting.title}"`
          });
        }
        if (meeting.mom) {
          activities.push({
            id: `min-${meeting._id}`,
            type: 'minutes',
            meetingTitle: meeting.title,
            timestamp: meeting.momGeneratedDate || '',
            description: `Minutes generated for "${meeting.title}"`
          });
        }
      });

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setRecentMeetings(pastMeetings.slice(0, 5));
      setStatistics({
        ...stats,
        processedRecordings: processedCount,
        meetingMinutes: totalRecordings,
        recentActivities: activities
      });
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
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Welcome to Speakly</Title>
          <Text type="secondary">Spotify of your work calls, but better !</Text>
        </Col>
        <Col>
          <Space>
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
          </Space>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="dashboard-card stat-card" style={{ background: '#EEF2FF' }}>
            <Statistic
              title={<Text style={{ color: '#4B5563' }}>Total Meetings</Text>}
              value={statistics?.totalMeetings || 0}
              prefix={<CalendarOutlined style={{ color: '#4338CA', fontSize: '24px', background: '#C7D2FE', padding: '8px', borderRadius: '50%' }} />}
              valueStyle={{ color: '#1E293B', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="dashboard-card stat-card" style={{ background: '#FDF2F8' }}>
            <Statistic
              title={<Text style={{ color: '#4B5563' }}>Recurring Meetings</Text>}
              value={statistics?.recurringMeetings || 0}
              prefix={<TeamOutlined style={{ color: '#BE185D', fontSize: '24px', background: '#FCE7F3', padding: '8px', borderRadius: '50%' }} />}
              valueStyle={{ color: '#1E293B', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="dashboard-card stat-card" style={{ background: '#ECFDF5' }}>
            <Statistic
              title={<Text style={{ color: '#4B5563' }}>Processed Recordings</Text>}
              value={statistics?.processedRecordings || 0}
              prefix={<AudioOutlined style={{ color: '#065F46', fontSize: '24px', background: '#D1FAE5', padding: '8px', borderRadius: '50%' }} />}
              valueStyle={{ color: '#1E293B', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="dashboard-card stat-card" style={{ background: '#F3E8FF' }}>
            <Statistic
              title={<Text style={{ color: '#4B5563' }}>Total Recordings</Text>}
              value={statistics?.meetingMinutes || 0}
              prefix={<FileTextOutlined style={{ color: '#6B21A8', fontSize: '24px', background: '#F5D0FE', padding: '8px', borderRadius: '50%' }} />}
              valueStyle={{ color: '#1E293B', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>

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
                        <Space direction="vertical" align="end">
                          <Tag color={getMeetingTypeColor(meeting.type)}>
                            {meeting.type}
                          </Tag>
                          {meeting.participants && (
                            <Avatar.Group maxCount={3} size="small">
                              {meeting.participants.map((participant, index) => (
                                <Tooltip title={participant} key={index}>
                                  <Avatar icon={<UserOutlined />} />
                                </Tooltip>
                              ))}
                            </Avatar.Group>
                          )}
                        </Space>
                      }
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            {meeting.title}
                            {meeting.isRecurring && (
                              <Tag color="purple">Recurring</Tag>
                            )}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={4}>
                            <Space>
                              <ClockCircleOutlined />
                              {`${dayjs(meeting.date).format('MMM D, YYYY')} at ${meeting.time}`}
                            </Space>
                            {meeting.description && (
                              <Paragraph ellipsis={{ rows: 2 }} type="secondary">
                                {meeting.description}
                              </Paragraph>
                            )}
                          </Space>
                        }
                      />
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
          <Row gutter={[0, 24]}>
            <Col span={24}>
              <Card 
                title={
                  <Space>
                    <BarChartOutlined />
                    <span>Meeting Analytics</span>
                  </Space>
                }
                bordered={false}
                className="dashboard-card"
              >
                <Spin spinning={loading}>
                  {statistics?.meetingsByType && (
                    <>
                      <Text strong>Meeting Types Distribution</Text>
                      <div style={{ marginTop: 16 }}>
                        {Object.entries(statistics.meetingsByType).map(([type, count]) => (
                          <div key={type} style={{ marginBottom: 12 }}>
                            <Space style={{ marginBottom: 4 }}>
                              <Tag color={getMeetingTypeColor(type)}>{type}</Tag>
                              <Text>{count} meetings</Text>
                            </Space>
                            <Progress 
                              percent={Math.round((Number(count) / statistics.totalMeetings) * 100)} 
                              strokeColor={type === 'zoom' ? '#1890ff' : '#52c41a'}
                              size="small"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </Spin>
              </Card>
            </Col>
            <Col span={24}>
              <Card 
                title={
                  <Space>
                    <CheckCircleOutlined />
                    <span>Recent Activities</span>
                  </Space>
                }
                bordered={false}
                className="dashboard-card"
              >
                {loading ? (
                  <Spin />
                ) : statistics?.recentActivities && statistics.recentActivities.length > 0 ? (
                  <Timeline
                    items={statistics.recentActivities.map(activity => ({
                      color: activity.type === 'processed' ? 'green' 
                        : activity.type === 'scheduled' ? 'blue'
                        : activity.type === 'cancelled' ? 'red'
                        : 'gray',
                      children: (
                        <div>
                          <Text>{activity.description}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {dayjs(activity.timestamp).format('MMM D, YYYY HH:mm')}
                          </Text>
                        </div>
                      )
                    }))}
                  />
                ) : (
                  <Empty description="No recent activities" />
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <style jsx>{`
        .dashboard-card {
          border-radius: 16px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
          padding: 24px !important;
        }
        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        .ant-card-body {
          padding: 0 !important;
        }
        .ant-statistic-title {
          margin-bottom: 16px !important;
          font-size: 14px !important;
        }
        .ant-statistic-content-prefix {
          margin-right: 16px !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
