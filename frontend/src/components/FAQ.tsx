import {
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import React, { useState } from 'react';
import { captureMethods, faqs } from '../utils/mockdata';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Liquid Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900"></div>

        {/* Animated liquid orbs */}
        <div
          className="liquid-orb w-96 h-96 bg-gradient-to-r from-pink-500 to-orange-500"
          style={{
            top: '10%',
            right: '20%',
            animation: 'liquidFlow 25s ease-in-out infinite',
          }}
        ></div>
        <div
          className="liquid-orb w-72 h-72 bg-gradient-to-r from-cyan-400 to-purple-500"
          style={{
            bottom: '20%',
            left: '10%',
            animation: 'liquidPulse 18s ease-in-out infinite reverse',
          }}
        ></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Capture Methods Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 glass rounded-full text-white text-sm tracking-wide mb-6">
              <span className="w-2 h-2 bg-gradient-to-r from-cyan-300 to-pink-300 rounded-full mr-3 animate-pulse"></span>
              MULTIPLE CAPTURE METHODS
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 px-4">
              <span className="text-white drop-shadow-lg">
                CAPTURE CONVERSATIONS
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-pink-300 to-violet-300 bg-clip-text text-transparent drop-shadow-lg">
                EVERYWHERE YOU WORK
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto px-4">
            {captureMethods.map((method, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-3xl transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                  method.highlight ? 'glass-heavy border-cyan-300/30' : 'glass'
                }`}
              >
                {method.highlight && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="px-3 py-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 text-white text-xs font-semibold rounded-full whitespace-nowrap shadow-lg">
                      PRIMARY METHOD
                    </div>
                  </div>
                )}

                {/* Number Badge */}
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {method.number}
                </div>

                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <method.icon className="w-5 md:w-6 h-5 md:h-6 text-white" />
                </div>

                <h3 className="text-base md:text-lg font-bold mb-3 text-white drop-shadow-sm">
                  {method.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/80">
                  {method.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 glass rounded-full text-white text-sm tracking-wide mb-6">
              <span className="w-2 h-2 bg-gradient-to-r from-purple-300 to-cyan-300 rounded-full mr-3 animate-pulse"></span>
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="text-white drop-shadow-lg">GOT QUESTIONS?</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="glass-heavy rounded-3xl transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-4 md:p-6 text-left flex items-center justify-between focus:outline-none"
                >
                  <h3 className="text-base md:text-lg font-semibold pr-4 text-white drop-shadow-sm">
                    {faq.question}
                  </h3>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0 text-cyan-300" />
                  ) : (
                    <ChevronDown className="w-5 h-5 flex-shrink-0 text-white/60" />
                  )}
                </button>

                {openIndex === index && (
                  <div className="px-4 md:px-6 pb-4 md:pb-6">
                    <div className="h-px bg-gradient-to-r from-cyan-300/30 to-purple-300/30 mb-4"></div>
                    <p className="text-sm md:text-base leading-relaxed text-white/80">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
