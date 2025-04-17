import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, TimePicker, Select, Space, Row, Col, Table, Tabs, Calendar, Badge, Statistic, message, Checkbox, Upload, Tag, Divider, Typography } from 'antd';
import { PlusOutlined, UploadOutlined, CalendarOutlined, TeamOutlined, BarChartOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { meetingService, Meeting, MeetingStatistics } from '../services/meetingService';

const { Title } = Typography;

const Meetings: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [activeTab, setActiveTab] = useState('1');
  const [statistics, setStatistics] = useState<MeetingStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchMeetings();
    fetchStatistics();
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
    }[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 3,
      radius: Math.random() * 1 + 8,
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
        ctx.shadowBlur = 8;
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

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await meetingService.getMeetings();
      setMeetings(data);
    } catch (error) {
      message.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const data = await meetingService.getMeetingStatistics();
      if (!data) {
        throw new Error('No statistics data received');
      }
      setStatistics(data);
    } catch (error) {
      console.error('Statistics error:', error);
      message.error('Unable to load statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values);
      
      const meetingData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        participants: [],
        attendance: {},
        createdBy: localStorage.getItem('userId') || 'default-user', 
      };

      console.log('Meeting data to be sent:', meetingData);
      
      const response = await meetingService.createMeeting(meetingData);
      console.log('Server response:', response);

      message.success('Meeting created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchMeetings();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error creating meeting:', error.response?.data || error);
      message.error(error.response?.data?.message || 'Failed to create meeting');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (id: string) => {
    try {
      await meetingService.deleteMeeting(id);
      message.success('Meeting deleted successfully');
      fetchMeetings();
      fetchStatistics();
    } catch (error) {
      message.error('Failed to delete meeting');
    }
  };

  const onDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
  };

  const getListData = (date: Dayjs) => {
    return meetings.filter(meeting => dayjs(meeting.date).isSame(date, 'day'));
  };

  const cellRender = (date: Dayjs) => {
    const listData = getListData(date);
    return (
      <ul className="events">
        {listData.map((meeting) => (
          <li key={meeting._id}>
            <Badge status="success" text={meeting.title} />
          </li>
        ))}
      </ul>
    );
  };

  const handleUploadClick = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setUploadModalVisible(true);
  };

  const handleUploadCancel = () => {
    setUploadModalVisible(false);
    setSelectedMeetingId(null);
  };

  const handleUpload = async (file: File) => {
    if (!selectedMeetingId) return;
    
    try {
      setUploadLoading(true);
      await meetingService.uploadRecording(selectedMeetingId, file);
      message.success('Recording uploaded successfully');
      setUploadModalVisible(false);
      setSelectedMeetingId(null);
    } catch (error) {
      message.error('Failed to upload recording');
    } finally {
      setUploadLoading(false);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Recurring',
      dataIndex: 'isRecurring',
      key: 'isRecurring',
      render: (isRecurring: boolean) => isRecurring ? 
        <Tag color="green">Yes</Tag> : 
        <Tag color="default">No</Tag>,
    },
    {
      title: 'Pattern',
      dataIndex: 'recurrencePattern',
      key: 'recurrencePattern',
      render: (pattern: string) => pattern ? 
        <Tag color="purple">{pattern}</Tag> : 
        '-',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: Meeting) => {
        const now = dayjs();
        const meetingTime = dayjs(`${record.date} ${record.time}`);
        if (meetingTime.isBefore(now)) {
          return <Tag color="red">Past</Tag>;
        }
        if (meetingTime.isSame(now, 'day')) {
          return <Tag color="green">Today</Tag>;
        }
        return <Tag color="blue">Upcoming</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Meeting) => (
        <Space>
          <Button 
            icon={<UploadOutlined />} 
            onClick={() => handleUploadClick(record._id)}
          >
            Upload Recording
          </Button>
          <Button 
            type="primary" 
            danger 
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const statisticsColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Recording',
      key: 'recording',
      render: (_: any, record: Meeting) => (
        <Button 
          icon={<UploadOutlined />} 
          onClick={() => handleUploadClick(record._id)}
          type="link"
        >
          Upload
        </Button>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: Meeting) => {
        const now = dayjs();
        const meetingTime = dayjs(`${record.date} ${record.time}`);
        if (meetingTime.isBefore(now)) {
          return <Tag color="red">Past</Tag>;
        }
        if (meetingTime.isSame(now, 'day')) {
          return <Tag color="green">Today</Tag>;
        }
        return <Tag color="blue">Upcoming</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Meeting) => (
        <Button 
          type="link" 
          danger 
          onClick={() => handleDelete(record._id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const handleCreateMeeting = async (values: any) => {
    try {
      const meetingData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        createdBy: localStorage.getItem('userId') || 'default-user'
      };
      
      await meetingService.createMeeting(meetingData);
      message.success('Meeting created successfully');
      form.resetFields();
      setCreateModalVisible(false);
      fetchMeetings();
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      message.error(error.response?.data?.message || 'Failed to create meeting');
    }
  };

  const items = [
    {
      key: '1',
      label: (
        <span>
          <CalendarOutlined />
          Schedule
        </span>
      ),
      children: (
        <>
          <div style={{ marginBottom: 24 }}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
                Create Meeting
              </Button>
            </Space>
          </div>

          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card title="Calendar View" variant="outlined">
                <Calendar
                  value={selectedDate}
                  onSelect={onDateSelect}
                  cellRender={cellRender}
                />
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <BarChartOutlined />
          Statistics
        </span>
      ),
      children: (
        <Row gutter={[24, 24]}>
          <Col span={8}>
            <Card title="Meeting Statistics" variant="outlined" loading={loading}>
              <Statistic
                title="Total Meetings"
                value={statistics?.totalMeetings ?? 0}
                prefix={<CalendarOutlined />}
              />
              <Statistic
                title="Recurring Meetings"
                value={statistics?.recurringMeetings ?? 0}
                prefix={<TeamOutlined />}
              />
              <Divider />
              <Title level={5}>Meeting Types</Title>
              {statistics?.meetingsByType && Object.entries(statistics.meetingsByType).map(([type, count]) => (
                <Statistic
                  key={type}
                  title={type}
                  value={count}
                  style={{ marginTop: 16 }}
                />
              ))}
            </Card>
          </Col>
          <Col span={16}>
            <Card title="Meeting Details" variant="outlined">
              <Table
                columns={statisticsColumns}
                dataSource={meetings}
                loading={loading}
                rowKey="_id"
                scroll={{ x: true }}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

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
        <Tabs defaultActiveKey="1" onChange={setActiveTab} items={items} />
        <Modal
          title="Create New Meeting"
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateMeeting}
          >
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter meeting title' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter meeting description' }]}
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item
              name="meetingId"
              label="Zoom Meeting ID"
              rules={[{ required: true, message: 'Please enter Zoom meeting ID' }]}
            >
              <Input placeholder="Enter Zoom meeting ID" />
            </Form.Item>

            <Form.Item
              name="passcode"
              label="Meeting Passcode"
              rules={[{ required: true, message: 'Please enter meeting passcode' }]}
            >
              <Input placeholder="Enter meeting passcode" />
            </Form.Item>

            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select meeting date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: 'Please select meeting time' }]}
            >
              <TimePicker format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="isRecurring"
              valuePropName="checked"
            >
              <Checkbox>Recurring Meeting</Checkbox>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.isRecurring !== currentValues.isRecurring}
            >
              {({ getFieldValue }) => {
                const isRecurring = getFieldValue('isRecurring');
                return isRecurring ? (
                  <Form.Item
                    name="recurrencePattern"
                    label="Recurrence Pattern"
                    rules={[{ required: true, message: 'Please select recurrence pattern' }]}
                  >
                    <Select>
                      <Select.Option value="daily">Daily</Select.Option>
                      <Select.Option value="weekly">Weekly</Select.Option>
                      <Select.Option value="biweekly">Bi-weekly</Select.Option>
                      <Select.Option value="monthly">Monthly</Select.Option>
                    </Select>
                  </Form.Item>
                ) : null;
              }}
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Create Meeting
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Upload Meeting Recording"
          open={uploadModalVisible}
          onCancel={handleUploadCancel}
          footer={null}
        >
          <Upload.Dragger
            name="recording"
            multiple={false}
            showUploadList={false}
            beforeUpload={(file) => {
              handleUpload(file);
              return false;
            }}
            accept="audio/*,video/*"
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click or drag recording file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for audio and video files
            </p>
          </Upload.Dragger>
        </Modal>
      </div>
    </>
  );
};

export default Meetings; 