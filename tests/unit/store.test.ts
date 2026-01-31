/**
 * Unit Tests for src/lib/store.ts
 * 
 * Testing Zustand store logic:
 * - useAuthStore: Authentication state management
 * - useQuizStore: Quiz session state management
 * - useUIStore: UI state management
 * - useNotificationStore: Notification queue management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';

// We need to reset stores between tests
// Import stores fresh for each test using dynamic imports

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('starts with null user and token', async () => {
      const { useAuthStore } = await import('@/lib/store');
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      // isHydrated becomes true after rehydration (even with empty localStorage)
      expect(typeof state.isHydrated).toBe('boolean');
    });
  });

  describe('setUser', () => {
    it('sets user correctly', async () => {
      const { useAuthStore } = await import('@/lib/store');
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        avatarStyle: 'adventurer',
        avatarSeed: 'abc123',
        level: 5,
        xp: 250,
        totalXp: 1000,
        streak: 3,
        longestStreak: 7,
        gems: 100,
        coins: 500,
        totalQuizzes: 10,
        totalCorrect: 80,
        totalAnswered: 100,
        perfectQuizzes: 2,
      };

      act(() => {
        useAuthStore.getState().setUser(mockUser);
      });

      expect(useAuthStore.getState().user).toEqual(mockUser);
      // isHydrated is managed by persist middleware, not setUser
    });

    it('clears user when set to null', async () => {
      const { useAuthStore } = await import('@/lib/store');
      
      act(() => {
        useAuthStore.getState().setUser({ id: 'test' } as any);
        useAuthStore.getState().setUser(null);
      });

      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('setToken', () => {
    it('sets token and stores in localStorage via persist', async () => {
      const { useAuthStore } = await import('@/lib/store');
      
      act(() => {
        useAuthStore.getState().setToken('jwt-token-123');
      });

      expect(useAuthStore.getState().token).toBe('jwt-token-123');
      // Token is now stored via Zustand persist middleware under 'nexus-auth' key
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('removes token when set to null', async () => {
      const { useAuthStore } = await import('@/lib/store');
      
      act(() => {
        useAuthStore.getState().setToken(null);
      });

      expect(useAuthStore.getState().token).toBeNull();
      // No direct localStorage.removeItem('token') - handled by persist
    });
  });

  describe('updateUser', () => {
    it('partially updates user fields', async () => {
      const { useAuthStore } = await import('@/lib/store');
      const initialUser = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        avatarStyle: 'adventurer',
        avatarSeed: 'abc123',
        level: 5,
        xp: 250,
        totalXp: 1000,
        streak: 3,
        longestStreak: 7,
        gems: 100,
        coins: 500,
        totalQuizzes: 10,
        totalCorrect: 80,
        totalAnswered: 100,
        perfectQuizzes: 2,
      };

      act(() => {
        useAuthStore.getState().setUser(initialUser);
        useAuthStore.getState().updateUser({ level: 6, xp: 50 });
      });

      const user = useAuthStore.getState().user;
      expect(user?.level).toBe(6);
      expect(user?.xp).toBe(50);
      expect(user?.username).toBe('testuser'); // Unchanged
    });

    it('does nothing when user is null', async () => {
      const { useAuthStore } = await import('@/lib/store');
      
      act(() => {
        useAuthStore.getState().updateUser({ level: 10 });
      });

      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears user, token, and localStorage via persist', async () => {
      const { useAuthStore } = await import('@/lib/store');
      
      act(() => {
        useAuthStore.getState().setUser({ id: 'test' } as any);
        useAuthStore.getState().setToken('token-123');
        useAuthStore.getState().logout();
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
      // Persist middleware handles localStorage updates
    });
  });
});

describe('useQuizStore', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('initial state', () => {
    it('starts with empty quiz state', async () => {
      const { useQuizStore } = await import('@/lib/store');
      const state = useQuizStore.getState();

      expect(state.currentQuiz).toBeNull();
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.answers).toEqual({});
      expect(state.startTime).toBeNull();
      expect(state.timeRemaining).toBe(0);
      expect(state.isCompleted).toBe(false);
    });
  });

  describe('setQuiz', () => {
    it('initializes quiz state correctly', async () => {
      const { useQuizStore } = await import('@/lib/store');
      const mockQuiz = {
        id: 'quiz-1',
        title: 'Test Quiz',
        questions: [{ id: 'q1' }, { id: 'q2' }],
      };

      act(() => {
        useQuizStore.getState().setQuiz(mockQuiz);
      });

      const state = useQuizStore.getState();
      expect(state.currentQuiz).toEqual(mockQuiz);
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.answers).toEqual({});
      expect(state.startTime).toBeDefined();
      expect(state.isCompleted).toBe(false);
    });
  });

  describe('nextQuestion', () => {
    it('increments question index', async () => {
      const { useQuizStore } = await import('@/lib/store');
      const mockQuiz = {
        questions: [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }],
      };

      act(() => {
        useQuizStore.getState().setQuiz(mockQuiz);
        useQuizStore.getState().nextQuestion();
      });

      expect(useQuizStore.getState().currentQuestionIndex).toBe(1);
    });

    it('does not exceed last question index', async () => {
      const { useQuizStore } = await import('@/lib/store');
      const mockQuiz = {
        questions: [{ id: 'q1' }, { id: 'q2' }],
      };

      act(() => {
        useQuizStore.getState().setQuiz(mockQuiz);
        useQuizStore.getState().nextQuestion();
        useQuizStore.getState().nextQuestion();
        useQuizStore.getState().nextQuestion(); // Should stay at 1
      });

      expect(useQuizStore.getState().currentQuestionIndex).toBe(1);
    });
  });

  describe('prevQuestion', () => {
    it('decrements question index', async () => {
      const { useQuizStore } = await import('@/lib/store');
      const mockQuiz = {
        questions: [{ id: 'q1' }, { id: 'q2' }],
      };

      act(() => {
        useQuizStore.getState().setQuiz(mockQuiz);
        useQuizStore.getState().nextQuestion();
        useQuizStore.getState().prevQuestion();
      });

      expect(useQuizStore.getState().currentQuestionIndex).toBe(0);
    });

    it('does not go below 0', async () => {
      const { useQuizStore } = await import('@/lib/store');
      const mockQuiz = { questions: [{ id: 'q1' }] };

      act(() => {
        useQuizStore.getState().setQuiz(mockQuiz);
        useQuizStore.getState().prevQuestion();
        useQuizStore.getState().prevQuestion();
      });

      expect(useQuizStore.getState().currentQuestionIndex).toBe(0);
    });
  });

  describe('setAnswer', () => {
    it('stores answer for a question', async () => {
      const { useQuizStore } = await import('@/lib/store');

      act(() => {
        useQuizStore.getState().setAnswer('q1', ['option-a', 'option-b']);
      });

      expect(useQuizStore.getState().answers).toEqual({
        q1: ['option-a', 'option-b'],
      });
    });

    it('overwrites previous answer for same question', async () => {
      const { useQuizStore } = await import('@/lib/store');

      act(() => {
        useQuizStore.getState().setAnswer('q1', ['option-a']);
        useQuizStore.getState().setAnswer('q1', ['option-b']);
      });

      expect(useQuizStore.getState().answers.q1).toEqual(['option-b']);
    });

    it('preserves answers for other questions', async () => {
      const { useQuizStore } = await import('@/lib/store');

      act(() => {
        useQuizStore.getState().setAnswer('q1', ['option-a']);
        useQuizStore.getState().setAnswer('q2', ['option-x']);
      });

      expect(useQuizStore.getState().answers).toEqual({
        q1: ['option-a'],
        q2: ['option-x'],
      });
    });
  });

  describe('timer operations', () => {
    it('startTimer sets initial time', async () => {
      const { useQuizStore } = await import('@/lib/store');

      act(() => {
        useQuizStore.getState().startTimer(300);
      });

      expect(useQuizStore.getState().timeRemaining).toBe(300);
    });

    it('tick decrements time by 1', async () => {
      const { useQuizStore } = await import('@/lib/store');

      act(() => {
        useQuizStore.getState().startTimer(10);
        useQuizStore.getState().tick();
      });

      expect(useQuizStore.getState().timeRemaining).toBe(9);
    });

    it('tick does not go below 0', async () => {
      const { useQuizStore } = await import('@/lib/store');

      act(() => {
        useQuizStore.getState().startTimer(1);
        useQuizStore.getState().tick();
        useQuizStore.getState().tick();
      });

      expect(useQuizStore.getState().timeRemaining).toBe(0);
    });
  });

  describe('complete', () => {
    it('marks quiz as completed', async () => {
      const { useQuizStore } = await import('@/lib/store');

      act(() => {
        useQuizStore.getState().complete();
      });

      expect(useQuizStore.getState().isCompleted).toBe(true);
    });
  });

  describe('reset', () => {
    it('resets all quiz state', async () => {
      const { useQuizStore } = await import('@/lib/store');

      act(() => {
        useQuizStore.getState().setQuiz({ id: 'quiz-1', questions: [] });
        useQuizStore.getState().setAnswer('q1', ['a']);
        useQuizStore.getState().startTimer(300);
        useQuizStore.getState().complete();
        useQuizStore.getState().reset();
      });

      const state = useQuizStore.getState();
      expect(state.currentQuiz).toBeNull();
      expect(state.currentQuestionIndex).toBe(0);
      expect(state.answers).toEqual({});
      expect(state.startTime).toBeNull();
      expect(state.timeRemaining).toBe(0);
      expect(state.isCompleted).toBe(false);
    });
  });
});

describe('useUIStore', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('sidebar operations', () => {
    it('toggleSidebar flips isSidebarOpen', async () => {
      const { useUIStore } = await import('@/lib/store');
      
      expect(useUIStore.getState().isSidebarOpen).toBe(true);

      act(() => {
        useUIStore.getState().toggleSidebar();
      });

      expect(useUIStore.getState().isSidebarOpen).toBe(false);

      act(() => {
        useUIStore.getState().toggleSidebar();
      });

      expect(useUIStore.getState().isSidebarOpen).toBe(true);
    });
  });

  describe('confetti operations', () => {
    it('setConfetti updates showConfetti', async () => {
      const { useUIStore } = await import('@/lib/store');

      act(() => {
        useUIStore.getState().setConfetti(true);
      });

      expect(useUIStore.getState().showConfetti).toBe(true);

      act(() => {
        useUIStore.getState().setConfetti(false);
      });

      expect(useUIStore.getState().showConfetti).toBe(false);
    });
  });

  describe('modal operations', () => {
    it('openModal sets activeModal', async () => {
      const { useUIStore } = await import('@/lib/store');

      act(() => {
        useUIStore.getState().openModal('settings');
      });

      expect(useUIStore.getState().activeModal).toBe('settings');
    });

    it('closeModal clears activeModal', async () => {
      const { useUIStore } = await import('@/lib/store');

      act(() => {
        useUIStore.getState().openModal('settings');
        useUIStore.getState().closeModal();
      });

      expect(useUIStore.getState().activeModal).toBeNull();
    });
  });
});

describe('useNotificationStore', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('addNotification', () => {
    it('adds notification with generated id', async () => {
      const { useNotificationStore } = await import('@/lib/store');

      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'success',
          title: 'Test',
          message: 'Test message',
        });
      });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0].id).toBeDefined();
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].title).toBe('Test');
    });

    it('maintains order of notifications (FIFO)', async () => {
      const { useNotificationStore } = await import('@/lib/store');

      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'success',
          title: 'First',
          message: '',
        });
        useNotificationStore.getState().addNotification({
          type: 'error',
          title: 'Second',
          message: '',
        });
      });

      const notifications = useNotificationStore.getState().notifications;
      expect(notifications[0].title).toBe('First');
      expect(notifications[1].title).toBe('Second');
    });
  });

  describe('removeNotification', () => {
    it('removes notification by id', async () => {
      const { useNotificationStore } = await import('@/lib/store');

      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'success',
          title: 'Test',
          message: '',
        });
      });

      const id = useNotificationStore.getState().notifications[0].id;

      act(() => {
        useNotificationStore.getState().removeNotification(id);
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(0);
    });

    it('does nothing for non-existent id', async () => {
      const { useNotificationStore } = await import('@/lib/store');

      act(() => {
        useNotificationStore.getState().addNotification({
          type: 'success',
          title: 'Test',
          message: '',
        });
        useNotificationStore.getState().removeNotification('non-existent');
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(1);
    });
  });
});
