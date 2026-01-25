import { PrismaClient, Difficulty, AchievementCategory, Rarity, ItemType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting seed...');

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'science' },
      update: {},
      create: {
        name: 'Science',
        slug: 'science',
        description: 'Explore the wonders of the universe',
        icon: '🔬',
        color: '#00ffff',
        order: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: 'Technology',
        slug: 'technology',
        description: 'The digital frontier awaits',
        icon: '💻',
        color: '#ff00ff',
        order: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'history' },
      update: {},
      create: {
        name: 'History',
        slug: 'history',
        description: 'Journey through time',
        icon: '📜',
        color: '#ffaa00',
        order: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'geography' },
      update: {},
      create: {
        name: 'Geography',
        slug: 'geography',
        description: 'Navigate the world',
        icon: '🌍',
        color: '#00ff66',
        order: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'entertainment' },
      update: {},
      create: {
        name: 'Entertainment',
        slug: 'entertainment',
        description: 'Pop culture and beyond',
        icon: '🎬',
        color: '#ff6600',
        order: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: {
        name: 'Sports',
        slug: 'sports',
        description: 'Champions are made here',
        icon: '⚽',
        color: '#00aaff',
        order: 6,
        isLocked: true,
        unlockLevel: 5,
      },
    }),
  ]);

  console.log('✅ Categories created');

  // Create sample quizzes
  const scienceCategory = categories[0];
  const techCategory = categories[1];

  const quiz1 = await prisma.quiz.upsert({
    where: { id: 'quiz-science-basics' },
    update: {},
    create: {
      id: 'quiz-science-basics',
      title: 'Science Fundamentals',
      description: 'Test your knowledge of basic scientific concepts',
      categoryId: scienceCategory.id,
      difficulty: Difficulty.EASY,
      timeLimit: 30,
      xpReward: 50,
      coinReward: 15,
      order: 1,
    },
  });

  const quiz2 = await prisma.quiz.upsert({
    where: { id: 'quiz-tech-innovation' },
    update: {},
    create: {
      id: 'quiz-tech-innovation',
      title: 'Tech Innovations',
      description: 'How well do you know modern technology?',
      categoryId: techCategory.id,
      difficulty: Difficulty.MEDIUM,
      timeLimit: 25,
      xpReward: 75,
      coinReward: 20,
      order: 1,
    },
  });

  // Add questions
  await prisma.question.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'q1',
        quizId: quiz1.id,
        text: 'What is the chemical symbol for water?',
        options: JSON.stringify([
          { id: 'a', text: 'H2O', isCorrect: true },
          { id: 'b', text: 'CO2', isCorrect: false },
          { id: 'c', text: 'NaCl', isCorrect: false },
          { id: 'd', text: 'O2', isCorrect: false },
        ]),
        explanation: 'Water is composed of two hydrogen atoms and one oxygen atom, hence H2O.',
        order: 1,
        points: 10,
      },
      {
        id: 'q2',
        quizId: quiz1.id,
        text: 'What planet is known as the Red Planet?',
        options: JSON.stringify([
          { id: 'a', text: 'Venus', isCorrect: false },
          { id: 'b', text: 'Mars', isCorrect: true },
          { id: 'c', text: 'Jupiter', isCorrect: false },
          { id: 'd', text: 'Saturn', isCorrect: false },
        ]),
        explanation: 'Mars appears red due to iron oxide (rust) on its surface.',
        order: 2,
        points: 10,
      },
      {
        id: 'q3',
        quizId: quiz1.id,
        text: 'What is the speed of light approximately?',
        options: JSON.stringify([
          { id: 'a', text: '300,000 km/s', isCorrect: true },
          { id: 'b', text: '150,000 km/s', isCorrect: false },
          { id: 'c', text: '500,000 km/s', isCorrect: false },
          { id: 'd', text: '1,000,000 km/s', isCorrect: false },
        ]),
        explanation: 'Light travels at approximately 299,792 km/s in a vacuum.',
        order: 3,
        points: 10,
      },
      {
        id: 'q4',
        quizId: quiz2.id,
        text: 'Who founded SpaceX?',
        options: JSON.stringify([
          { id: 'a', text: 'Jeff Bezos', isCorrect: false },
          { id: 'b', text: 'Elon Musk', isCorrect: true },
          { id: 'c', text: 'Bill Gates', isCorrect: false },
          { id: 'd', text: 'Mark Zuckerberg', isCorrect: false },
        ]),
        explanation: 'Elon Musk founded SpaceX in 2002.',
        order: 1,
        points: 10,
      },
      {
        id: 'q5',
        quizId: quiz2.id,
        text: 'What year was the first iPhone released?',
        options: JSON.stringify([
          { id: 'a', text: '2005', isCorrect: false },
          { id: 'b', text: '2006', isCorrect: false },
          { id: 'c', text: '2007', isCorrect: true },
          { id: 'd', text: '2008', isCorrect: false },
        ]),
        explanation: 'The first iPhone was released on June 29, 2007.',
        order: 2,
        points: 10,
      },
      {
        id: 'q6',
        quizId: quiz2.id,
        text: 'What does "AI" stand for?',
        options: JSON.stringify([
          { id: 'a', text: 'Automated Intelligence', isCorrect: false },
          { id: 'b', text: 'Artificial Intelligence', isCorrect: true },
          { id: 'c', text: 'Advanced Integration', isCorrect: false },
          { id: 'd', text: 'Algorithmic Interface', isCorrect: false },
        ]),
        explanation: 'AI stands for Artificial Intelligence, the simulation of human intelligence by machines.',
        order: 3,
        points: 10,
      },
      {
        id: 'q7',
        quizId: quiz1.id,
        text: 'What is the largest organ in the human body?',
        options: JSON.stringify([
          { id: 'a', text: 'Heart', isCorrect: false },
          { id: 'b', text: 'Liver', isCorrect: false },
          { id: 'c', text: 'Skin', isCorrect: true },
          { id: 'd', text: 'Brain', isCorrect: false },
        ]),
        explanation: 'The skin is the largest organ, covering approximately 20 square feet in adults.',
        order: 4,
        points: 10,
      },
      {
        id: 'q8',
        quizId: quiz1.id,
        text: 'What gas do plants absorb from the atmosphere?',
        options: JSON.stringify([
          { id: 'a', text: 'Oxygen', isCorrect: false },
          { id: 'b', text: 'Carbon Dioxide', isCorrect: true },
          { id: 'c', text: 'Nitrogen', isCorrect: false },
          { id: 'd', text: 'Hydrogen', isCorrect: false },
        ]),
        explanation: 'Plants absorb CO2 for photosynthesis and release oxygen.',
        order: 5,
        points: 10,
      },
    ],
  });

  // Create History Quiz
  const historyCategory = categories[2];
  const quiz3 = await prisma.quiz.upsert({
    where: { id: 'quiz-history-legends' },
    update: {},
    create: {
      id: 'quiz-history-legends',
      title: 'History Legends',
      description: 'Journey through the greatest moments in history',
      categoryId: historyCategory.id,
      difficulty: Difficulty.MEDIUM,
      timeLimit: 35,
      xpReward: 80,
      coinReward: 25,
      order: 1,
    },
  });

  // Create Geography Quiz
  const geoCategory = categories[3];
  const quiz4 = await prisma.quiz.upsert({
    where: { id: 'quiz-geography-explorer' },
    update: {},
    create: {
      id: 'quiz-geography-explorer',
      title: 'Geography Explorer',
      description: 'Test your knowledge of world geography',
      categoryId: geoCategory.id,
      difficulty: Difficulty.EASY,
      timeLimit: 30,
      xpReward: 60,
      coinReward: 20,
      order: 1,
    },
  });

  // Create Entertainment Quiz
  const entertainmentCategory = categories[4];
  const quiz5 = await prisma.quiz.upsert({
    where: { id: 'quiz-entertainment-buzz' },
    update: {},
    create: {
      id: 'quiz-entertainment-buzz',
      title: 'Entertainment Buzz',
      description: 'Movies, music, and pop culture',
      categoryId: entertainmentCategory.id,
      difficulty: Difficulty.EASY,
      timeLimit: 25,
      xpReward: 55,
      coinReward: 18,
      order: 1,
    },
  });

  // Create Hard Science Quiz  
  const quiz6 = await prisma.quiz.upsert({
    where: { id: 'quiz-science-advanced' },
    update: {},
    create: {
      id: 'quiz-science-advanced',
      title: 'Advanced Science',
      description: 'For the true science enthusiasts',
      categoryId: scienceCategory.id,
      difficulty: Difficulty.HARD,
      timeLimit: 45,
      xpReward: 150,
      coinReward: 40,
      order: 2,
    },
  });

  // Add more questions for all quizzes
  await prisma.question.createMany({
    skipDuplicates: true,
    data: [
      // History Questions
      {
        id: 'h1',
        quizId: quiz3.id,
        text: 'In which year did World War II end?',
        options: JSON.stringify([
          { id: 'a', text: '1943', isCorrect: false },
          { id: 'b', text: '1944', isCorrect: false },
          { id: 'c', text: '1945', isCorrect: true },
          { id: 'd', text: '1946', isCorrect: false },
        ]),
        explanation: 'World War II ended in 1945 with the surrender of Germany and Japan.',
        order: 1,
        points: 10,
      },
      {
        id: 'h2',
        quizId: quiz3.id,
        text: 'Who was the first President of the United States?',
        options: JSON.stringify([
          { id: 'a', text: 'Thomas Jefferson', isCorrect: false },
          { id: 'b', text: 'George Washington', isCorrect: true },
          { id: 'c', text: 'Abraham Lincoln', isCorrect: false },
          { id: 'd', text: 'John Adams', isCorrect: false },
        ]),
        explanation: 'George Washington served as the first U.S. President from 1789 to 1797.',
        order: 2,
        points: 10,
      },
      {
        id: 'h3',
        quizId: quiz3.id,
        text: 'The Great Wall of China was primarily built to protect against invasions from which direction?',
        options: JSON.stringify([
          { id: 'a', text: 'South', isCorrect: false },
          { id: 'b', text: 'East', isCorrect: false },
          { id: 'c', text: 'North', isCorrect: true },
          { id: 'd', text: 'West', isCorrect: false },
        ]),
        explanation: 'The Great Wall was built to protect against northern nomadic invasions.',
        order: 3,
        points: 10,
      },
      {
        id: 'h4',
        quizId: quiz3.id,
        text: 'Which ancient civilization built the pyramids of Giza?',
        options: JSON.stringify([
          { id: 'a', text: 'Romans', isCorrect: false },
          { id: 'b', text: 'Greeks', isCorrect: false },
          { id: 'c', text: 'Egyptians', isCorrect: true },
          { id: 'd', text: 'Mayans', isCorrect: false },
        ]),
        explanation: 'The pyramids were built by ancient Egyptians around 2560 BC.',
        order: 4,
        points: 10,
      },
      {
        id: 'h5',
        quizId: quiz3.id,
        text: 'The Renaissance period began in which country?',
        options: JSON.stringify([
          { id: 'a', text: 'France', isCorrect: false },
          { id: 'b', text: 'England', isCorrect: false },
          { id: 'c', text: 'Italy', isCorrect: true },
          { id: 'd', text: 'Spain', isCorrect: false },
        ]),
        explanation: 'The Renaissance began in Italy in the 14th century.',
        order: 5,
        points: 10,
      },
      // Geography Questions
      {
        id: 'g1',
        quizId: quiz4.id,
        text: 'What is the largest continent by land area?',
        options: JSON.stringify([
          { id: 'a', text: 'Africa', isCorrect: false },
          { id: 'b', text: 'Asia', isCorrect: true },
          { id: 'c', text: 'North America', isCorrect: false },
          { id: 'd', text: 'Europe', isCorrect: false },
        ]),
        explanation: 'Asia covers about 44.58 million km², making it the largest continent.',
        order: 1,
        points: 10,
      },
      {
        id: 'g2',
        quizId: quiz4.id,
        text: 'Which river is the longest in the world?',
        options: JSON.stringify([
          { id: 'a', text: 'Amazon', isCorrect: false },
          { id: 'b', text: 'Yangtze', isCorrect: false },
          { id: 'c', text: 'Nile', isCorrect: true },
          { id: 'd', text: 'Mississippi', isCorrect: false },
        ]),
        explanation: 'The Nile River is approximately 6,650 km long.',
        order: 2,
        points: 10,
      },
      {
        id: 'g3',
        quizId: quiz4.id,
        text: 'What is the capital of Australia?',
        options: JSON.stringify([
          { id: 'a', text: 'Sydney', isCorrect: false },
          { id: 'b', text: 'Melbourne', isCorrect: false },
          { id: 'c', text: 'Canberra', isCorrect: true },
          { id: 'd', text: 'Brisbane', isCorrect: false },
        ]),
        explanation: 'Canberra is the capital city of Australia, not Sydney or Melbourne.',
        order: 3,
        points: 10,
      },
      {
        id: 'g4',
        quizId: quiz4.id,
        text: 'Mount Everest is located in which mountain range?',
        options: JSON.stringify([
          { id: 'a', text: 'Alps', isCorrect: false },
          { id: 'b', text: 'Andes', isCorrect: false },
          { id: 'c', text: 'Himalayas', isCorrect: true },
          { id: 'd', text: 'Rockies', isCorrect: false },
        ]),
        explanation: 'Mount Everest is part of the Himalayan mountain range.',
        order: 4,
        points: 10,
      },
      {
        id: 'g5',
        quizId: quiz4.id,
        text: 'Which country has the most time zones?',
        options: JSON.stringify([
          { id: 'a', text: 'USA', isCorrect: false },
          { id: 'b', text: 'Russia', isCorrect: false },
          { id: 'c', text: 'France', isCorrect: true },
          { id: 'd', text: 'China', isCorrect: false },
        ]),
        explanation: 'France has 12 time zones due to its overseas territories.',
        order: 5,
        points: 10,
      },
      // Entertainment Questions
      {
        id: 'e1',
        quizId: quiz5.id,
        text: 'Which movie won the Academy Award for Best Picture in 2020?',
        options: JSON.stringify([
          { id: 'a', text: '1917', isCorrect: false },
          { id: 'b', text: 'Joker', isCorrect: false },
          { id: 'c', text: 'Parasite', isCorrect: true },
          { id: 'd', text: 'Once Upon a Time in Hollywood', isCorrect: false },
        ]),
        explanation: 'Parasite made history as the first non-English language film to win Best Picture.',
        order: 1,
        points: 10,
      },
      {
        id: 'e2',
        quizId: quiz5.id,
        text: 'Who painted the Mona Lisa?',
        options: JSON.stringify([
          { id: 'a', text: 'Vincent van Gogh', isCorrect: false },
          { id: 'b', text: 'Leonardo da Vinci', isCorrect: true },
          { id: 'c', text: 'Pablo Picasso', isCorrect: false },
          { id: 'd', text: 'Michelangelo', isCorrect: false },
        ]),
        explanation: 'Leonardo da Vinci painted the Mona Lisa between 1503 and 1519.',
        order: 2,
        points: 10,
      },
      {
        id: 'e3',
        quizId: quiz5.id,
        text: 'What is the best-selling video game of all time?',
        options: JSON.stringify([
          { id: 'a', text: 'Tetris', isCorrect: false },
          { id: 'b', text: 'Minecraft', isCorrect: true },
          { id: 'c', text: 'GTA V', isCorrect: false },
          { id: 'd', text: 'Wii Sports', isCorrect: false },
        ]),
        explanation: 'Minecraft has sold over 300 million copies across all platforms.',
        order: 3,
        points: 10,
      },
      {
        id: 'e4',
        quizId: quiz5.id,
        text: 'Which band released the album "Abbey Road"?',
        options: JSON.stringify([
          { id: 'a', text: 'The Rolling Stones', isCorrect: false },
          { id: 'b', text: 'The Beatles', isCorrect: true },
          { id: 'c', text: 'Led Zeppelin', isCorrect: false },
          { id: 'd', text: 'Pink Floyd', isCorrect: false },
        ]),
        explanation: 'Abbey Road was released by The Beatles in 1969.',
        order: 4,
        points: 10,
      },
      {
        id: 'e5',
        quizId: quiz5.id,
        text: 'In the Harry Potter series, what is the name of Harry\'s owl?',
        options: JSON.stringify([
          { id: 'a', text: 'Errol', isCorrect: false },
          { id: 'b', text: 'Scabbers', isCorrect: false },
          { id: 'c', text: 'Hedwig', isCorrect: true },
          { id: 'd', text: 'Fawkes', isCorrect: false },
        ]),
        explanation: 'Hedwig was Harry Potter\'s snowy owl, a gift from Hagrid.',
        order: 5,
        points: 10,
      },
      // Advanced Science Questions
      {
        id: 'as1',
        quizId: quiz6.id,
        text: 'What is the Schwarzschild radius associated with?',
        options: JSON.stringify([
          { id: 'a', text: 'Nuclear fusion', isCorrect: false },
          { id: 'b', text: 'Black holes', isCorrect: true },
          { id: 'c', text: 'Quantum entanglement', isCorrect: false },
          { id: 'd', text: 'Dark matter', isCorrect: false },
        ]),
        explanation: 'The Schwarzschild radius defines the event horizon of a non-rotating black hole.',
        order: 1,
        points: 15,
      },
      {
        id: 'as2',
        quizId: quiz6.id,
        text: 'Which particle is responsible for the mass of other particles via the Higgs field?',
        options: JSON.stringify([
          { id: 'a', text: 'Graviton', isCorrect: false },
          { id: 'b', text: 'Photon', isCorrect: false },
          { id: 'c', text: 'Higgs boson', isCorrect: true },
          { id: 'd', text: 'Neutrino', isCorrect: false },
        ]),
        explanation: 'The Higgs boson was discovered in 2012 at CERN and gives mass to particles.',
        order: 2,
        points: 15,
      },
      {
        id: 'as3',
        quizId: quiz6.id,
        text: 'What is the approximate age of the universe?',
        options: JSON.stringify([
          { id: 'a', text: '4.5 billion years', isCorrect: false },
          { id: 'b', text: '13.8 billion years', isCorrect: true },
          { id: 'c', text: '20 billion years', isCorrect: false },
          { id: 'd', text: '8 billion years', isCorrect: false },
        ]),
        explanation: 'The universe is approximately 13.8 billion years old based on cosmic microwave background radiation.',
        order: 3,
        points: 15,
      },
      {
        id: 'as4',
        quizId: quiz6.id,
        text: 'What phenomenon explains why distant galaxies appear to be moving away faster?',
        options: JSON.stringify([
          { id: 'a', text: 'Dark energy', isCorrect: true },
          { id: 'b', text: 'Dark matter', isCorrect: false },
          { id: 'c', text: 'Gravity waves', isCorrect: false },
          { id: 'd', text: 'Quantum tunneling', isCorrect: false },
        ]),
        explanation: 'Dark energy is responsible for the accelerating expansion of the universe.',
        order: 4,
        points: 15,
      },
      {
        id: 'as5',
        quizId: quiz6.id,
        text: 'CRISPR-Cas9 is a revolutionary tool used for what purpose?',
        options: JSON.stringify([
          { id: 'a', text: 'Protein synthesis', isCorrect: false },
          { id: 'b', text: 'Gene editing', isCorrect: true },
          { id: 'c', text: 'Nuclear fission', isCorrect: false },
          { id: 'd', text: 'Climate modeling', isCorrect: false },
        ]),
        explanation: 'CRISPR-Cas9 allows precise editing of DNA sequences in living organisms.',
        order: 5,
        points: 15,
      },
    ],
  });

  console.log('✅ Quizzes and questions created');

  // Create Achievements
  const achievements = await Promise.all([
    prisma.achievement.upsert({
      where: { name: 'First Steps' },
      update: {},
      create: {
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🎯',
        category: AchievementCategory.GENERAL,
        rarity: Rarity.COMMON,
        requirement: JSON.stringify({ type: 'quizzes_completed', value: 1 }),
        xpReward: 25,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Quiz Master' },
      update: {},
      create: {
        name: 'Quiz Master',
        description: 'Complete 50 quizzes',
        icon: '👑',
        category: AchievementCategory.MASTERY,
        rarity: Rarity.EPIC,
        requirement: JSON.stringify({ type: 'quizzes_completed', value: 50 }),
        xpReward: 500,
        gemReward: 50,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'On Fire' },
      update: {},
      create: {
        name: 'On Fire',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        category: AchievementCategory.STREAK,
        rarity: Rarity.RARE,
        requirement: JSON.stringify({ type: 'streak', value: 7 }),
        xpReward: 200,
        gemReward: 20,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Perfectionist' },
      update: {},
      create: {
        name: 'Perfectionist',
        description: 'Get 100% on any quiz',
        icon: '💎',
        category: AchievementCategory.ACCURACY,
        rarity: Rarity.UNCOMMON,
        requirement: JSON.stringify({ type: 'perfect_quiz', value: 1 }),
        xpReward: 100,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Speed Demon' },
      update: {},
      create: {
        name: 'Speed Demon',
        description: 'Complete a quiz in under 30 seconds',
        icon: '⚡',
        category: AchievementCategory.SPEED,
        rarity: Rarity.RARE,
        requirement: JSON.stringify({ type: 'speed_completion', value: 30 }),
        xpReward: 150,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Social Butterfly' },
      update: {},
      create: {
        name: 'Social Butterfly',
        description: 'Add 10 friends',
        icon: '🦋',
        category: AchievementCategory.SOCIAL,
        rarity: Rarity.UNCOMMON,
        requirement: JSON.stringify({ type: 'friends', value: 10 }),
        xpReward: 100,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Legend' },
      update: {},
      create: {
        name: 'Legend',
        description: 'Reach level 50',
        icon: '🏆',
        category: AchievementCategory.MASTERY,
        rarity: Rarity.LEGENDARY,
        requirement: JSON.stringify({ type: 'level', value: 50 }),
        xpReward: 1000,
        gemReward: 100,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Night Owl' },
      update: {},
      create: {
        name: 'Night Owl',
        description: 'Complete a quiz between midnight and 4 AM',
        icon: '🦉',
        category: AchievementCategory.SPECIAL,
        rarity: Rarity.RARE,
        requirement: JSON.stringify({ type: 'time_range', start: 0, end: 4 }),
        xpReward: 75,
        isSecret: true,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Rising Star' },
      update: {},
      create: {
        name: 'Rising Star',
        description: 'Reach level 10',
        icon: '⭐',
        category: AchievementCategory.MASTERY,
        rarity: Rarity.UNCOMMON,
        requirement: JSON.stringify({ type: 'level', value: 10 }),
        xpReward: 150,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Century Club' },
      update: {},
      create: {
        name: 'Century Club',
        description: 'Answer 100 questions correctly',
        icon: '💯',
        category: AchievementCategory.ACCURACY,
        rarity: Rarity.RARE,
        requirement: JSON.stringify({ type: 'correct_answers', value: 100 }),
        xpReward: 200,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Knowledge Seeker' },
      update: {},
      create: {
        name: 'Knowledge Seeker',
        description: 'Complete quizzes in 3 different categories',
        icon: '📚',
        category: AchievementCategory.GENERAL,
        rarity: Rarity.UNCOMMON,
        requirement: JSON.stringify({ type: 'categories_completed', value: 3 }),
        xpReward: 100,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Unstoppable' },
      update: {},
      create: {
        name: 'Unstoppable',
        description: 'Maintain a 30-day streak',
        icon: '🌟',
        category: AchievementCategory.STREAK,
        rarity: Rarity.EPIC,
        requirement: JSON.stringify({ type: 'streak', value: 30 }),
        xpReward: 500,
        gemReward: 50,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Five Perfect' },
      update: {},
      create: {
        name: 'Five Perfect',
        description: 'Get 5 perfect scores',
        icon: '🏅',
        category: AchievementCategory.ACCURACY,
        rarity: Rarity.RARE,
        requirement: JSON.stringify({ type: 'perfect_quizzes', value: 5 }),
        xpReward: 250,
        gemReward: 25,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Early Bird' },
      update: {},
      create: {
        name: 'Early Bird',
        description: 'Complete a quiz before 6 AM',
        icon: '🌅',
        category: AchievementCategory.SPECIAL,
        rarity: Rarity.RARE,
        requirement: JSON.stringify({ type: 'time_range', start: 4, end: 6 }),
        xpReward: 75,
        isSecret: true,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Collector' },
      update: {},
      create: {
        name: 'Collector',
        description: 'Earn 1000 coins',
        icon: '🪙',
        category: AchievementCategory.GENERAL,
        rarity: Rarity.UNCOMMON,
        requirement: JSON.stringify({ type: 'total_coins', value: 1000 }),
        xpReward: 100,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Weekend Warrior' },
      update: {},
      create: {
        name: 'Weekend Warrior',
        description: 'Complete 10 quizzes on a weekend',
        icon: '⚔️',
        category: AchievementCategory.SPECIAL,
        rarity: Rarity.RARE,
        requirement: JSON.stringify({ type: 'weekend_quizzes', value: 10 }),
        xpReward: 150,
      },
    }),
    prisma.achievement.upsert({
      where: { name: 'Speed Runner' },
      update: {},
      create: {
        name: 'Speed Runner',
        description: 'Complete 5 quizzes in under 1 minute each',
        icon: '🏃',
        category: AchievementCategory.SPEED,
        rarity: Rarity.EPIC,
        requirement: JSON.stringify({ type: 'fast_completions', value: 5, maxTime: 60 }),
        xpReward: 300,
        gemReward: 30,
      },
    }),
  ]);

  console.log('✅ Achievements created');

  // Create Shop Items
  await Promise.all([
    prisma.shopItem.upsert({
      where: { id: 'item-avatar-cyber' },
      update: {},
      create: {
        id: 'item-avatar-cyber',
        name: 'Cyber Avatar Style',
        description: 'A futuristic cyberpunk avatar style',
        type: ItemType.AVATAR_STYLE,
        gemPrice: 50,
        avatarStyle: 'avataaars',
      },
    }),
    prisma.shopItem.upsert({
      where: { id: 'item-avatar-pixel' },
      update: {},
      create: {
        id: 'item-avatar-pixel',
        name: 'Pixel Avatar Style',
        description: 'Retro pixel art avatar',
        type: ItemType.AVATAR_STYLE,
        coinPrice: 500,
        avatarStyle: 'pixel-art',
      },
    }),
    prisma.shopItem.upsert({
      where: { id: 'item-xp-boost' },
      update: {},
      create: {
        id: 'item-xp-boost',
        name: 'XP Boost (2x)',
        description: 'Double XP for the next quiz',
        type: ItemType.XP_BOOST,
        gemPrice: 25,
        effectData: JSON.stringify({ multiplier: 2, duration: 1 }),
      },
    }),
    prisma.shopItem.upsert({
      where: { id: 'item-streak-freeze' },
      update: {},
      create: {
        id: 'item-streak-freeze',
        name: 'Streak Freeze',
        description: 'Protect your streak for one day',
        type: ItemType.STREAK_FREEZE,
        gemPrice: 30,
        effectData: JSON.stringify({ duration: 1 }),
      },
    }),
  ]);

  console.log('✅ Shop items created');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  
  await prisma.user.upsert({
    where: { email: 'demo@nexusquiz.com' },
    update: {},
    create: {
      email: 'demo@nexusquiz.com',
      username: 'DemoPlayer',
      password: hashedPassword,
      displayName: 'Demo Player',
      level: 5,
      xp: 250,
      totalXp: 1250,
      streak: 3,
      longestStreak: 7,
      gems: 150,
      coins: 750,
      totalQuizzes: 15,
      totalCorrect: 42,
      totalAnswered: 50,
      perfectQuizzes: 2,
    },
  });

  console.log('✅ Demo user created (email: demo@nexusquiz.com, password: demo123)');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
