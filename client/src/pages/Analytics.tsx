import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Column } = Table;

const Analytics: React.FC = () => {
  const meetingStats = [
    { name: 'Mon', meetings: 3 },
    { name: 'Tue', meetings: 5 },
    { name: 'Wed', meetings: 4 },
    { name: 'Thu', meetings: 6 },
    { name: 'Fri', meetings: 2 },
  ];

  const actionItemsData = [
    {
      key: '1',
      title: 'Set up development environment',
      assignedTo: 'John Doe',
      status: 'pending',
      dueDate: '2024-04-20',
    },
    {
      key: '2',
      title: 'Create project documentation',
      assignedTo: 'Jane Smith',
      status: 'completed',
      dueDate: '2024-04-18',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'overdue':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Meetings"
              value={24}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Duration"
              value="45"
              suffix="min"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Members"
              value={12}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Action Items"
              value={8}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="Weekly Meeting Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={meetingStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="meetings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Action Items Status">
            <Table dataSource={actionItemsData} pagination={false}>
              <Column title="Title" dataIndex="title" key="title" />
              <Column title="Assigned To" dataIndex="assignedTo" key="assignedTo" />
              <Column
                title="Status"
                dataIndex="status"
                key="status"
                render={(status) => (
                  <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                  </Tag>
                )}
              />
              <Column title="Due Date" dataIndex="dueDate" key="dueDate" />
            </Table>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Meeting Insights">
            <div style={{ padding: '20px' }}>
              <h3>Top Meeting Types</h3>
              <ul>
                <li>Team Sync (40%)</li>
                <li>Client Meetings (30%)</li>
                <li>Project Reviews (20%)</li>
                <li>Other (10%)</li>
              </ul>

              <h3 style={{ marginTop: '20px' }}>Productivity Metrics</h3>
              <ul>
                <li>Average Action Items per Meeting: 3.2</li>
                <li>Action Item Completion Rate: 75%</li>
                <li>Average Meeting Duration: 45 minutes</li>
              </ul>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics; 