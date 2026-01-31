// User Types
export interface User {
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

export interface PublicUser {
  id: string;
  username: string;
  displayName: string | null;
  avatarStyle: string;
  avatarSeed?: string;
  level: number;
}

// Quiz Types
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' | 'NIGHTMARE';
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'MULTI_SELECT';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  explanation?: string;
  imageUrl?: string;
  order: number;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  category?: Category;
  difficulty: Difficulty;
  timeLimit: number;
  xpReward: number;
  coinReward: number;
  order: number;
  isLocked: boolean;
  requiredXp: number;
  questions?: Question[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  order: number;
  isLocked: boolean;
  unlockLevel: number;
  _count?: { quizzes: number };
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  maxScore: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  timeSpent: number;
  isPerfect: boolean;
  xpEarned: number;
  coinsEarned: number;
  bonusXp: number;
  completedAt?: Date;
  startedAt: Date;
}

export interface AnswerResult {
  questionId: string;
  selectedOptions: string[];
  isCorrect: boolean;
  correctOptions: string[];
  explanation?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  code?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface QuizSubmitResponse {
  attempt: QuizAttempt;
  results: AnswerResult[];
  xp: {
    base: number;
    streak: number;
    speed: number;
    perfect: number;
    total: number;
  };
  coins: number;
  leveledUp: boolean;
  newLevel: number;
  streak: number;
  streakIncremented: boolean;
  achievements: Achievement[];
  user: User;
}

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  xpReward: number;
  gemReward: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: Date;
}

export type ItemType = 'AVATAR' | 'BACKGROUND' | 'POWER_UP' | 'BUNDLE';

export interface ShopItem {
  id: string;
  name: string;
  description?: string;
  type: ItemType;
  rarity: Rarity;
  gemPrice?: number;
  coinPrice?: number;
  imageUrl?: string;
  isLimited: boolean;
  stock?: number;
}

export interface UserItem {
  id: string;
  userId: string;
  itemId: string;
  item: ShopItem;
  quantity: number;
  purchasedAt: Date;
}

export type FriendRequestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  sender: PublicUser;
  receiver: PublicUser;
  status: FriendRequestStatus;
  createdAt: Date;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  user1: PublicUser;
  user2: PublicUser;
  createdAt: Date;
}

export interface LeaderboardEntry {
  rank: number;
  user: PublicUser;
  score: number;
  metric: 'xp' | 'streak' | 'quizzes' | 'accuracy';
}

export type NotificationType = 'SYSTEM' | 'ACHIEVEMENT' | 'FRIEND_REQUEST' | 'CHALLENGE' | 'REWARD';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: Date;
}

export interface DailyProgress {
  id: string;
  userId: string;
  date: Date;
  quizzesCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  xpEarned: number;
  timeSpent: number;
  streakMaintained: boolean;
}

export type BattleStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface BattleRoom {
  id: string;
  name: string;
  hostId: string;
  host: PublicUser;
  categoryId?: string;
  category?: Category;
  difficulty: Difficulty;
  maxPlayers: number;
  status: BattleStatus;
  players: BattlePlayer[];
  createdAt: Date;
}

export interface BattlePlayer {
  id: string;
  roomId: string;
  userId: string;
  user: PublicUser;
  score: number;
  correctAnswers: number;
  isReady: boolean;
  finishedAt?: Date;
}

export type SortDirection = 'asc' | 'desc';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface ButtonVariant {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}
