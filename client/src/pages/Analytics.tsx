import React, {useRef, useEffect, useState, ReactNode} from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin, Typography, Collapse, Space, Tabs, Timeline, Divider } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart } from 'recharts';
import axios from 'axios';
import { ClockCircleOutlined, CheckCircleOutlined, CalendarOutlined, LinkOutlined, AudioOutlined, BarChartOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';

const { Column } = Table;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

interface MarkdownComponentProps {
  children?: ReactNode;
  href?: string;
}

interface AudioData {
  _id: string;
  filename: string;
  size: number;
  contentType: string;
  transcription: string;
  processed: boolean;
  uploadDate: string;
  summary: string;
  actionItems: string;
  mom: string;
  speakers: string;
}

interface AnalyticsData {
  totalAudios: number;
  processedAudios: number;
  dailyUploads: Array<{_id: string; count: number}>;
  avgSize: number;
  totalMeetings: number;
  recentAudios?: AudioData[];
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 2000;

    const fetchAnalytics = async () => {
      try {
        console.log('Fetching analytics data...');
        const [analyticsResponse, meetingsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/analytics'),
          axios.get('http://localhost:5000/api/analytics/meetings')
        ]);
        
        console.log('Received analytics data:', analyticsResponse.data);
        console.log('Received meetings data:', meetingsResponse.data);
        
        const data = {
          ...analyticsResponse.data,
          recentAudios: meetingsResponse.data
        };

        const isValidData = data && 
          typeof data.totalAudios === 'number' &&
          typeof data.processedAudios === 'number' &&
          Array.isArray(data.dailyUploads) &&
          typeof data.avgSize === 'number' &&
          typeof data.totalMeetings === 'number' &&
          Array.isArray(data.recentAudios);

        console.log('Is data valid?', isValidData);
        console.log('Recent audios:', data.recentAudios);

        if (isValidData) {
          if (isMounted) {
            setAnalyticsData(data);
            setLoading(false);
          }
        } else if (retryCount < maxRetries) {
          console.log('Invalid data, retrying...');
          retryCount++;
          setTimeout(fetchAnalytics, retryDelay);
        } else {
          if (isMounted) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        if (retryCount < maxRetries && isMounted) {
          retryCount++;
          setTimeout(fetchAnalytics, retryDelay);
        } else if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

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
    }[] = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      radius: Math.random() * 3 + 2,
      color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
      hover: false,
    }));
  
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
    
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.fill();
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading analytics data..." />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <div>Error loading analytics data. Please refresh the page.</div>
      </div>
    );
  }

  const processedPercentage = analyticsData.totalAudios > 0 
    ? ((analyticsData.processedAudios / analyticsData.totalAudios) * 100).toFixed(1)
    : '0';
  const avgSizeMB = analyticsData.avgSize ? (analyticsData.avgSize / (1024 * 1024)).toFixed(2) : '0';

  const meetingStats = analyticsData.dailyUploads?.map(day => ({
    name: new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' }),
    meetings: day.count
  })) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderActionItems = (items: string) => {
    const bulletPoints = items.split('*').filter(item => item.trim());
    return (
      <Timeline>
        {bulletPoints.map((item, index) => (
          <Timeline.Item 
            key={index} 
            dot={<CheckCircleOutlined style={{ fontSize: '16px' }} />}
            color="green"
          >
            {item.trim()}
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  const renderMeetingMinutes = (mom: string) => {
    const sections = mom.split('###').filter(section => section.trim());
    
    return (
      <div className="meeting-minutes" style={{ padding: '20px' }}>
        {sections.map((section, index) => {
          const lines = section.split('\n').filter(line => line.trim());
          const title = lines[0];
          const content = lines.slice(1).join('\n');

          if (index === 0) {
            const headerMatch = content.match(/\*\*Meeting Title:\*\* (.*?) \*\*Date:\*\* (.*)/);
            if (headerMatch) {
              return (
                <div key={index} className="meeting-header" style={{ marginBottom: '24px' }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Title level={3}>{headerMatch[1]}</Title>
                    <Space>
                      <CalendarOutlined />
                      <Text type="secondary">{headerMatch[2]}</Text>
                    </Space>
                  </Space>
                  <Divider />
                </div>
              );
            }
          }

          return (
            <div key={index} className="meeting-section" style={{ marginBottom: '24px' }}>
              <Title level={4}>{title}</Title>
              <div className="section-content" style={{ marginLeft: '16px' }}>
                <ReactMarkdown
                  components={{
                    p: ({ children }: MarkdownComponentProps) => <Paragraph>{children}</Paragraph>,
                    ul: ({ children }: MarkdownComponentProps) => (
                      <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>{children}</ul>
                    ),
                    li: ({ children }: MarkdownComponentProps) => <li style={{ marginBottom: '8px' }}>{children}</li>,
                    strong: ({ children }: MarkdownComponentProps) => <Text strong>{children}</Text>,
                    a: ({ children, href }: MarkdownComponentProps) => (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {children} <LinkOutlined style={{ fontSize: '12px' }} />
                      </a>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
              <Divider />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
        <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'none',
          opacity: 1
        }}
      />
      <div style={{ 
        padding: '24px',
        position: 'relative',
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.85)'
      }}>
        <Title level={2}>Analytics Dashboard</Title>
      <Row gutter={[24, 24]}>
        <Col span={6}>
            <Card bordered={false} className="dashboard-card stat-card" style={{ background: '#EEF2FF' }}>
            <Statistic
                title={<Text style={{ color: '#4B5563' }}>Total Audio Files</Text>}
                value={analyticsData.totalAudios}
                prefix={<AudioOutlined style={{ color: '#4338CA', fontSize: '24px', background: '#C7D2FE', padding: '8px', borderRadius: '50%' }} />}
                valueStyle={{ color: '#1E293B', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
            <Card bordered={false} className="dashboard-card stat-card" style={{ background: '#FDF2F8' }}>
            <Statistic
                title={<Text style={{ color: '#4B5563' }}>Processed Files</Text>}
                value={processedPercentage}
                suffix="%"
                prefix={<CheckCircleOutlined style={{ color: '#BE185D', fontSize: '24px', background: '#FCE7F3', padding: '8px', borderRadius: '50%' }} />}
                valueStyle={{ color: '#1E293B', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
            <Card bordered={false} className="dashboard-card stat-card" style={{ background: '#ECFDF5' }}>
            <Statistic
                title={<Text style={{ color: '#4B5563' }}>Average File Size</Text>}
                value={avgSizeMB}
                suffix="MB"
                prefix={<BarChartOutlined style={{ color: '#065F46', fontSize: '24px', background: '#D1FAE5', padding: '8px', borderRadius: '50%' }} />}
                valueStyle={{ color: '#1E293B', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={6}>
            <Card bordered={false} className="dashboard-card stat-card" style={{ background: '#F3E8FF' }}>
            <Statistic
                title={<Text style={{ color: '#4B5563' }}>Total Meetings</Text>}
                value={analyticsData.totalMeetings}
                prefix={<CalendarOutlined style={{ color: '#6B21A8', fontSize: '24px', background: '#F5D0FE', padding: '8px', borderRadius: '50%' }} />}
                valueStyle={{ color: '#1E293B', fontSize: '28px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card title="Weekly Activity Distribution" className="analytics-chart-card">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={analyticsData.dailyUploads} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    stroke="#666"
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#666"
                    label={{ value: 'Number of Files', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#666"
                    label={{ value: 'Average Size (MB)', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '10px'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'Avg Size (MB)') {
                        return [`${value} MB`, name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar 
                    yAxisId="left"
                    dataKey="totalUploads" 
                    name="Total Uploads" 
                    fill="#8884d8" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="processedFiles" 
                    name="Processed Files" 
                    fill="#82ca9d"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="totalWithMoM"
                    name="With Minutes"
                    fill="#ff7c7c"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="averageSize"
                    name="Avg Size (MB)"
                    fill="#ffc658"
                    stroke="#ffc658"
                    fillOpacity={0.3}
                  />
                </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={12}>
            <Card title="Recent Audio Details">
              <Collapse>
                <Panel header="Audio Information" key="1">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Filename:</Text>
                      <Text> videoplayback (1).webm</Text>
                    </div>
                    <div>
                      <Text strong>Upload Date:</Text>
                      <Text> {formatDate("2025-04-17T21:15:05.371Z")}</Text>
                    </div>
                    <div>
                      <Text strong>Size:</Text>
                      <Text> {(6979914 / (1024 * 1024)).toFixed(2)} MB</Text>
                    </div>
                    <div>
                      <Text strong>Status:</Text>
                      <Tag color="green">Processed</Tag>
                    </div>
                  </Space>
                </Panel>
                <Panel header="Summary" key="2">
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    {analyticsData.recentAudios?.[0]?.summary || "The speaker argues against pursuing a pure machine learning (ML) path for freshers in 2024 due to a hiring slowdown in the field and the rise of generative AI. They suggest that while ML experience is valuable, it's now harder for new graduates to secure those roles..."}
                  </Paragraph>
                </Panel>
                <Panel header="Action Items" key="3">
                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                    • Consider focusing on Generative AI and prompt engineering
                    • Learn backend (Django, FastAPI, Flask, ExpressJS)
                    • Explore alternative career paths
                    • Adapt to the changing market
                  </Paragraph>
                </Panel>
                <Panel header="Meeting Minutes" key="4">
                  <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                    <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                      {analyticsData.recentAudios?.[0]?.mom}
                    </Paragraph>
                  </div>
                </Panel>
              </Collapse>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
            <Card title="Past Meetings Archive">
              <Tabs defaultActiveKey="1">
                <TabPane tab="Meeting Minutes" key="1">
                  <Collapse accordion>
                    {analyticsData?.recentAudios && analyticsData.recentAudios.length > 0 ? (
                      analyticsData.recentAudios.map((audio, index) => {
                        console.log('Rendering audio:', audio);
                        return (
                          <Panel 
                            key={audio._id}
                            header={
                              <Space>
                                <ClockCircleOutlined />
                                <Text strong>Meeting from {formatDate(audio.uploadDate)}</Text>
                                <Tag color="blue">{audio.filename}</Tag>
                                {audio.processed && <Tag color="green">Processed</Tag>}
                              </Space>
                            }
                          >
                            <div style={{ maxHeight: '600px', overflow: 'auto' }}>
                              {audio.mom && renderMeetingMinutes(audio.mom)}
                            </div>
                          </Panel>
                        );
                      })
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center' }}>
                        <Text type="secondary">No meeting records found</Text>
                      </div>
                    )}
                  </Collapse>
                </TabPane>
                <TabPane tab="Action Items" key="2">
                  <Card>
                    <Title level={4}>Action Items from Past Meetings</Title>
                    {analyticsData?.recentAudios && analyticsData.recentAudios.length > 0 ? (
                      analyticsData.recentAudios.map((audio, index) => (
                        <div key={audio._id} style={{ marginBottom: '24px' }}>
                          <Space style={{ marginBottom: '12px' }}>
                            <Text strong>{formatDate(audio.uploadDate)}</Text>
                            <Tag color="blue">{audio.filename}</Tag>
                          </Space>
                          {audio.actionItems && renderActionItems(audio.actionItems)}
                          <Divider />
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center' }}>
                        <Text type="secondary">No action items found</Text>
            </div>
                    )}
                  </Card>
                </TabPane>
              </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
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
    </>
  );
};

export default Analytics; 