'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Elements';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { 
  Briefcase, TrendingUp, DollarSign, Target,
  AlertTriangle, Shield, Zap, BarChart3, Brain
} from 'lucide-react';
import {
  SpotlightCard,
  ParticleField,
  ShimmerButton,
} from '@/components/ui/MagicUI';

interface SimulatorMetrics {
  roi: number;
  brandSafety: number;
  campaignSuccess: number;
  budget: number;
  decisions: number;
}

interface SimulatorQuestion {
  id: string;
  scenario: string;
  context: string;
  question: string;
  options: {
    id: string;
    text: string;
    impact: {
      roi: number;
      brandSafety: number;
      campaignSuccess: number;
      budget: number;
    };
    feedback: string;
    isOptimal: boolean;
  }[];
  category: 'targeting' | 'budgeting' | 'fraud' | 'attribution' | 'optimization';
}

export default function SimulatorPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [metrics, setMetrics] = useState<SimulatorMetrics>({
    roi: 100,
    brandSafety: 100,
    campaignSuccess: 100,
    budget: 100000,
    decisions: 0,
  });
  const [completed, setCompleted] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<SimulatorQuestion[]>([]);

  // AdTech Simulator Questions - Expanded Pool
  const questionPool: SimulatorQuestion[] = [
    {
      id: '1',
      scenario: '🎯 Campaign Launch Decision',
      context: 'You\'re launching a new product campaign with $100k budget. Initial data shows high CPM ($25) but excellent engagement rate (8%).',
      question: 'Your CMO wants results fast. What\'s your move?',
      category: 'budgeting',
      options: [
        {
          id: 'a',
          text: 'Continue with current strategy - high engagement justifies premium CPM',
          impact: { roi: -15, brandSafety: 5, campaignSuccess: 10, budget: -20000 },
          feedback: '⚠️ Classic rookie mistake! High engagement doesn\'t always mean conversions. You burned budget without validating conversion rates.',
          isOptimal: false,
        },
        {
          id: 'b',
          text: 'Run A/B test: 70% current, 30% lower CPM channels to compare ROI',
          impact: { roi: 20, brandSafety: 10, campaignSuccess: 25, budget: -15000 },
          feedback: '🎯 Smart move! Media buyers love this trick. You validated assumptions before committing full budget.',
          isOptimal: true,
        },
        {
          id: 'c',
          text: 'Immediately shift all budget to lowest CPM channels to maximize reach',
          impact: { roi: -25, brandSafety: -15, campaignSuccess: -20, budget: -25000 },
          feedback: '❌ Disaster! You sacrificed quality for quantity. Ended up with bot traffic and brand safety issues.',
          isOptimal: false,
        },
      ],
    },
    {
      id: '2',
      scenario: '🚨 Fraud Alert',
      context: 'Analytics show suspicious spike: 10k clicks in 2 hours from Bangladesh, 0.1% conversion rate, normal pattern shows 200 clicks/day.',
      question: 'Your fraud detection system flagged this. What do you do?',
      category: 'fraud',
      options: [
        {
          id: 'a',
          text: 'Immediately pause campaign and request refund for fraudulent traffic',
          impact: { roi: 15, brandSafety: 25, campaignSuccess: 10, budget: 5000 },
          feedback: '✅ Excellent call! Prevented $15k in wasted spend. Brand safety preserved.',
          isOptimal: true,
        },
        {
          id: 'b',
          text: 'Wait to gather more data - could be legitimate viral spike',
          impact: { roi: -30, brandSafety: -25, campaignSuccess: -35, budget: -30000 },
          feedback: '💸 Ouch! That was click fraud. You lost 30% of campaign budget to bots.',
          isOptimal: false,
        },
        {
          id: 'c',
          text: 'Geo-fence Bangladesh and continue campaign elsewhere',
          impact: { roi: 5, brandSafety: 10, campaignSuccess: 5, budget: -10000 },
          feedback: '⚠️ Partial solution. You stopped the leak but didn\'t recover funds. Better than nothing.',
          isOptimal: false,
        },
      ],
    },
    {
      id: '3',
      scenario: '📊 Attribution Puzzle',
      context: 'Customer journey: Saw Facebook ad → Clicked Instagram ad → Searched Google → Converted via email link. Who gets credit?',
      question: 'CMO wants to know which channel to increase budget for. Your recommendation?',
      category: 'attribution',
      options: [
        {
          id: 'a',
          text: 'Email gets 100% credit - it drove the final conversion',
          impact: { roi: -20, brandSafety: 0, campaignSuccess: -15, budget: 0 },
          feedback: '❌ Last-click bias! You ignored the awareness channels that started the journey.',
          isOptimal: false,
        },
        {
          id: 'b',
          text: 'Multi-touch attribution: Facebook 30%, Instagram 30%, Google 25%, Email 15%',
          impact: { roi: 25, brandSafety: 10, campaignSuccess: 30, budget: 10000 },
          feedback: '🏆 Perfect! You understand the full funnel. This is how pros optimize spend.',
          isOptimal: true,
        },
        {
          id: 'c',
          text: 'Split evenly across all four channels',
          impact: { roi: 5, brandSafety: 5, campaignSuccess: 5, budget: 0 },
          feedback: '📚 Textbook answer, but not optimal. Upper funnel typically deserves more credit.',
          isOptimal: false,
        },
      ],
    },
    {
      id: '4',
      scenario: '⚡ Real-Time Optimization',
      context: 'Day 3 of 14-day campaign. Video ads: 2% CTR, $50 CPM. Static ads: 0.5% CTR, $15 CPM. Both converting at 3%. Budget 40% spent.',
      question: 'You need to hit conversion targets. How do you rebalance?',
      category: 'optimization',
      options: [
        {
          id: 'a',
          text: 'Double down on video - higher CTR means more engagement',
          impact: { roi: -10, brandSafety: 5, campaignSuccess: 0, budget: -20000 },
          feedback: '📊 Engagement vanity trap! Equal conversion rate at 3x cost = terrible ROI.',
          isOptimal: false,
        },
        {
          id: 'b',
          text: 'Shift 70% budget to static ads - same conversion, 3x cheaper',
          impact: { roi: 30, brandSafety: 10, campaignSuccess: 35, budget: 15000 },
          feedback: '💡 Brilliant! You optimized for cost-per-conversion, not vanity metrics.',
          isOptimal: true,
        },
        {
          id: 'c',
          text: 'Keep current 50/50 split to maintain brand presence across formats',
          impact: { roi: -5, brandSafety: 10, campaignSuccess: -5, budget: -5000 },
          feedback: '⚖️ Playing it safe cost you efficiency. Data should drive decisions, not comfort.',
          isOptimal: false,
        },
      ],
    },
    {
      id: '5',
      scenario: '🎯 Targeting Dilemma',
      context: 'Luxury watch brand. Broad targeting: $30 CPA, 50k conversions. Narrow (HHI $200k+): $80 CPA, 5k conversions. LTV data: Broad $150, Narrow $800.',
      question: 'CEO wants to scale. Which strategy wins?',
      category: 'targeting',
      options: [
        {
          id: 'a',
          text: 'Scale broad targeting - lower CPA and higher volume wins',
          impact: { roi: -15, brandSafety: 5, campaignSuccess: -10, budget: -15000 },
          feedback: '💎 You optimized for CPA but ignored LTV! Narrow targeting has 26x better ROI despite higher CPA.',
          isOptimal: false,
        },
        {
          id: 'b',
          text: 'Scale narrow targeting - $800 LTV vs $80 CPA = 10x return',
          impact: { roi: 35, brandSafety: 15, campaignSuccess: 40, budget: 25000 },
          feedback: '🚀 Elite move! You understood LTV:CAC ratio. This is what separates good from great media buyers.',
          isOptimal: true,
        },
        {
          id: 'c',
          text: 'Run both at current levels to hedge risk',
          impact: { roi: 5, brandSafety: 10, campaignSuccess: 5, budget: 0 },
          feedback: '🤷 Safe but mediocre. You had data to make a bold, profitable decision.',
          isOptimal: false,
        },
      ],
    },
    {
      id: '6',
      scenario: '📊 Attribution Mystery',
      context: 'Multi-touch attribution shows: First-touch CPA $40, Last-touch CPA $25, Linear CPA $35. But Time-decay model reveals 70% convert within 24hrs of last click.',
      question: 'Budget allocation decision?',
      category: 'attribution',
      options: [
        {
          id: 'a',
          text: 'Optimize for last-touch - lowest CPA wins',
          impact: { roi: -10, brandSafety: 5, campaignSuccess: -5, budget: -10000 },
          feedback: '⚠️ You fell for vanity metrics! Last-touch ignores top-funnel contribution.',
          isOptimal: false,
        },
        {
          id: 'b',
          text: 'Use time-decay model - weight recent interactions but credit full journey',
          impact: { roi: 30, brandSafety: 10, campaignSuccess: 35, budget: 20000 },
          feedback: '🎯 Brilliant! You balanced short-term tactics with long-term strategy.',
          isOptimal: true,
        },
        {
          id: 'c',
          text: 'Linear attribution - equal credit to all touchpoints',
          impact: { roi: 0, brandSafety: 5, campaignSuccess: 5, budget: 0 },
          feedback: '🤷 Safe but naive. Not all touchpoints are equal.',
          isOptimal: false,
        },
      ],
    },
    {
      id: '7',
      scenario: '🔥 Viral Crisis',
      context: 'Your campaign goes viral but for wrong reasons. Ads appearing next to controversial content. PR crisis brewing. Campaign performing at 300% of KPI.',
      question: 'Immediate action?',
      category: 'fraud',
      options: [
        {
          id: 'a',
          text: 'Pause everything - protect brand at all costs',
          impact: { roi: -20, brandSafety: 40, campaignSuccess: -30, budget: 0 },
          feedback: '🛡️ Wise but costly. You protected brand but lost momentum.',
          isOptimal: false,
        },
        {
          id: 'b',
          text: 'Update targeting exclusions, maintain campaign with brand-safe publishers only',
          impact: { roi: 15, brandSafety: 35, campaignSuccess: 25, budget: 10000 },
          feedback: '👏 Professional move! You balanced brand safety with business continuity.',
          isOptimal: true,
        },
        {
          id: 'c',
          text: 'Continue - performance is great, PR will blow over',
          impact: { roi: 25, brandSafety: -50, campaignSuccess: -40, budget: 15000 },
          feedback: '💣 Career-limiting move! Short-term gains, long-term brand damage.',
          isOptimal: false,
        },
      ],
    },
    {
      id: '8',
      scenario: '💰 Budget Reallocation',
      context: 'Q4 surplus: $50k available. Options: Scale winner (Meta, 8x ROAS), Test TikTok (risky but trending), or Save for Q1.',
      question: 'Strategic play?',
      category: 'budgeting',
      options: [
        {
          id: 'a',
          text: 'Scale Meta - proven winner',
          impact: { roi: 15, brandSafety: 10, campaignSuccess: 20, budget: 30000 },
          feedback: '💡 Solid choice but missed innovation opportunity.',
          isOptimal: false,
        },
        {
          id: 'b',
          text: 'Split: $35k Meta scale, $15k TikTok test',
          impact: { roi: 30, brandSafety: 15, campaignSuccess: 40, budget: 40000 },
          feedback: '🚀 Perfect! You scaled what works while testing new channels.',
          isOptimal: true,
        },
        {
          id: 'c',
          text: 'Save for Q1 - avoid Q4 CPM inflation',
          impact: { roi: -10, brandSafety: 5, campaignSuccess: -15, budget: 50000 },
          feedback: '📉 Overthinking it. You missed revenue opportunity.',
          isOptimal: false,
        },
      ],
    },
    {
      id: '9',
      scenario: '🎬 Creative Testing',
      context: 'You have 5 ad creatives. Creative A: $50 CPA, 2% CTR. Creative B: $35 CPA, 1.2% CTR. Creative C: $40 CPA, 3.5% CTR but brand-risky humor.',
      question: 'Scale decision for next month?',
      category: 'optimization',
      options: [
        {
          id: 'a',
          text: 'Scale Creative B - lowest CPA is king',
          impact: { roi: 10, brandSafety: 10, campaignSuccess: 15, budget: 15000 },
          feedback: '📊 Decent choice but you ignored CTR signals.',
          isOptimal: false,
        },
        {
          id: 'b',
          text: 'Scale Creative C - highest CTR shows best engagement',
          impact: { roi: 15, brandSafety: -20, campaignSuccess: 20, budget: 20000 },
          feedback: '⚠️ Risky! Great engagement but brand safety issues could backfire.',
          isOptimal: false,
        },
        {
          id: 'c',
          text: 'Scale Creative A with elements from C (high CTR) - test safe version',
          impact: { roi: 35, brandSafety: 20, campaignSuccess: 40, budget: 30000 },
          feedback: '🎯 Master move! You combined best elements while mitigating risk.',
          isOptimal: true,
        },
      ],
    },
    {
      id: '10',
      scenario: '💡 Innovation vs. Proven',
      context: 'New AI bidding algorithm promises 30% better ROAS but needs 30-day learning. Current manual bidding delivering 6x ROAS consistently.',
      question: 'Mid-quarter decision?',
      category: 'optimization',
      options: [
        {
          id: 'a',
          text: 'Stay manual - too risky mid-quarter',
          impact: { roi: 5, brandSafety: 10, campaignSuccess: 10, budget: 10000 },
          feedback: '😐 Safe but stagnant. You avoided risk but missed innovation.',
          isOptimal: false,
        },
        {
          id: 'b',
          text: 'Full switch to AI - trust the algorithm',
          impact: { roi: -20, brandSafety: -5, campaignSuccess: -15, budget: -15000 },
          feedback: '💥 Reckless! Learning period killed your quarter.',
          isOptimal: false,
        },
        {
          id: 'c',
          text: 'Parallel test: 20% budget to AI, keep 80% manual, evaluate after 2 weeks',
          impact: { roi: 25, brandSafety: 15, campaignSuccess: 30, budget: 25000 },
          feedback: '🚀 Strategic genius! You tested innovation without risking the quarter.',
          isOptimal: true,
        },
      ],
    },
    {
      id: '11',
      scenario: '📱 Platform Migration',
      context: 'iOS 14.5 privacy changes hit. Facebook ROAS dropped from 8x to 4x. Google Display showing 5x ROAS with better tracking.',
      question: 'Immediate action plan?',
      category: 'targeting',
      options: [
        {
          id: 'a',
          text: 'Shift all Facebook budget to Google immediately',
          impact: { roi: -10, brandSafety: 5, campaignSuccess: -5, budget: 0 },
          feedback: '⚠️ Hasty! You lost Facebook audience insights and retargeting pools.',
          isOptimal: false,
        },
        {
          id: 'b',
          text: 'Keep Facebook - implement Conversion API and server-side tracking',
          impact: { roi: 30, brandSafety: 15, campaignSuccess: 35, budget: 35000 },
          feedback: '🎯 Pro move! You adapted to privacy changes instead of fleeing.',
          isOptimal: true,
        },
        {
          id: 'c',
          text: 'Pause Facebook entirely until privacy situation stabilizes',
          impact: { roi: -25, brandSafety: 10, campaignSuccess: -20, budget: -10000 },
          feedback: '❌ You abandoned a fixable problem and lost market share.',
          isOptimal: false,
        },
      ],
    },
    {
      id: '12',
      scenario: '🎯 Audience Expansion',
      context: 'Core audience of 500k is exhausted (frequency 8+). Options: Lookalike audiences (3M reach), Interest expansion (10M reach), or Broad targeting (50M reach).',
      question: 'Scaling strategy?',
      category: 'targeting',
      options: [
        {
          id: 'a',
          text: 'Go broad - maximize reach',
          impact: { roi: -15, brandSafety: 0, campaignSuccess: -10, budget: -20000 },
          feedback: '📉 Too diluted! You wasted budget on irrelevant audiences.',
          isOptimal: false,
        },
        {
          id: 'b',
          text: 'Start with Lookalike 1-2%, then test Interest expansion',
          impact: { roi: 30, brandSafety: 10, campaignSuccess: 35, budget: 30000 },
          feedback: '💎 Textbook perfect! You scaled intelligently with data-backed targeting.',
          isOptimal: true,
        },
        {
          id: 'c',
          text: 'Refresh creative to reduce frequency, keep core audience',
          impact: { roi: 10, brandSafety: 15, campaignSuccess: 15, budget: 10000 },
          feedback: '🤔 Band-aid solution. Creative fatigue is temporary relief, not scaling.',
          isOptimal: false,
        },
      ],
    },
  ];

  // Randomize and select 5 questions on component mount
  useEffect(() => {
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
    setActiveQuestions(shuffled.slice(0, 5));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const handleStart = () => {
    setStarted(true);
  };

  const handleSelectOption = (optionId: string) => {
    if (showFeedback) return;
    setSelectedOption(optionId);
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    
    const question = activeQuestions[currentQuestion];
    const option = question.options.find(o => o.id === selectedOption);
    
    if (option) {
      setMetrics(prev => ({
        roi: Math.max(0, Math.min(200, prev.roi + option.impact.roi)),
        brandSafety: Math.max(0, Math.min(100, prev.brandSafety + option.impact.brandSafety)),
        campaignSuccess: Math.max(0, Math.min(100, prev.campaignSuccess + option.impact.campaignSuccess)),
        budget: prev.budget + option.impact.budget,
        decisions: prev.decisions + 1,
      }));
      
      setShowFeedback(true);
    }
  };

  const handleNext = () => {
    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setCompleted(true);
      if (metrics.roi > 120 && metrics.campaignSuccess > 80) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const getGradeColor = (value: number, isInverted = false) => {
    if (isInverted) {
      if (value >= 100) return 'text-green-400';
      if (value >= 70) return 'text-yellow-400';
      return 'text-red-400';
    }
    if (value >= 80) return 'text-green-400';
    if (value >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceGrade = () => {
    const avg = (metrics.roi + metrics.brandSafety + metrics.campaignSuccess) / 3;
    if (avg >= 120) return { grade: 'S', label: 'Elite Media Buyer', color: 'text-purple-400' };
    if (avg >= 100) return { grade: 'A+', label: 'Senior Media Buyer', color: 'text-green-400' };
    if (avg >= 80) return { grade: 'A', label: 'Competent Media Buyer', color: 'text-blue-400' };
    if (avg >= 60) return { grade: 'B', label: 'Junior Media Buyer', color: 'text-yellow-400' };
    if (avg >= 40) return { grade: 'C', label: 'Intern Level', color: 'text-orange-400' };
    return { grade: 'D', label: 'Needs More Training', color: 'text-red-400' };
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
        <ParticleField />
        
        <div className="container max-w-4xl mx-auto px-4 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Campaign Simulator Mode</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              AdTech Skill Simulator
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              You are now a <span className="text-purple-400 font-bold">Media Buyer</span> at an AdTech firm. 
              Your decisions will impact ROI, brand safety, and campaign success.
            </p>
          </motion.div>

          <SpotlightCard className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-400" />
              Your Mission
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">$100,000</div>
                <div className="text-sm text-gray-400">Starting Budget</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-400">100%</div>
                <div className="text-sm text-gray-400">Campaign Success</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <Shield className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-400">100%</div>
                <div className="text-sm text-gray-400">Brand Safety</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-purple-300">Real AdTech Scenarios</div>
                  <div className="text-sm text-gray-400">Budget allocation, CPM vs CPC, fraud detection, attribution logic</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-green-300">Dynamic Impact</div>
                  <div className="text-sm text-gray-400">Every choice affects ROI, brand safety, and campaign success</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-yellow-300">Performance Report Card</div>
                  <div className="text-sm text-gray-400">Get graded like a real media buyer based on your decisions</div>
                </div>
              </div>
            </div>

            <ShimmerButton
              onClick={handleStart}
              className="w-full py-4 text-lg font-bold"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Campaign Simulation
            </ShimmerButton>
          </SpotlightCard>
        </div>
      </div>
    );
  }

  if (completed) {
    const perfGrade = getPerformanceGrade();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
        <ParticleField />
        
        <div className="container max-w-4xl mx-auto px-4 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-8"
          >
            <div className={cn("text-8xl font-bold mb-4", perfGrade.color)}>
              {perfGrade.grade}
            </div>
            <h2 className="text-3xl font-bold mb-2">{perfGrade.label}</h2>
            <p className="text-gray-400">Campaign Performance Report</p>
          </motion.div>

          <SpotlightCard className="p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Final Metrics
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">ROI Performance</span>
                  <span className={cn("text-2xl font-bold", getGradeColor(metrics.roi, true))}>
                    {metrics.roi}%
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all", 
                      metrics.roi >= 100 ? 'bg-green-500' : metrics.roi >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(100, (metrics.roi / 200) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Campaign Success</span>
                  <span className={cn("text-2xl font-bold", getGradeColor(metrics.campaignSuccess))}>
                    {metrics.campaignSuccess}%
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all", 
                      metrics.campaignSuccess >= 80 ? 'bg-green-500' : metrics.campaignSuccess >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${metrics.campaignSuccess}%` }}
                  />
                </div>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Brand Safety</span>
                  <span className={cn("text-2xl font-bold", getGradeColor(metrics.brandSafety))}>
                    {metrics.brandSafety}%
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all", 
                      metrics.brandSafety >= 80 ? 'bg-green-500' : metrics.brandSafety >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${metrics.brandSafety}%` }}
                  />
                </div>
              </div>

              <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Budget Remaining</span>
                  <span className={cn("text-2xl font-bold", getGradeColor(metrics.budget / 1000, true))}>
                    ${(metrics.budget / 1000).toFixed(1)}k
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {metrics.budget > 100000 ? '✅ Under budget!' : metrics.budget > 50000 ? '⚠️ Moderate spend' : '❌ Over budget'}
                </div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 border border-purple-500/30">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Performance Analysis
              </h4>
              <div className="space-y-2 text-sm">
                {metrics.roi >= 120 && <div className="text-green-400">✅ Outstanding ROI optimization</div>}
                {metrics.roi < 80 && <div className="text-red-400">❌ Poor ROI - review targeting and bidding strategies</div>}
                {metrics.brandSafety >= 90 && <div className="text-green-400">✅ Excellent brand safety practices</div>}
                {metrics.brandSafety < 70 && <div className="text-orange-400">⚠️ Brand safety concerns detected</div>}
                {metrics.campaignSuccess >= 90 && <div className="text-green-400">✅ Campaign objectives exceeded</div>}
                {metrics.campaignSuccess < 60 && <div className="text-red-400">❌ Campaign underperformed - needs optimization</div>}
                {metrics.budget > 80000 && <div className="text-green-400">✅ Efficient budget management</div>}
                {metrics.budget < 40000 && <div className="text-orange-400">⚠️ High spend rate - watch budget pacing</div>}
              </div>
            </div>
          </SpotlightCard>

          <div className="flex gap-4">
            <Button onClick={() => router.push('/dashboard')} className="flex-1">
              Back to Dashboard
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = activeQuestions[currentQuestion];
  if (!currentQ) return null;
  const progress = ((currentQuestion + 1) / activeQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
      <ParticleField />
      
      <div className="container max-w-5xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-purple-400" />
              <span className="text-lg font-semibold">Campaign Scenario {currentQuestion + 1}/{activeQuestions.length}</span>
            </div>
            <div className="text-sm text-gray-400">
              Decisions Made: {metrics.decisions}
            </div>
          </div>
          
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Live Metrics Dashboard */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
            <div className="text-xs text-gray-400 mb-1">ROI</div>
            <div className={cn("text-2xl font-bold", getGradeColor(metrics.roi, true))}>
              {metrics.roi}%
            </div>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
            <div className="text-xs text-gray-400 mb-1">Success</div>
            <div className={cn("text-2xl font-bold", getGradeColor(metrics.campaignSuccess))}>
              {metrics.campaignSuccess}%
            </div>
          </div>
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm">
            <div className="text-xs text-gray-400 mb-1">Safety</div>
            <div className={cn("text-2xl font-bold", getGradeColor(metrics.brandSafety))}>
              {metrics.brandSafety}%
            </div>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 backdrop-blur-sm">
            <div className="text-xs text-gray-400 mb-1">Budget</div>
            <div className={cn("text-lg font-bold", getGradeColor(metrics.budget / 1000, true))}>
              ${(metrics.budget / 1000).toFixed(0)}k
            </div>
          </div>
        </div>

        {/* Question Card */}
        <SpotlightCard className="p-8 mb-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
              <span className="text-xs font-semibold text-purple-300 uppercase">{currentQ.category}</span>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              {currentQ.scenario}
            </h2>
            
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4">
              <p className="text-gray-300">{currentQ.context}</p>
            </div>
            
            <p className="text-xl text-gray-200 font-semibold">{currentQ.question}</p>
          </div>

          <div className="space-y-4">
            {currentQ.options.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                whileTap={{ scale: showFeedback ? 1 : 0.98 }}
              >
                <div
                  onClick={() => handleSelectOption(option.id)}
                  className={cn(
                    "p-6 rounded-lg border-2 cursor-pointer transition-all",
                    selectedOption === option.id
                      ? "border-purple-500 bg-purple-500/20"
                      : "border-gray-700 hover:border-gray-600 bg-gray-800/50",
                    showFeedback && option.isOptimal && "border-green-500 bg-green-500/20",
                    showFeedback && selectedOption === option.id && !option.isOptimal && "border-red-500 bg-red-500/20",
                    showFeedback && "cursor-default"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1",
                      selectedOption === option.id ? "border-purple-400 bg-purple-500" : "border-gray-600"
                    )}>
                      {selectedOption === option.id && <div className="w-3 h-3 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg mb-2">{option.text}</p>
                      
                      {showFeedback && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-gray-700"
                        >
                          <p className={cn(
                            "text-sm mb-3",
                            option.isOptimal ? "text-green-300" : selectedOption === option.id ? "text-red-300" : "text-gray-400"
                          )}>
                            {option.feedback}
                          </p>
                          
                          {selectedOption === option.id && (
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">ROI Impact:</span>
                                <span className={cn(
                                  "font-bold",
                                  option.impact.roi > 0 ? "text-green-400" : "text-red-400"
                                )}>
                                  {option.impact.roi > 0 ? '+' : ''}{option.impact.roi}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Success:</span>
                                <span className={cn(
                                  "font-bold",
                                  option.impact.campaignSuccess > 0 ? "text-green-400" : "text-red-400"
                                )}>
                                  {option.impact.campaignSuccess > 0 ? '+' : ''}{option.impact.campaignSuccess}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Safety:</span>
                                <span className={cn(
                                  "font-bold",
                                  option.impact.brandSafety > 0 ? "text-green-400" : "text-red-400"
                                )}>
                                  {option.impact.brandSafety > 0 ? '+' : ''}{option.impact.brandSafety}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Budget:</span>
                                <span className={cn(
                                  "font-bold",
                                  option.impact.budget > 0 ? "text-green-400" : "text-red-400"
                                )}>
                                  {option.impact.budget > 0 ? '+' : ''}{option.impact.budget < 0 ? '-' : ''}${Math.abs(option.impact.budget / 1000).toFixed(0)}k
                                </span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </SpotlightCard>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {!showFeedback ? (
            <ShimmerButton
              onClick={handleConfirm}
              disabled={!selectedOption}
              className="flex-1 py-4 text-lg font-bold disabled:opacity-50"
            >
              Confirm Decision
            </ShimmerButton>
          ) : (
            <ShimmerButton
              onClick={handleNext}
              className="flex-1 py-4 text-lg font-bold"
            >
              {currentQuestion < activeQuestions.length - 1 ? 'Next Scenario' : 'View Report Card'}
            </ShimmerButton>
          )}
        </div>
      </div>
    </div>
  );
}
