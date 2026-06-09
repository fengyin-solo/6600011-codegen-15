import React, { useState } from 'react';
import { useUserStore } from '../store/user';
import { useEEGStore } from '../store/eeg';
import { DEFAULT_AVATARS } from '../types';

export const UserSwitcher: React.FC = () => {
  const { users, currentUserId, addUser, removeUser, updateUser, switchUser } = useUserStore();
  const refreshUserRecordings = useEEGStore(s => s.refreshUserRecordings);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState<string | null>(null);

  const currentUser = users.find(u => u.id === currentUserId);

  const handleAddUser = () => {
    const name = newUserName.trim();
    if (!name) return;
    addUser(name, selectedAvatar);
    setNewUserName('');
    setSelectedAvatar(DEFAULT_AVATARS[0]);
    setShowAddUser(false);
  };

  const handleSwitchUser = (id: string) => {
    if (id === currentUserId) return;
    switchUser(id);
    refreshUserRecordings();
  };

  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) return;
    removeUser(id);
    if (id === currentUserId) {
      refreshUserRecordings();
    }
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingUserId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editingName.trim()) {
      updateUser(id, { name: editingName.trim() });
    }
    setEditingUserId(null);
    setEditingName('');
  };

  const handleAvatarChange = (userId: string, avatar: string) => {
    updateUser(userId, { avatar });
    setShowAvatarPicker(null);
  };

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#90caf9', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>👤</span> 用户档案
      </h3>

      {currentUser && (
        <div style={{
          padding: '12px',
          background: 'rgba(21, 101, 192, 0.2)',
          borderRadius: '8px',
          border: '2px solid #1565c0',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#1565c0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
              cursor: 'pointer',
            }}
            onClick={() => setShowAvatarPicker(showAvatarPicker === currentUserId ? null : currentUserId)}
            title="更换头像"
          >
            {currentUser.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {editingUserId === currentUser.id ? (
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: '4px 8px',
                    border: '1px solid #64b5f6',
                    borderRadius: '4px',
                    fontSize: '13px',
                    background: '#1e293b',
                    color: '#fff',
                    minWidth: 0,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(currentUser.id);
                    if (e.key === 'Escape') setEditingUserId(null);
                  }}
                />
                <button
                  onClick={() => handleSaveEdit(currentUser.id)}
                  style={{
                    padding: '4px 8px',
                    background: '#1565c0',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  ✓
                </button>
              </div>
            ) : (
              <div
                style={{ fontSize: '14px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                onClick={() => handleStartEdit(currentUser.id, currentUser.name)}
                title="点击编辑名称"
              >
                {currentUser.name}
              </div>
            )}
            <div style={{ fontSize: '11px', color: '#64b5f6', marginTop: '2px' }}>当前用户</div>
          </div>
        </div>
      )}

      {showAvatarPicker === currentUserId && (
        <div style={{
          padding: '8px',
          background: '#1e293b',
          borderRadius: '8px',
          marginBottom: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          justifyContent: 'center',
        }}>
          {DEFAULT_AVATARS.map(a => (
            <button
              key={a}
              onClick={() => handleAvatarChange(currentUserId, a)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: currentUser?.avatar === a ? '2px solid #64b5f6' : '1px solid #37474f',
                background: currentUser?.avatar === a ? '#1565c0' : '#0d1b2a',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
        {users.map(user => (
          <div
            key={user.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              background: user.id === currentUserId ? '#1565c0' : '#1e293b',
              cursor: user.id === currentUserId ? 'default' : 'pointer',
              transition: 'background 0.2s',
            }}
            onClick={() => handleSwitchUser(user.id)}
          >
            <span style={{ fontSize: '16px', flexShrink: 0 }}>{user.avatar}</span>
            <span style={{
              flex: 1,
              fontSize: '13px',
              color: user.id === currentUserId ? '#fff' : '#94a3b8',
              fontWeight: user.id === currentUserId ? 600 : 400,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {user.name}
            </span>
            {user.id !== currentUserId && users.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteUser(user.id);
                }}
                style={{
                  padding: '2px 6px',
                  background: 'transparent',
                  color: '#ef5350',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                title="删除用户"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {showAddUser ? (
        <div style={{
          padding: '10px',
          background: '#1e293b',
          borderRadius: '8px',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px', justifyContent: 'center' }}>
            {DEFAULT_AVATARS.map(a => (
              <button
                key={a}
                onClick={() => setSelectedAvatar(a)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: selectedAvatar === a ? '2px solid #64b5f6' : '1px solid #37474f',
                  background: selectedAvatar === a ? '#1565c0' : '#0d1b2a',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {a}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="输入用户名称"
            autoFocus
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #37474f',
              borderRadius: '6px',
              fontSize: '13px',
              background: '#0d1b2a',
              color: '#fff',
              boxSizing: 'border-box',
              marginBottom: '8px',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddUser();
              if (e.key === 'Escape') setShowAddUser(false);
            }}
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setShowAddUser(false)}
              style={{
                flex: 1,
                padding: '6px',
                background: '#37474f',
                color: '#94a3b8',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              onClick={handleAddUser}
              disabled={!newUserName.trim()}
              style={{
                flex: 1,
                padding: '6px',
                background: newUserName.trim() ? '#1565c0' : '#37474f',
                color: newUserName.trim() ? '#fff' : '#666',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: newUserName.trim() ? 'pointer' : 'default',
              }}
            >
              确认添加
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddUser(true)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#1e293b',
            color: '#90caf9',
            border: '1px dashed #37474f',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <span style={{ fontSize: '14px' }}>+</span> 添加用户
        </button>
      )}
    </div>
  );
};
