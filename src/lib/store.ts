import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarStyle: string;
  avatarSeed: string;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  longestStreak: number;
  gems: number;
  coins: number;
  totalQuizzes: number;
  totalCorrect: number;
  totalAnswered: number;
  perfectQuizzes: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token });
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      logout: () => {
        set({ user: null, token: null });
      },
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'nexus-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }
      },
    }
  )
);

// Quiz state for active quiz sessions
interface QuizQuestion {
  id: string;
  text: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation?: string;
  points: number;
}

interface CurrentQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit: number;
  xpReward: number;
  coinReward: number;
}

interface QuizState {
  currentQuiz: CurrentQuiz | null;
  currentQuestionIndex: number;
  answers: Record<string, string[]>;
  startTime: number | null;
  questionStartTime: number | null;
  timeRemaining: number;
  isCompleted: boolean;
  setQuiz: (quiz: CurrentQuiz) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  setAnswer: (questionId: string, selectedOptions: string[]) => void;
  startTimer: (seconds: number) => void;
  tick: () => void;
  complete: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()((set) => ({
  currentQuiz: null,
  currentQuestionIndex: 0,
  answers: {},
  startTime: null,
  questionStartTime: null,
  timeRemaining: 0,
  isCompleted: false,
  setQuiz: (quiz) =>
    set({
      currentQuiz: quiz,
      currentQuestionIndex: 0,
      answers: {},
      startTime: Date.now(),
      questionStartTime: Date.now(),
      isCompleted: false,
    }),
  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        (state.currentQuiz?.questions?.length || 1) - 1
      ),
      questionStartTime: Date.now(),
    })),
  prevQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),
  setAnswer: (questionId, selectedOptions) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: selectedOptions },
    })),
  startTimer: (seconds) => set({ timeRemaining: seconds }),
  tick: () =>
    set((state) => ({
      timeRemaining: Math.max(state.timeRemaining - 1, 0),
    })),
  complete: () => set({ isCompleted: true }),
  reset: () =>
    set({
      currentQuiz: null,
      currentQuestionIndex: 0,
      answers: {},
      startTime: null,
      questionStartTime: null,
      timeRemaining: 0,
      isCompleted: false,
    }),
}));

// UI State
interface UIState {
  isSidebarOpen: boolean;
  showConfetti: boolean;
  activeModal: string | null;
  toggleSidebar: () => void;
  setConfetti: (show: boolean) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: true,
  showConfetti: false,
  activeModal: null,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setConfetti: (show) => set({ showConfetti: show }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
}));

// Notification state
interface Notification {
  id: string;
  type: 'success' | 'error' | 'achievement' | 'levelup' | 'streak';
  title: string;
  message: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Math.random().toString(36).slice(2) },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
