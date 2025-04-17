import React, { useState } from 'react';
import { Card, Button, Modal, Form, Input, List, Avatar, Tag, Space, Select, Row, Col } from 'antd';
import { PlusOutlined, UserAddOutlined, TeamOutlined } from '@ant-design/icons';

const { Option } = Select;

const Community: React.FC = () => {
  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [form] = Form.useForm();

  const groups = [
    {
      id: 1,
      name: 'Development Team',
      members: 8,
      description: 'Core development team members',
    },
    {
      id: 2,
      name: 'Product Team',
      members: 5,
      description: 'Product management and design team',
    },
  ];

  const members = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Developer',
      email: 'john@example.com',
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Designer',
      email: 'jane@example.com',
    },
  ];

  const showCreateGroupModal = () => {
    setIsCreateGroupModalVisible(true);
  };

  const showInviteModal = () => {
    setIsInviteModalVisible(true);
  };

  const handleCreateGroup = () => {
    form.validateFields().then((values) => {
      console.log('Group values:', values);
      setIsCreateGroupModalVisible(false);
      form.resetFields();
    });
  };

  const handleInvite = () => {
    form.validateFields().then((values) => {
      console.log('Invite values:', values);
      setIsInviteModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={showCreateGroupModal}>
            Create Group
          </Button>
          <Button icon={<UserAddOutlined />} onClick={showInviteModal}>
            Invite Members
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title="Groups">
            <List
              itemLayout="horizontal"
              dataSource={groups}
              renderItem={(group) => (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => console.log('View group', group.id)}>
                      View
                    </Button>,
                    <Button type="link" onClick={() => console.log('Edit group', group.id)}>
                      Edit
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<TeamOutlined />} />}
                    title={group.name}
                    description={
                      <>
                        <div>{group.description}</div>
                        <Tag color="blue">{group.members} members</Tag>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Members">
            <List
              itemLayout="horizontal"
              dataSource={members}
              renderItem={(member) => (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => console.log('Remove member', member.id)}>
                      Remove
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar>{member.name.charAt(0)}</Avatar>}
                    title={member.name}
                    description={
                      <>
                        <div>{member.email}</div>
                        <Tag color="green">{member.role}</Tag>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Create New Group"
        open={isCreateGroupModalVisible}
        onOk={handleCreateGroup}
        onCancel={() => setIsCreateGroupModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Group Name"
            rules={[{ required: true, message: 'Please input the group name!' }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Enter group description" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Invite Members"
        open={isInviteModalVisible}
        onOk={handleInvite}
        onCancel={() => setIsInviteModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="emails"
            label="Email Addresses"
            rules={[{ required: true, message: 'Please input email addresses!' }]}
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Enter email addresses"
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name="group"
            label="Add to Group"
          >
            <Select placeholder="Select group (optional)">
              {groups.map((group) => (
                <Option key={group.id} value={group.id}>
                  {group.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Community; 