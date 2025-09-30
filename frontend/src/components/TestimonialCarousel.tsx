"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote:
      "Qylon transformed our meeting efficiency by 300%. What used to take hours of manual work now happens automatically in minutes.",
    name: "Sarah Chen",
    role: "VP of Operations at TechFlow",
  },
  {
    quote:
      "Thanks to Qylon, our team saves 10+ hours every week. The AI summaries are spot on and incredibly useful.",
    name: "David Lee",
    role: "Head of Product at InnovateX",
  },
  {
    quote:
      "Finally, a tool that turns meetings into something actionable. Our productivity has skyrocketed.",
    name: "Maria Gonzalez",
    role: "Project Manager at BrightWorks",
  },
];

export function TestimonialCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const testimonial = testimonials[index];

  return (
    <div className="max-w-lg text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-6xl font-serif leading-none">“</span>
          <p className="text-lg md:text-xl font-medium mb-6">
            {testimonial.quote}
          </p>
          <p className="font-semibold">{testimonial.name}</p>
          <p className="text-sm opacity-80">{testimonial.role}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
