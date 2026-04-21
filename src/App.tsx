/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import { 
  Camera, 
  ChefHat, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  Menu, 
  X,
  ChevronRight,
  Quote
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Motion Components ---

const Magnetic: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150, mass: 1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.35);
    y.set(middleY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const Float: React.FC<{ children: React.ReactNode; speed?: number; range?: number }> = ({ 
  children, 
  speed = 4, 
  range = 15 
}) => {
  return (
    <motion.div
      animate={{
        y: [0, -range, 0],
        rotate: [0, 1, 0, -1, 0],
      }}
      transition={{
        duration: speed,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
};

const TextReveal: React.FC<{ children: string; className?: string }> = ({ children, className }) => {
  const words = children.split(' ');
  
  return (
    <div className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden mr-3">
          <motion.span
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.8, 
              delay: i * 0.05, 
              ease: [0.215, 0.61, 0.355, 1] 
            }}
            className="inline-block"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  );
};

// --- Components ---

interface PolaroidProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  rotation?: number;
  delay?: number;
}

const Polaroid: React.FC<PolaroidProps> = ({ 
  src, 
  alt, 
  caption, 
  className, 
  rotation = 0,
  delay = 0 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.8, rotate: rotation - 5 }}
      whileInView={{ opacity: 1, scale: 1, rotate: rotation }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, type: 'spring' }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      className={cn(
        "bg-white p-3 pb-10 editorial-shadow inline-block relative border border-black/5 cursor-crosshair",
        className
      )}
    >
      <div className="tape-effect" />
      <div className="overflow-hidden aspect-square pointer-events-none">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          referrerPolicy="no-referrer"
        />
      </div>
      {caption && (
        <p className="mt-4 font-serif text-center text-xs italic text-brand-ink/70 tracking-tight pointer-events-none">
          {caption}
        </p>
      )}
    </motion.div>
  );
};

const SectionHeading = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-14 text-center">
    <div className="bg-brand-rose w-12 h-1 mb-6 mx-auto" />
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-5xl font-serif mb-6 leading-tight"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-brand-ink/70 max-w-2xl mx-auto leading-relaxed"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

// --- Main App ---

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Portfolio', href: '#gallery' },
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen relative">
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-rose origin-left z-[100]"
        style={{ scaleX }}
      />
      <div className="paper-texture fixed inset-0 z-0 pointer-events-none" />
      
      {/* Floating Background Shapes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-[40vw] h-[40vw] bg-brand-sand/5 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 -right-20 w-[30vw] h-[30vw] bg-brand-rose/5 rounded-full blur-[100px]" 
        />
      </div>
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-50 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-brand-ink/40 mb-1">Boutique Event Design</span>
            <a href="#" className="font-serif text-3xl font-bold tracking-tight text-brand-ink leading-none">
              JAM <span className="text-brand-rose font-light tracking-normal">C&E</span>
            </a>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10 text-[11px] uppercase tracking-[0.2em] font-bold text-brand-ink/80">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="hover:text-brand-brown transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-brand-ink"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-brand-offwhite border-b border-brand-sand overflow-hidden mt-4 rounded-xl editorial-shadow"
            >
              <div className="px-6 py-8 flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-serif"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-40 overflow-hidden min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12 items-center relative z-10 w-full">
          <div className="md:col-span-5 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: 48 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-brand-rose h-1 mb-8" 
              />
              <h1 className="text-5xl md:text-6xl font-serif leading-[1.1] mb-8 text-brand-ink overflow-hidden">
                Crafting <span className="italic text-brand-brown">Memorable</span> Events, One Detail at a Time
              </h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-lg text-brand-ink/80 max-w-lg leading-relaxed"
              >
                Creative catering and event styling tailored to your unique vision, turning simple moments into lasting memories.
              </motion.p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <Magnetic>
                <button className="bg-brand-brown text-brand-offwhite px-10 py-4 rounded-[2px] text-xs font-bold uppercase tracking-widest hover:bg-brand-ink transition-all transform hover:-translate-y-0.5">
                  Book Your Event
                </button>
              </Magnetic>
              
              <div className="hidden sm:flex items-center space-x-12 pl-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-1">Contact</span>
                  <span className="text-xs font-medium italic">hello@jamcreative.com</span>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-1">Studio</span>
                  <span className="text-xs font-medium italic">New York, NY</span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="md:col-span-7 relative h-[500px] md:h-[600px]">
            <Float speed={5} range={20}>
              <Polaroid 
                src="https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&q=80" 
                alt="Table setting" 
                caption="Summer Soiree 2023"
                rotation={3}
                className="absolute top-0 right-4 w-64 md:w-72"
              />
            </Float>
            <Float speed={6} range={15}>
              <Polaroid 
                src="https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80" 
                alt="Creative Catering" 
                caption="Catering Concepts"
                rotation={-6}
                delay={0.2}
                className="absolute top-24 right-40 md:right-56 w-60 md:w-64 z-20"
              />
            </Float>
            <Float speed={4} range={10}>
              <Polaroid 
                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80" 
                alt="Event Decor" 
                caption="Grand Opening Gala"
                rotation={1}
                delay={0.4}
                className="absolute bottom-10 right-8 w-56 md:w-60 z-10"
              />
            </Float>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 1 }}
              viewport={{ once: true }}
              className="absolute -bottom-10 left-0 hidden xl:block"
            >
              <div className="bg-white/60 backdrop-blur-md p-8 border border-white max-w-[280px] editorial-shadow rounded-sm text-brand-ink">
                <p className="font-serif text-sm italic mb-4 leading-relaxed">
                  "The team at Jam turned our garden party into a dreamscape. Every detail was perfection."
                </p>
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-[1px] bg-brand-ink/20" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">Eleanor Vance</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-8 left-12 flex space-x-4 items-center z-10">
          <div className="w-12 h-[1px] bg-brand-ink/20"></div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-ink/40">Est. 2018</span>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-white/30 border-y border-brand-sand relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-20 items-center">
          <div className="grid grid-cols-2 gap-6 relative">
            <div className="p-4 bg-brand-sand/20 absolute -inset-4 rotate-2 rounded-3xl pointer-events-none" />
            <Polaroid 
              src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80" 
              alt="Team" 
              rotation={-2}
              className="mt-16 w-full"
            />
            <Polaroid 
              src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80" 
              alt="Venue" 
              rotation={4}
              className="w-full"
            />
          </div>
          <div className="space-y-10">
            <div className="flex items-center space-x-4">
              <span className="w-8 h-[1px] bg-brand-rose" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-ink/50">Our Story</span>
            </div>
            <h2 className="text-5xl font-serif leading-[1.1]">Elevating Every <br /><span className="italic opacity-60">Interaction</span>.</h2>
            <div className="space-y-6 text-brand-ink/80 text-lg leading-relaxed max-w-lg">
              <p>
                Founded on the belief that every event tells a story, Jam Creative is more than just a catering company. We are curators of experience.
              </p>
              <p>
                Blends culinary excellence with visionary styling to create events that are as beautiful as they are delicious.
              </p>
            </div>
            <div className="pt-10 grid grid-cols-2 gap-12 border-t border-brand-sand">
              <div>
                <p className="text-4xl font-serif text-brand-ink">150+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-brand-ink/40">Events Styled</p>
              </div>
              <div>
                <p className="text-4xl font-serif text-brand-ink">10k</p>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-brand-ink/40">Guests Served</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <SectionHeading 
            title="Our Capabilities" 
            subtitle="From conceptual design to flawless execution, we manage every layer." 
          />
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Event Styling",
                description: "Transformative visual concepts and thematic decor that leave a lasting impression.",
                id: "01",
                image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80"
              },
              {
                title: "Craft Catering",
                description: "Gourmet culinary experiences with custom menus that reflect your event's personality.",
                id: "02",
                image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80"
              },
              {
                title: "Full Coordination",
                description: "Stress-free coordination from the first mood board to the final toast.",
                id: "03",
                image: "https://images.unsplash.com/photo-1519222970733-f546218fa6d7?w=800&q=80"
              }
            ].map((service, index) => (
              <motion.div 
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group space-y-8 cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-sm editorial-shadow relative p-4 bg-white border border-black/5">
                   <div className="w-full h-full overflow-hidden bg-brand-sand/20">
                    <motion.img 
                      src={service.image} 
                      alt={service.title} 
                      whileHover={{ scale: 1.1, rotate: 1 }}
                      className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                   </div>
                   <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-4 bg-brand-ink/10 pointer-events-none" 
                   />
                </div>
                <div className="flex space-x-6">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="text-3xl font-serif text-brand-ink/20"
                  >
                    {service.id}
                  </motion.div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold uppercase tracking-widest text-brand-ink group-hover:text-brand-brown transition-colors">{service.title}</h3>
                    <p className="text-brand-ink/60 leading-relaxed text-sm">
                      {service.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery / Portfolio Section */}
      <section id="gallery" className="py-32 bg-black text-brand-offwhite overflow-hidden relative">
        <div className="absolute inset-0 bg-brand-ink/40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-20 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                className="bg-brand-rose h-1 mb-6" 
              />
              <h2 className="text-5xl font-serif">Visual Anthology</h2>
            </div>
            <Magnetic>
              <button className="text-white text-xs font-bold uppercase tracking-[0.2em] border-b border-white/40 pb-2 hover:border-white transition-all">
                Discover Full Archive
              </button>
            </Magnetic>
          </div>
        </div>

        <motion.div 
          drag="x"
          dragConstraints={{ left: -1000, right: 0 }}
          className="flex space-x-12 px-6 md:px-12 pb-20 relative z-10 cursor-grab active:cursor-grabbing w-max"
        >
          {[
            { img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80", rot: 2, label: "Engagement Soiree" },
            { img: "https://images.unsplash.com/photo-1541140134513-85a161dc4a00?w=800&q=80", rot: -3, label: "Botanical Design" },
            { img: "https://images.unsplash.com/photo-1470753937643-efad93c239fa?w=800&q=80", rot: 4, label: "Gallery Opening" },
            { img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80", rot: -1, label: "Golden Hour" },
            { img: "https://images.unsplash.com/photo-1513271922710-31ec3be9700b?w=800&q=80", rot: 5, label: "Rustic Reception" },
            { img: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&q=80", rot: -2, label: "Coastal Event" },
          ].map((item, i) => (
            <Polaroid 
              key={i}
              src={item.img}
              alt={item.label}
              caption={item.label}
              rotation={item.rot}
              className="flex-shrink-0 w-80 !bg-white/95"
              delay={i * 0.1}
            />
          ))}
        </motion.div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center space-x-4 opacity-40 pointer-events-none z-10">
           <span className="text-[10px] uppercase tracking-widest font-bold">Drag to explore</span>
           <div className="w-12 h-[1px] bg-white"></div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 relative">
         <div className="paper-texture absolute inset-0 z-0 opacity-10" />
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Quote className="mx-auto w-10 h-10 text-brand-rose/40 mb-10" />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <p className="text-3xl md:text-5xl font-serif italic text-brand-ink leading-tight">
              "The team at Jam turned our garden party into a dreamscape. Every detail was perfection."
            </p>
            <div className="flex flex-col items-center">
              <span className="w-12 h-[1px] bg-brand-ink/20 mb-4" />
              <p className="font-bold tracking-[0.3em] uppercase text-[10px]">Eleanor Vance</p>
              <p className="text-brand-ink/40 text-[10px] uppercase mt-2 tracking-widest">Client, 2023</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 border-t border-brand-sand">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-20">
          <div className="space-y-16">
            <div className="space-y-8">
              <div className="bg-brand-rose w-12 h-1" />
              <h2 className="text-5xl md:text-6xl font-serif leading-tight">Let's Plan Your Vision.</h2>
              <p className="text-lg text-brand-ink/70 leading-relaxed max-w-md">
                We'd love to hear about your event and explore how we can make it extraordinary.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-12 pb-12 border-b border-brand-sand">
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">Email Inquiry</span>
                <p className="font-serif italic text-lg text-brand-ink">hello@jamcreative.com</p>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">Studio Visit</span>
                <p className="font-serif italic text-lg text-brand-ink">New York, NY</p>
              </div>
            </div>

            <div className="flex items-center space-x-12">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-ink/40 mb-3">Connect</span>
                <div className="flex space-x-6 text-brand-ink/60">
                   <a href="#" className="hover:text-brand-brown transition-colors">Instagram</a>
                   <a href="#" className="hover:text-brand-brown transition-colors">Pinterest</a>
                </div>
              </div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 md:p-14 rounded-sm editorial-shadow border border-black/5"
          >
            <form className="space-y-8">
              <div className="space-y-8">
                <div className="space-y-2 border-b border-brand-sand pb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Eleanor Vance" 
                    className="w-full bg-transparent px-0 py-2 focus:outline-none placeholder:text-brand-ink/20 font-serif italic text-lg text-brand-ink"
                  />
                </div>
                <div className="space-y-2 border-b border-brand-sand pb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="eleanor@example.com" 
                    className="w-full bg-transparent px-0 py-2 focus:outline-none placeholder:text-brand-ink/20 font-serif italic text-lg text-brand-ink"
                  />
                </div>
                <div className="space-y-2 border-b border-brand-sand pb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-brand-ink/40">Event Concept</label>
                  <textarea 
                    rows={3} 
                    placeholder="Tell us about your heart's desire..." 
                    className="w-full bg-transparent px-0 py-2 focus:outline-none placeholder:text-brand-ink/20 font-serif italic text-lg resize-none text-brand-ink"
                  ></textarea>
                </div>
              </div>
              <button className="w-full bg-brand-brown text-white py-5 rounded-[2px] font-bold uppercase tracking-widest text-xs hover:bg-brand-ink transition-all shadow-md">
                Initiate Planning
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-offwhite py-24 border-t border-brand-sand relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-8">
              <a href="#" className="font-serif text-3xl font-bold tracking-tight text-brand-ink">
                Jam Creative
              </a>
              <p className="text-brand-ink/60 max-w-xs text-sm leading-relaxed italic">
                Curation of bespoke moments through culinary excellence and visionary styling.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Navigation</h4>
                <ul className="space-y-3 text-xs font-bold uppercase tracking-widest">
                  <li><a href="#gallery" className="hover:text-brand-brown transition-colors">Portfolio</a></li>
                  <li><a href="#about" className="hover:text-brand-brown transition-colors">About</a></li>
                  <li><a href="#services" className="hover:text-brand-brown transition-colors">Services</a></li>
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">Contact</h4>
                <p className="text-xs font-bold uppercase tracking-widest">hello@jamcreative.com</p>
                <div className="flex space-x-4 grayscale opacity-60">
                   <Instagram className="w-4 h-4" />
                   <Facebook className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-24 pt-8 border-t border-brand-sand flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">
              © 2024 Jam Creative. All rights reserved.
            </p>
            <div className="flex space-x-8 text-[10px] uppercase tracking-[0.2em] font-bold opacity-30">
              <a href="#" className="hover:opacity-100">Privacy</a>
              <a href="#" className="hover:opacity-100">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
