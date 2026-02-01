'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import { 
  Briefcase, Brain, MessageSquare, Keyboard, Terminal, 
  BarChart3, Play, Sparkles, Zap 
} from 'lucide-react';
import { SpotlightCard, AnimatedGradientText, ParticleField } from '@/components/ui/MagicUI';
import { useRouter } from 'next/navigation';

export default function FeaturesShowcase() {
  const router = useRouter();
  const [, setActiveDemo] = useState<string | null>(null);

  const features = [
    {
      id: 'simulator',
      icon: <Briefcase className="w-8 h-8" />,
      title: 'AdTech Campaign Simulator',
      subtitle: 'The Killer Differentiator',
      description: 'Become a Media Buyer. Make real decisions. Get graded like a professional.',
      highlights: [
        'Role-playing scenarios with budget management',
        'Multi-dimensional scoring (ROI, Brand Safety, Success)',
        'Campaign Report Card: S-Tier to Intern Level',
        'Real AdTech concepts: CPM, CPC, Fraud, Attribution'
      ],
      demoLink: '/simulator',
      color: 'from-purple-500 to-pink-500',
      badge: '🔥 GAME CHANGER'
    },
    {
      id: 'explain',
      icon: <Brain className="w-8 h-8" />,
      title: 'Explain-Your-Answer AI',
      subtitle: 'Beyond Right/Wrong',
      description: 'We evaluate your thinking, not just your answers.',
      highlights: [
        'Type or speak WHY you chose an answer',
        'AI evaluates conceptual correctness',
        'Detects misconceptions in your reasoning',
        'Personalized feedback on your logic'
      ],
      demoLink: '/dashboard',
      color: 'from-blue-500 to-cyan-500',
      badge: '🧠 UNIQUE'
    },
    {
      id: 'commentary',
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'AI Mentor Commentary',
      subtitle: 'Live, Adaptive, Memorable',
      description: 'Choose your mentor personality: Snarky, Coach, or Serious.',
      highlights: [
        '😏 Snarky: "That\'s a classic rookie mistake"',
        '💪 Coach: "Great job! Keep that momentum!"',
        '🤖 Serious: "Error detected. Reassess approach."',
        'Real-time reactions based on speed & performance'
      ],
      demoLink: '/dashboard',
      color: 'from-orange-500 to-red-500',
      badge: '🎭 MEMORABLE'
    },
    {
      id: 'multimodal',
      icon: <Keyboard className="w-8 h-8" />,
      title: 'Multi-Modal Input',
      subtitle: 'One Quiz, Five Ways',
      description: 'Interact how YOU want: mouse, keyboard, voice, or terminal.',
      highlights: [
        '🖱️ Mouse Mode: Traditional clicking',
        '⌨️ Keyboard Mode: A/B/C/D shortcuts',
        '🎤 Voice Mode: Speak your answers',
        '💻 Terminal Mode: Retro command-line'
      ],
      demoLink: '/dashboard',
      color: 'from-green-500 to-teal-500',
      badge: '✨ WOW FACTOR'
    },
    {
      id: 'heatmap',
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Weakness Heatmap',
      subtitle: 'Adaptive Learning',
      description: 'Visual knowledge map with enforced progression.',
      highlights: [
        'Radar chart showing topic mastery',
        'Critical gaps lock next quiz',
        'Forced review before progression',
        'Gamified learning reinforcement'
      ],
      demoLink: '/analytics',
      color: 'from-yellow-500 to-orange-500',
      badge: '🎯 ADAPTIVE'
    },
    {
      id: 'terminal',
      icon: <Terminal className="w-8 h-8" />,
      title: 'Terminal Quiz Mode',
      subtitle: 'Retro Nostalgia',
      description: 'Answer quizzes in a hacker-style terminal interface.',
      highlights: [
        'Full command-line experience',
        'Green-on-black retro aesthetic',
        'Type A, B, C, D and hit Enter',
        'Matrix vibes while learning'
      ],
      demoLink: '/dashboard',
      color: 'from-green-400 to-emerald-500',
      badge: '💻 NOVELTY'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
      <ParticleField />
      
      <div className="container max-w-7xl mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Competition-Winning Features</span>
          </div>
          
          <h1 className="text-6xl font-bold mb-6">
            <AnimatedGradientText>
              Beyond Traditional Quizzes
            </AnimatedGradientText>
          </h1>
          
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            While others test knowledge, we <span className="text-purple-400 font-bold">teach thinking</span>.
            Six breakthrough features that judges have never seen before.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
              <span className="text-green-400 font-semibold">✅ Novel Input Modalities</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <span className="text-blue-400 font-semibold">✅ Content Intelligence</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <span className="text-purple-400 font-semibold">✅ Adaptive Pedagogy</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
              <span className="text-orange-400 font-semibold">✅ Surprise Factor</span>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveDemo(feature.id)}
              className="cursor-pointer"
            >
              <SpotlightCard 
                className="h-full p-6 hover:scale-105 transition-all duration-300"
              >
                <div className="mb-4">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.color} bg-opacity-20 mb-4`}>
                    {feature.icon}
                  </div>
                  
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-semibold text-purple-300 mb-3">
                    {feature.badge}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-purple-400 mb-3">{feature.subtitle}</p>
                  <p className="text-gray-400 mb-4">{feature.description}</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <Zap className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(feature.demoLink);
                  }}
                  className={`w-full px-4 py-3 rounded-lg bg-gradient-to-r ${feature.color} hover:opacity-90 transition-all font-semibold flex items-center justify-center gap-2 group`}
                >
                  <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Try It Now
                </button>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Competitive Edge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <SpotlightCard className="p-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              The Competitive Edge
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-red-400 mb-2">0</div>
                <div className="text-sm text-gray-400">Competitors with Simulator Mode</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-400 mb-2">0</div>
                <div className="text-sm text-gray-400">Apps that Evaluate Reasoning</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-400 mb-2">6</div>
                <div className="text-sm text-gray-400">Novel Features in Nexus</div>
              </div>
            </div>

            <blockquote className="text-xl italic text-gray-300 border-l-4 border-purple-500 pl-6 mb-6">
              &quot;You are not behind on engineering. You are behind on novelty leverage.&quot;
            </blockquote>

            <p className="text-gray-400 mb-6">
              Our project is <span className="text-purple-400 font-semibold">better built</span> AND 
              <span className="text-pink-400 font-semibold"> more memorable</span>.
            </p>

            <button
              onClick={() => router.push('/simulator')}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all font-bold text-lg flex items-center justify-center gap-3 mx-auto group"
            >
              <Briefcase className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              Start Campaign Simulator
              <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </SpotlightCard>
        </motion.div>
      </div>
    </div>
  );
}
