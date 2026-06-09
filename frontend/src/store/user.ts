import { create } from 'zustand';
import { UserProfile, DEFAULT_AVATARS } from '../types';

const USERS_KEY = 'eeg_users';
const CURRENT_USER_KEY = 'eeg_current_user';

const loadUsers = (): UserProfile[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: UserProfile[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const loadCurrentUserId = (): string | null => {
  return localStorage.getItem(CURRENT_USER_KEY);
};

const saveCurrentUserId = (id: string | null) => {
  if (id) {
    localStorage.setItem(CURRENT_USER_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

const ensureDefaultUser = (users: UserProfile[]): UserProfile[] => {
  if (users.length > 0) return users;
  const defaultUser: UserProfile = {
    id: 'user_default',
    name: '默认用户',
    avatar: '🧑',
    createdAt: Date.now(),
  };
  return [defaultUser];
};

interface UserState {
  users: UserProfile[];
  currentUserId: string;
  addUser: (name: string, avatar?: string) => UserProfile;
  removeUser: (id: string) => void;
  updateUser: (id: string, updates: Partial<Pick<UserProfile, 'name' | 'avatar'>>) => void;
  switchUser: (id: string) => void;
  getCurrentUser: () => UserProfile | undefined;
}

const initialUsers = ensureDefaultUser(loadUsers());
const initialCurrentId = (() => {
  const saved = loadCurrentUserId();
  if (saved && initialUsers.some(u => u.id === saved)) return saved;
  return initialUsers[0].id;
})();
saveUsers(initialUsers);
saveCurrentUserId(initialCurrentId);

export const useUserStore = create<UserState>((set, get) => ({
  users: initialUsers,
  currentUserId: initialCurrentId,

  addUser: (name: string, avatar?: string) => {
    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newUser: UserProfile = {
      id,
      name: name.trim() || `用户 ${get().users.length + 1}`,
      avatar: avatar || DEFAULT_AVATARS[get().users.length % DEFAULT_AVATARS.length],
      createdAt: Date.now(),
    };
    const users = [...get().users, newUser];
    saveUsers(users);
    set({ users });
    return newUser;
  },

  removeUser: (id: string) => {
    const { users, currentUserId } = get();
    if (users.length <= 1) return;
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === 0) return;
    saveUsers(filtered);
    if (currentUserId === id) {
      const newCurrentId = filtered[0].id;
      saveCurrentUserId(newCurrentId);
      set({ users: filtered, currentUserId: newCurrentId });
    } else {
      set({ users: filtered });
    }
  },

  updateUser: (id: string, updates) => {
    const users = get().users.map(u =>
      u.id === id ? { ...u, ...updates } : u
    );
    saveUsers(users);
    set({ users });
  },

  switchUser: (id: string) => {
    const { users } = get();
    if (!users.some(u => u.id === id)) return;
    saveCurrentUserId(id);
    set({ currentUserId: id });
  },

  getCurrentUser: () => {
    const { users, currentUserId } = get();
    return users.find(u => u.id === currentUserId);
  },
}));
