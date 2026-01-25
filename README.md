# 🚀 Nexus Quiz

<div align="center">

![Nexus Quiz](https://img.shields.io/badge/Nexus-Quiz-00f5ff?style=for-the-badge&logo=lightning&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

**The Ultimate Futuristic Quiz Experience**

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [Tech Stack](#tech-stack) • [API Reference](#api-reference)

</div>

---

## ✨ Overview

Nexus Quiz is a next-generation quiz application featuring a stunning cyberpunk aesthetic, gamification mechanics inspired by Duolingo, and real-time competitive elements. Built with cutting-edge technologies for an immersive learning experience.

<div align="center">

| 🎮 Gamified Learning | 🏆 Competitive | 🎨 Stunning UI |
|:---:|:---:|:---:|
| XP, Levels, Streaks | Global Leaderboards | Magic UI Animations |

</div>

---

## 🎯 Features

### 🎮 Gamification System
- **XP & Leveling** - Earn experience points, level up, unlock new content
- **Daily Streaks** - Maintain streaks for bonus XP multipliers (up to 2x)
- **Achievement System** - 50+ achievements across 4 rarity tiers (Common, Rare, Epic, Legendary)
- **Virtual Currency** - Earn gems and coins for completing quizzes

### 🏆 Competitive Features
- **Global Leaderboard** - Compete with players worldwide
- **Weekly Rankings** - Fresh competition every week
- **Friend Challenges** - Challenge friends to beat your scores
- **Category Rankings** - Dominate specific knowledge areas

### 📚 Quiz Experience
- **Multiple Categories** - Science, Technology, History, Geography, Arts, Sports
- **Adaptive Difficulty** - Easy, Medium, Hard, Expert levels
- **Timed Challenges** - Race against the clock
- **Detailed Explanations** - Learn from every question
- **Perfect Score Bonuses** - Extra rewards for flawless runs

### 👥 Social Features
- **Friends System** - Add friends, see their progress
- **Activity Feed** - Track friend achievements
- **Online Status** - See who's playing now
- **Invite System** - Grow the community

### 📊 Analytics & Progress
- **Performance Tracking** - Accuracy, speed, improvement over time
- **Category Breakdown** - See strengths and weaknesses
- **Weekly Reports** - Visualize your progress
- **Study Recommendations** - AI-powered suggestions

### 🎨 Premium UI/UX
- **Magic UI Components** - Spotlight effects, animated borders, 3D tilt cards
- **Particle Systems** - Dynamic background animations
- **Glassmorphism** - Modern frosted glass effects
- **Smooth Animations** - Framer Motion powered transitions
- **Dark Cyberpunk Theme** - Neon accents, futuristic aesthetics

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 15** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **Zustand** | State management |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints |
| **Prisma ORM** | Database access & migrations |
| **MySQL** | Relational database |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |

### UI Libraries
| Library | Purpose |
|---------|---------|
| **Magic UI** | Custom animated components |
| **React Hot Toast** | Notification system |
| **Canvas Confetti** | Celebration effects |
| **Recharts** | Analytics charts |
| **DiceBear** | Avatar generation |

---

## 📦 Installation

### Prerequisites

- **Node.js** 18+ 
- **MySQL** 8.0+ (or use Docker)
- **npm** or **pnpm**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nexus-quiz.git
   cd nexus-quiz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your database credentials:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/nexus_quiz"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Start MySQL** (choose one option)

   **Option A: Using Docker**
   ```bash
   docker run --name nexus-mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=nexus_quiz -p 3306:3306 -d mysql:8
   ```

   **Option B: Using XAMPP/WAMP**
   - Start MySQL from the control panel
   - Create database `nexus_quiz`

5. **Initialize database**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
nexus-quiz/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication
│   │   │   ├── quizzes/   # Quiz endpoints
│   │   │   ├── categories/# Category endpoints
│   │   │   └── ...
│   │   ├── dashboard/     # Main dashboard
│   │   ├── quiz/[id]/     # Quiz gameplay
│   │   ├── leaderboard/   # Rankings
│   │   ├── achievements/  # Achievement showcase
│   │   ├── analytics/     # User analytics
│   │   ├── friends/       # Social features
│   │   ├── profile/       # User settings
│   │   └── ...
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   │   ├── MagicUI.tsx   # Magic UI effects
│   │   │   ├── Elements.tsx  # Basic elements
│   │   │   └── Modals.tsx    # Modal dialogs
│   │   └── layout/        # Layout components
│   └── lib/
│       ├── prisma.ts      # Prisma client
│       ├── store.ts       # Zustand stores
│       └── utils.ts       # Utility functions
├── .env                   # Environment variables
├── tailwind.config.ts     # Tailwind configuration
└── package.json
```

---

## 🔌 API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create new account |
| `/api/auth/login` | POST | Login & get token |
| `/api/auth/me` | GET | Get current user |

### Quizzes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/categories` | GET | List all categories |
| `/api/categories/[slug]` | GET | Get category with quizzes |
| `/api/quizzes/[id]` | GET | Get quiz details |
| `/api/quizzes/[id]/submit` | POST | Submit quiz answers |

### Social

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/friends` | GET | List friends |
| `/api/friends` | POST | Send friend request |
| `/api/leaderboard` | GET | Get rankings |
| `/api/achievements` | GET | Get user achievements |

### Analytics

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics` | GET | Get user statistics |

---

## 🎮 Gameplay Mechanics

### XP System
```
Base XP per question: 10 XP
Correct answer bonus: +10 XP
Speed bonus: Up to +5 XP (faster = more)
Streak multiplier: 1.0x - 2.0x
Perfect quiz bonus: +50 XP
```

### Leveling Formula
```
XP needed = 100 × level^1.5
Level 1 → 2: 100 XP
Level 5 → 6: 1,118 XP
Level 10 → 11: 3,162 XP
```

### Streak Bonuses
| Streak | Multiplier |
|--------|------------|
| 1-6 days | 1.0x |
| 7-13 days | 1.25x |
| 14-29 days | 1.5x |
| 30+ days | 2.0x |

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t nexus-quiz .
docker run -p 3000:3000 nexus-quiz
```

---

## 🧪 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

### Adding New Features

1. **New Quiz Category**
   - Add to `prisma/seed.ts`
   - Run `npm run db:seed`

2. **New Achievement**
   - Add to `prisma/seed.ts` achievements array
   - Update achievement check logic in submit endpoint

3. **New Magic UI Component**
   - Add to `src/components/ui/MagicUI.tsx`
   - Export and use in pages

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://prisma.io/) - Next-generation ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://framer.com/motion/) - Animation library
- [Lucide](https://lucide.dev/) - Beautiful icons
- [DiceBear](https://dicebear.com/) - Avatar generation

---

<div align="center">

**Built with 💜 by the Nexus Team**

[⬆ Back to top](#-nexus-quiz)

</div>
