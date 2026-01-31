'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// ==================== ANIMATED BORDER ====================
export function AnimatedBorder({
  children,
  className = '',
  borderRadius = '1rem',
  duration = 3,
  colors = ['#00f5ff', '#a855f7', '#ff00ff', '#00f5ff'],
}: {
  children: ReactNode;
  className?: string;
  borderRadius?: string;
  duration?: number;
  colors?: string[];
}) {
  return (
    <div className={`relative ${className}`} style={{ borderRadius }}>
      <div
        className="absolute inset-0 -z-10"
        style={{
          borderRadius,
          background: `linear-gradient(var(--angle), ${colors.join(', ')})`,
          animation: `rotate ${duration}s linear infinite`,
          padding: '2px',
        }}
      />
      <div
        className="absolute inset-[2px] -z-10 bg-gray-950"
        style={{ borderRadius: `calc(${borderRadius} - 2px)` }}
      />
      <style jsx>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes rotate {
          to { --angle: 360deg; }
        }
      `}</style>
      {children}
    </div>
  );
}

// ==================== SPOTLIGHT CARD ====================
export function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(0, 245, 255, 0.15)',
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

// ==================== MAGNETIC BUTTON ====================
export function MagneticButton({
  children,
  className = '',
  strength = 0.5,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 150 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x: xSpring, y: ySpring }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// ==================== GLOWING ORB ====================
export function GlowingOrb({
  size = 400,
  color = '#00f5ff',
  className = '',
  blur = 50, // Reduced from 100 for performance
}: {
  size?: number;
  color?: string;
  className?: string;
  blur?: number;
}) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
      }}
    />
  );
}

// ==================== PARTICLE FIELD ====================
export function ParticleField({
  particleCount = 15, // Reduced from 50 for performance
  className = '',
}: {
  particleCount?: number;
  className?: string;
}) {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cyan-400/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ==================== AURORA BACKGROUND ====================
export function AuroraBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-full h-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent, #00f5ff20, transparent, #a855f720, transparent)',
          filter: 'blur(60px)', // Reduced from 100 for performance
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute -bottom-1/2 -right-1/2 w-full h-full"
        style={{
          background: 'conic-gradient(from 180deg, transparent, #ff00ff20, transparent, #00f5ff20, transparent)',
          filter: 'blur(60px)', // Reduced from 100 for performance
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// ==================== SHIMMER BUTTON ====================
export function ShimmerButton({
  children,
  className = '',
  shimmerColor = '#ffffff',
  onClick,
  disabled,
}: {
  children: ReactNode;
  className?: string;
  shimmerColor?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}20, transparent)`,
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </button>
  );
}

// ==================== TILT CARD ====================
export function TiltCard({
  children,
  className = '',
  tiltAmount = 10,
  glareOpacity = 0.2,
}: {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  glareOpacity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setRotateX((y - 0.5) * -tiltAmount);
    setRotateY((x - 0.5) * tiltAmount);
    setGlarePosition({ x: x * 100, y: y * 100 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`relative ${className}`}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-inherit"
        style={{
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,${glareOpacity}), transparent 50%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

// ==================== TEXT GRADIENT ANIMATION ====================
export function AnimatedGradientText({
  children,
  className = '',
  colors = ['#00f5ff', '#a855f7', '#ff00ff', '#00f5ff'],
}: {
  children: ReactNode;
  className?: string;
  colors?: string[];
}) {
  return (
    <span
      className={`bg-clip-text text-transparent animate-gradient-x ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
        backgroundSize: '200% auto',
      }}
    >
      <style jsx>{`
        @keyframes gradient-x {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s linear infinite;
        }
      `}</style>
      {children}
    </span>
  );
}

// ==================== RIPPLE EFFECT ====================
export function RippleButton({
  children,
  className = '',
  rippleColor = 'rgba(255, 255, 255, 0.4)',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  rippleColor?: string;
  onClick?: () => void;
}) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples((prev) => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1000);
    
    onClick?.();
  };

  return (
    <button onClick={handleClick} className={`relative overflow-hidden ${className}`}>
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            background: rippleColor,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          0% { width: 0; height: 0; opacity: 1; }
          100% { width: 500px; height: 500px; opacity: 0; }
        }
        .animate-ripple {
          animation: ripple 1s ease-out forwards;
        }
      `}</style>
    </button>
  );
}

// ==================== FLOATING DOCK ====================
export function FloatingDock({
  items,
  className = '',
}: {
  items: { icon: ReactNode; label: string; href: string; active?: boolean }[];
  className?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={`flex items-center gap-2 p-2 rounded-2xl bg-gray-900/80 backdrop-blur-xl border border-white/10 ${className}`}>
      {items.map((item, index) => (
        <motion.a
          key={index}
          href={item.href}
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
          animate={{
            scale: hoveredIndex === index ? 1.2 : hoveredIndex !== null ? 0.9 : 1,
            y: hoveredIndex === index ? -8 : 0,
          }}
          className={`relative p-3 rounded-xl transition-colors ${
            item.active ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {item.icon}
          <AnimatePresence>
            {hoveredIndex === index && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-gray-800 text-white text-sm whitespace-nowrap"
              >
                {item.label}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.a>
      ))}
    </div>
  );
}

// ==================== MORPHING TEXT ====================
export function MorphingText({
  texts,
  className = '',
  interval = 3000,
}: {
  texts: string[];
  className?: string;
  interval?: number;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          transition={{ duration: 0.5 }}
          className="block"
        >
          {texts[currentIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ==================== METEOR SHOWER ====================
export function MeteorShower({
  count = 10, // Reduced from 20 for performance
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  const meteors = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 2 + 1,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          className="absolute w-0.5 h-20 bg-gradient-to-b from-cyan-400 to-transparent"
          style={{
            left: `${meteor.left}%`,
            top: '-80px',
            transform: 'rotate(215deg)',
            animation: `meteor ${meteor.duration}s linear ${meteor.delay}s infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes meteor {
          0% { transform: rotate(215deg) translateX(0); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: rotate(215deg) translateX(500px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ==================== SPOTLIGHT ====================
export function Spotlight({
  className = '',
  fill = 'white',
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      className={`animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.21"
        />
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
        </filter>
      </defs>
      <style jsx>{`
        @keyframes spotlight {
          0% { opacity: 0; transform: translate(-72%, -62%) scale(0.5); }
          100% { opacity: 1; transform: translate(-50%, -40%) scale(1); }
        }
        .animate-spotlight {
          animation: spotlight 2s ease .75s 1 forwards;
        }
      `}</style>
    </svg>
  );
}

// ==================== HEXAGON GRID ====================
export function HexagonGrid({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg width="100%" height="100%" className="opacity-10">
        <defs>
          <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
            <polygon
              points="25,0 50,14.4 50,43.4 25,57.7 0,43.4 0,14.4"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-cyan-500"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexagons)" />
      </svg>
    </div>
  );
}

// ==================== CYBER GRID ====================
export function CyberGrid({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 245, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 245, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: 'perspective(500px) rotateX(60deg)',
          transformOrigin: 'center top',
        }}
      />
      <div 
        className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950"
      />
    </div>
  );
}

// ==================== NUMBER TICKER ====================
export function NumberTicker({
  value,
  className = '',
  duration = 1,
}: {
  value: number;
  className?: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  return <span className={className}>{displayValue.toLocaleString()}</span>;
}

// ==================== ORBIT ANIMATION ====================
export function OrbitingCircles({
  children,
  radius = 100,
  duration = 10,
  reverse = false,
  className = '',
}: {
  children: ReactNode;
  radius?: number;
  duration?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={`absolute ${className}`}
      style={{
        width: radius * 2,
        height: radius * 2,
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    >
      <div
        className="absolute"
        style={{
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
        }}
      >
        <motion.div
          animate={{ rotate: reverse ? 360 : -360 }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ==================== BENTO GRID ====================
export function BentoGrid({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid auto-rows-[minmax(180px,_1fr)] gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function BentoCard({
  children,
  className = '',
  colSpan = 1,
  rowSpan = 1,
}: {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
}) {
  return (
    <div
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
      }}
    >
      <SpotlightCard
        className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/50 backdrop-blur-xl p-6 transition-all duration-300 hover:border-cyan-500/50 h-full ${className}`}
      >
        {children}
      </SpotlightCard>
    </div>
  );
}
