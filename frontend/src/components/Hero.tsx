import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Icon from './icons/Icon';

const Hero: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email: email.toLowerCase().trim(), source: 'hero' }]);

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation
          setSubmitMessage('This email is already on our waitlist!');
        } else {
          throw error;
        }
      } else {
        setSubmitMessage(
          "🎉 Welcome to the future! You'll be among the first to experience AI-powered meeting automation.",
        );

        // Send welcome email
        try {
          const emailResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                email: email.toLowerCase().trim(),
                source: 'hero',
              }),
            },
          );

          if (emailResponse.ok) {
            console.log('Welcome email sent successfully');
          } else {
            console.error('Failed to send welcome email');
          }
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
        }
      }
      setEmail('');
    } catch (error) {
      console.error('Error submitting to waitlist:', error);
      setSubmitMessage('Something went wrong. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className='relative min-h-screen flex items-center justify-center overflow-hidden pt-20'>
      {/* Liquid Background */}
      <div className='liquid-bg'>
        <div className='absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900'></div>

        {/* Animated liquid orbs */}
        <div
          className='liquid-orb w-96 h-96 bg-gradient-to-r from-pink-500 to-violet-600'
          style={{
            top: '10%',
            left: '10%',
            animation: 'liquidFlow 20s ease-in-out infinite',
          }}
        ></div>
        <div
          className='liquid-orb w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-500'
          style={{
            top: '60%',
            right: '10%',
            animation: 'liquidPulse 15s ease-in-out infinite reverse',
          }}
        ></div>
        <div
          className='liquid-orb w-64 h-64 bg-gradient-to-r from-orange-400 to-pink-500'
          style={{
            bottom: '20%',
            left: '50%',
            animation: 'liquidDrift 25s linear infinite',
          }}
        ></div>
        <div
          className='liquid-orb w-72 h-72 bg-gradient-to-r from-purple-500 to-indigo-600'
          style={{
            top: '30%',
            right: '40%',
            animation: 'liquidFlow 18s ease-in-out infinite reverse',
          }}
        ></div>
      </div>

      <div className='container mx-auto px-6 text-center relative z-10'>
        <div className='max-w-4xl mx-auto'>
          {/* Badge */}
          <div className='mb-8 inline-flex items-center px-6 py-3 glass rounded-full text-white text-sm font-medium tracking-wide'>
            <span className='w-2 h-2 bg-gradient-to-r from-cyan-300 to-pink-300 rounded-full mr-3 animate-pulse'></span>
            AI-Powered Meeting Automation
          </div>

          {/* Main Headline */}
          <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight'>
            <span className='block text-white drop-shadow-lg'>Transform Conversations Into</span>
            <span className='block bg-gradient-to-r from-cyan-300 via-pink-300 to-violet-300 bg-clip-text text-transparent drop-shadow-lg'>
              Completed Tasks
            </span>
          </h1>

          {/* Subheadline */}
          <p className='text-lg sm:text-xl md:text-2xl mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed text-white/80 drop-shadow-sm'>
            The era of meeting bots is over. Qylon captures every conversation and delivers action
            items straight into <span className='text-cyan-300 font-semibold'>ClickUp</span>,{' '}
            <span className='text-cyan-300 font-semibold'>Asana</span>, or{' '}
            <span className='text-cyan-300 font-semibold'>Monday</span>.
          </p>

          {/* Primary CTA Buttons */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 md:mb-12'>
            <a
              href='/signup'
              className='px-8 py-4 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 text-white font-semibold rounded-2xl hover:scale-105 transition-all duration-200 inline-flex items-center gap-2 shadow-lg text-lg'
            >
              Get Started Free
              <Icon name="arrowRight" size={20} />
            </a>
            <a
              href='/login'
              className='px-8 py-4 glass text-white font-semibold rounded-2xl hover:scale-105 transition-all duration-200 inline-flex items-center gap-2 text-lg'
            >
              Sign In
              <Icon name="arrowRight" size={20} />
            </a>
          </div>

          {/* Waitlist Form */}
          <div id='waitlist' className='max-w-md mx-auto mb-8 md:mb-12 px-4'>
            <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
              <div className='relative flex-1'>
                <Icon name="mail" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                <input
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder='Enter your email'
                  disabled={isSubmitting}
                  className='w-full pl-12 pr-4 py-3 md:py-4 glass rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 text-base text-white placeholder-white/60 bg-white/10'
                  required
                />
              </div>
              <button
                type='submit'
                disabled={isSubmitting}
                className={`px-6 sm:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 text-white font-medium rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 group text-base shadow-lg ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
              >
                {isSubmitting ? 'Joining...' : 'Join waitlist'}
                {!isSubmitting && (
                  <Icon name="arrowRight" size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
                )}
              </button>
            </form>

            {/* Submit Message */}
            {submitMessage && (
              <div
                className={`mt-4 p-3 rounded-lg text-center text-sm ${submitMessage.includes('🎉')
                    ? 'glass-heavy text-emerald-200 border-emerald-300/30'
                    : submitMessage.includes('already')
                      ? 'glass-heavy text-amber-200 border-amber-300/30'
                      : 'glass-heavy text-red-200 border-red-300/30'
                  }`}
              >
                {submitMessage}
              </div>
            )}
          </div>

          {/* Social Proof */}
          <div className='flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-white/70'>
            <div className='flex items-center space-x-2'>
              <div className='flex -space-x-2'>
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className='w-8 h-8 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full border-2 border-white/20'
                  ></div>
                ))}
              </div>
              <span className='text-sm'>50+ early adopters</span>
            </div>
            <div className='hidden sm:block h-4 w-px bg-white/30'></div>
            <div className='text-sm'>
              <span className='text-cyan-300 font-semibold'>95%+ accuracy</span> in task extraction
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
