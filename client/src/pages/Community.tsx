import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, Form, Input, List, Avatar, Tag, Space, Select, Row, Col } from 'antd';
import { PlusOutlined, UserAddOutlined, TeamOutlined } from '@ant-design/icons';

const { Option } = Select;

const Community: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] = useState(false);
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [form] = Form.useForm();

  
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

  const loadData = () => {
    const savedGroups = localStorage.getItem('groups');
    const savedMembers = localStorage.getItem('members');

    if (savedGroups && savedMembers) {
      return {
        groups: JSON.parse(savedGroups),
        members: JSON.parse(savedMembers),
      };
    }

    return {
      groups: [
        {
          id: 1,
          name: 'Development Team',
          members: ['John Doe', 'Jane Smith'],
          description: 'Core development team members',
        },
        {
          id: 2,
          name: 'Product Team',
          members: ['Mike Johnson', 'Sarah Lee'],
          description: 'Product management and design team',
        },
      ],
      members: [
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
        {
          id: 3,
          name: 'Mike Johnson',
          role: 'Product Manager',
          email: 'mike@example.com',
        },
        {
          id: 4,
          name: 'Sarah Lee',
          role: 'Designer',
          email: 'sarah@example.com',
        },
      ],
    };
  };

  const [groups, setGroups] = useState(loadData().groups);
  const [members, setMembers] = useState(loadData().members);

  const saveData = () => {
    localStorage.setItem('groups', JSON.stringify(groups));
    localStorage.setItem('members', JSON.stringify(members));
  };

  useEffect(() => {
    saveData();
  }, [groups, members]);

  const showCreateGroupModal = () => {
    setIsCreateGroupModalVisible(true);
  };

  const showInviteModal = () => {
    setIsInviteModalVisible(true);
  };

  const handleCreateGroup = () => {
    form.validateFields().then((values) => {
      const newGroup = {
        id: groups.length + 1,
        name: values.name,
        description: values.description,
        members: [],
      };
      setGroups([...groups, newGroup]);
      setIsCreateGroupModalVisible(false);
      form.resetFields();
    });
  };

  const handleInvite = () => {
    form.validateFields().then((values) => {
      const newMembers = values.emails.split(',').map((email) => {
        return {
          id: members.length + 1,
          name: email,
          role: 'Member',
          email,
        };
      });
      setMembers([...members, ...newMembers]);

      if (values.group) {
        setGroups(
          groups.map((group) => {
            if (group.id === values.group) {
              return {
                ...group,
                members: [...group.members, ...newMembers.map((m) => m.name)],
              };
            }
            return group;
          })
        );
      }
      setIsInviteModalVisible(false);
      form.resetFields();
    });
  };

  const handleRemoveGroup = (groupId: number) => {
    setGroups(groups.filter((group) => group.id !== groupId));
  };

  const handleRemoveMember = (memberId: number) => {
    const memberToRemove = members.find((m) => m.id === memberId);
    if (memberToRemove) {
      setMembers(members.filter((m) => m.id !== memberId));

      setGroups(
        groups.map((group) => ({
          ...group,
          members: group.members.filter((member) => member !== memberToRemove.name),
        }))
      );
    }
  };

  return (
    <div>
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
      <div style={{ padding: '24px', position: 'relative', zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showCreateGroupModal}
              style={{ 
                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                border: 'none'
              }}
            >
              Create Group
            </Button>
            <Button 
              icon={<UserAddOutlined />} 
              onClick={showInviteModal}
              style={{
                borderColor: '#722ed1',
                color: '#722ed1'
              }}
            >
              Invite Members
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card 
              title={<span style={{ color: '#4338CA', fontSize: '18px', fontWeight: 'bold' }}>Groups</span>}
              className="dashboard-card"
              style={{ background: '#EEF2FF' }}
              bordered={false}
            >
              <List
                itemLayout="horizontal"
                dataSource={groups}
                renderItem={(group) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        onClick={() => handleRemoveGroup(group.id)}
                        danger
                      >
                        Remove
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<TeamOutlined />} 
                          style={{ 
                            backgroundColor: '#C7D2FE',
                            color: '#4338CA'
                          }} 
                        />
                      }
                      title={<span style={{ color: '#1E293B', fontWeight: 'bold' }}>{group.name}</span>}
                      description={
                        <>
                          <div style={{ color: '#4B5563' }}>{group.description}</div>
                          <Tag color="blue">{group.members.length} members</Tag>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col span={12}>
            <Card 
              title={<span style={{ color: '#BE185D', fontSize: '18px', fontWeight: 'bold' }}>Members</span>}
              className="dashboard-card"
              style={{ background: '#FDF2F8' }}
              bordered={false}
            >
              <List
                itemLayout="horizontal"
                dataSource={members}
                renderItem={(member) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        onClick={() => handleRemoveMember(member.id)}
                        danger
                      >
                        Remove
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          style={{ 
                            backgroundColor: '#FCE7F3',
                            color: '#BE185D'
                          }}
                        >
                          {member.name.charAt(0)}
                        </Avatar>
                      }
                      title={<span style={{ color: '#1E293B', fontWeight: 'bold' }}>{member.name}</span>}
                      description={
                        <>
                          <div style={{ color: '#4B5563' }}>{member.email}</div>
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

        <style jsx>{`
          .dashboard-card {
            border-radius: 16px !important;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
            padding: 24px !important;
          }
          .dashboard-card:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          }
          .ant-list-item {
            padding: 16px !important;
            border-radius: 8px !important;
            margin-bottom: 8px !important;
            background: rgba(255, 255, 255, 0.7) !important;
            transition: all 0.3s ease !important;
          }
          .ant-list-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
          }
        `}</style>
      </div>

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
            <Input placeholder="Enter comma-separated email addresses" />
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
