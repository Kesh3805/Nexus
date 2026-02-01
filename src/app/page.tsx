'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { 
  Zap, Trophy, Users, Brain, Sparkles, ChevronRight, 
  Star, Target, Flame, Crown, Rocket,
  Play, ArrowRight, Check
} from 'lucide-react';
import {
  AnimatedBorder,
  SpotlightCard,
  MagneticButton,
  ParticleField,
  AuroraBackground,
  ShimmerButton,
  TiltCard,
  AnimatedGradientText,
  MeteorShower,
  CyberGrid,
  NumberTicker,
  MorphingText,
  OrbitingCircles,
  GlowingOrb,
} from '@/components/ui/MagicUI';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Quizzes',
    description: 'Adaptive difficulty that learns from your performance',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Trophy,
    title: 'Global Leaderboards',
    description: 'Compete with players worldwide in real-time',
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Target,
    title: 'Achievement System',
    description: 'Unlock 100+ badges and show off your expertise',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Social Features',
    description: 'Challenge friends and join study groups',
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Flame,
    title: 'Streak Rewards',
    description: 'Build daily streaks for bonus XP multipliers',
    color: 'orange',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Sparkles,
    title: 'Power-Ups',
    description: 'Use special items to boost your performance',
    color: 'pink',
    gradient: 'from-pink-500 to-purple-500',
  },
];

const stats = [
  { value: 50000, label: 'Active Players', suffix: '+' },
  { value: 10000, label: 'Quizzes Created', suffix: '+' },
  { value: 5000000, label: 'Questions Answered', suffix: '+' },
  { value: 99, label: 'Uptime', suffix: '%' },
];

const categories = [
  { name: 'Ad Tech', icon: '📊', quizzes: 180, color: 'from-cyan-500 to-blue-500' },
  { name: 'Technology', icon: '💻', quizzes: 250, color: 'from-purple-500 to-pink-500' },
  { name: 'Marketing', icon: '📢', quizzes: 160, color: 'from-amber-500 to-orange-500' },
  { name: 'Business', icon: '💼', quizzes: 140, color: 'from-green-500 to-emerald-500' },
  { name: 'Programming', icon: '⌨️', quizzes: 220, color: 'from-pink-500 to-rose-500' },
  { name: 'Data Science', icon: '📈', quizzes: 190, color: 'from-blue-500 to-indigo-500' },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {mounted && (
          <>
            <AuroraBackground />
            <MeteorShower count={10} />
            <ParticleField particleCount={20} />
          </>
        )}
        
        {/* Simplified Glowing Orbs - Less GPU intensive */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 text-center">
          {/* Floating Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-8"
          >
            <AnimatedBorder className="px-6 py-2" borderRadius="9999px" duration={2}>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Introducing Nexus 2.0</span>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </div>
            </AnimatedBorder>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-8xl font-black mb-6 leading-tight"
          >
            <span className="block text-white">Level Up Your</span>
            <AnimatedGradientText className="text-7xl md:text-9xl">
              Knowledge
            </AnimatedGradientText>
          </motion.h1>

          {/* Morphing Subtext */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto"
          >
            <span>The ultimate quiz experience. </span>
            <MorphingText
              texts={[
                'Compete globally.',
                'Earn achievements.',
                'Challenge friends.',
                'Track your progress.',
              ]}
              className="inline-block text-cyan-400 font-semibold"
              interval={2500}
            />
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register">
              <MagneticButton className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 font-bold text-lg overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  Start Playing Free
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </MagneticButton>
            </Link>
            
            <Link href="/login">
              <MagneticButton className="px-8 py-4 rounded-2xl border-2 border-white/20 font-bold text-lg hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Sign In
              </MagneticButton>
            </Link>
          </motion.div>

          {/* Orbiting Icons */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <OrbitingCircles radius={280} duration={20}>
              <div className="p-3 rounded-xl bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
            </OrbitingCircles>
            <OrbitingCircles radius={280} duration={20} reverse>
              <div className="p-3 rounded-xl bg-purple-500/20 backdrop-blur-sm border border-purple-500/30">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
            </OrbitingCircles>
            <OrbitingCircles radius={350} duration={25}>
              <div className="p-3 rounded-xl bg-pink-500/20 backdrop-blur-sm border border-pink-500/30">
                <Star className="w-6 h-6 text-pink-400" />
              </div>
            </OrbitingCircles>
            <OrbitingCircles radius={350} duration={25} reverse>
              <div className="p-3 rounded-xl bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
            </OrbitingCircles>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          style={{ opacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 rounded-full bg-cyan-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 overflow-hidden">
        <CyberGrid />
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <TiltCard className="p-8 rounded-2xl bg-gray-900/50 backdrop-blur-xl border border-white/10">
                  <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                    <NumberTicker value={stat.value} />{stat.suffix}
                  </div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              <span className="text-white">Why Choose </span>
              <AnimatedGradientText>Nexus?</AnimatedGradientText>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the future of learning with our cutting-edge features
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <SpotlightCard
                  className="h-full p-8 rounded-3xl bg-gray-900/50 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-500 group"
                  spotlightColor={`rgba(${feature.color === 'cyan' ? '0, 245, 255' : feature.color === 'purple' ? '168, 85, 247' : feature.color === 'yellow' ? '234, 179, 8' : feature.color === 'green' ? '34, 197, 94' : feature.color === 'orange' ? '249, 115, 22' : '236, 72, 153'}, 0.15)`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6`}>
                    <div className="w-full h-full rounded-2xl bg-gray-900 flex items-center justify-center">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-cyan-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="relative py-24 overflow-hidden">
        <GlowingOrb size={400} color="#a855f7" className="top-1/2 -left-40" />
        <GlowingOrb size={400} color="#00f5ff" className="top-1/2 -right-40" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-4">
              <AnimatedGradientText>Explore</AnimatedGradientText>
              <span className="text-white"> Categories</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Dive into a world of knowledge across multiple disciplines
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
              >
                <AnimatedBorder
                  className="p-6 text-center cursor-pointer"
                  borderRadius="1.5rem"
                  colors={['#00f5ff', '#a855f7', '#ff00ff', '#00f5ff']}
                >
                  <div className="text-5xl mb-3">{category.icon}</div>
                  <div className="text-white font-bold mb-1">{category.name}</div>
                  <div className="text-gray-400 text-sm">{category.quizzes} quizzes</div>
                </AnimatedBorder>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <AuroraBackground />
        <ParticleField particleCount={40} />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-8">
              <Rocket className="w-4 h-4" />
              Ready to begin your journey?
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              <span className="text-white">Start Your </span>
              <AnimatedGradientText>Adventure</AnimatedGradientText>
            </h2>
            
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join thousands of learners who have already transformed their knowledge. 
              It&apos;s free to start, no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/register">
                <ShimmerButton
                  className="px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 font-bold text-xl hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300"
                >
                  <span className="flex items-center gap-3">
                    Create Free Account
                    <ArrowRight className="w-6 h-6" />
                  </span>
                </ShimmerButton>
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-gray-400">
              {[
                'Free forever tier',
                'No credit card',
                'Cancel anytime',
              ].map((text, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Nexus Quiz</span>
            </div>
            
            <div className="flex items-center gap-8 text-gray-400">
              <Link href="#" className="hover:text-cyan-400 transition-colors">About</Link>
              <Link href="#" className="hover:text-cyan-400 transition-colors">Features</Link>
              <Link href="#" className="hover:text-cyan-400 transition-colors">Pricing</Link>
              <Link href="#" className="hover:text-cyan-400 transition-colors">Contact</Link>
            </div>
            
            <div className="text-gray-500 text-sm">
              © 2026 Nexus Quiz. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
