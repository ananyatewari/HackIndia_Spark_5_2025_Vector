import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, TimePicker, Select, Space, Row, Col, Table, Tabs, Calendar, Badge, Statistic, message, Checkbox } from 'antd';
import { PlusOutlined, UploadOutlined, CalendarOutlined, TeamOutlined, BarChartOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { meetingService, Meeting, MeetingStatistics } from '../services/meetingService';

const Meetings: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [activeTab, setActiveTab] = useState('1');
  const [statistics, setStatistics] = useState<MeetingStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  useEffect(() => {
    fetchMeetings();
    fetchStatistics();
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
      title: 'Meeting ID',
      dataIndex: 'meetingId',
      key: 'meetingId',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Meeting) => (
        <Space>
          {record.isRecurring && (
            <Badge status="processing" text="Recurring" style={{ marginRight: '8px' }} />
          )}
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            Delete
          </Button>
        </Space>
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
              <Button icon={<UploadOutlined />}>
                Upload Recording
              </Button>
            </Space>
          </div>

          <Row gutter={[24, 24]}>
            <Col span={16}>
              <Card title="Calendar View" variant="outlined">
                <Calendar
                  value={selectedDate}
                  onSelect={onDateSelect}
                  cellRender={cellRender}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Upcoming Meetings" variant="outlined">
                <Table
                  columns={columns}
                  dataSource={meetings}
                  pagination={false}
                  size="small"
                  loading={loading}
                  rowKey="_id"
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
            </Card>
          </Col>
          <Col span={16}>
            <Card title="Meeting Details" variant="outlined">
              <Table
                columns={columns}
                dataSource={meetings}
                loading={loading}
                rowKey="_id"
              />
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#fff', borderRadius: '8px' }}>
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
    </div>
  );
};

export default Meetings; 