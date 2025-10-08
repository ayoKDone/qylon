import { ArrowRight, Mail, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const FinalCTA: React.FC = () => {
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
        .insert([{ email: email.toLowerCase().trim(), source: 'final-cta' }]);

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation
          setSubmitMessage('This email is already on our waitlist!');
        } else {
          throw error;
        }
      } else {
        setSubmitMessage(
          "🚀 You're in! Welcome to our priority waitlist. You'll receive exclusive early access when we launch!",
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
                source: 'final-cta',
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
    <section className='py-24 relative overflow-hidden'>
      {/* Liquid Background */}
      <div className='absolute inset-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-violet-900 via-pink-900 to-orange-900'></div>

        {/* Animated liquid orbs */}
        <div
          className='liquid-orb w-[600px] h-[600px] bg-gradient-to-r from-cyan-400 to-blue-600'
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'liquidPulse 15s ease-in-out infinite',
          }}
        ></div>
        <div
          className='liquid-orb w-80 h-80 bg-gradient-to-r from-pink-500 to-violet-600'
          style={{
            top: '10%',
            right: '10%',
            animation: 'liquidDrift 20s linear infinite',
          }}
        ></div>
        <div
          className='liquid-orb w-72 h-72 bg-gradient-to-r from-orange-400 to-pink-500'
          style={{
            bottom: '10%',
            left: '10%',
            animation: 'liquidFlow 22s ease-in-out infinite reverse',
          }}
        ></div>
      </div>

      <div className='container mx-auto px-6 relative z-10'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Header */}
          <div className='mb-12'>
            <div className='inline-flex items-center px-6 py-3 glass rounded-full text-white text-sm tracking-wide mb-8'>
              <Sparkles className='w-4 h-4 mr-2 animate-spin' />
              THE FUTURE IS NOW
            </div>

            <h2 className='text-3xl sm:text-4xl md:text-6xl font-bold mb-6 leading-tight px-4'>
              <span className='block text-white drop-shadow-lg'>READY TO REVOLUTIONIZE</span>
              <br />
              <span className='block bg-gradient-to-r from-cyan-300 via-pink-300 to-violet-300 bg-clip-text text-transparent drop-shadow-lg'>
                YOUR MEETINGS?
              </span>
            </h2>

            <p className='text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed px-4 text-white/80 drop-shadow-sm'>
              Join <span className='text-cyan-300 font-semibold'>50+</span> forward-thinking
              professionals who are already transforming their productivity with AI-powered meeting
              automation.
            </p>
          </div>

          {/* Enhanced Waitlist Form */}
          <div className='max-w-lg mx-auto mb-8 md:mb-12 px-4'>
            <form onSubmit={handleSubmit} className='relative'>
              <div className='relative group glass-heavy rounded-3xl p-3'>
                <div className='absolute -inset-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300'></div>
                <div className='relative flex flex-col sm:flex-row gap-3 md:gap-4'>
                  <div className='relative flex-1'>
                    <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60' />
                    <input
                      type='email'
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={
                        window.innerWidth < 640
                          ? 'Enter email'
                          : 'Enter your email for priority access'
                      }
                      disabled={isSubmitting}
                      className={`w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 text-base text-white placeholder-white/60 ${
                        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      required
                    />
                  </div>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className={`px-6 md:px-8 py-4 bg-gradient-to-r from-cyan-400 via-pink-500 to-violet-600 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 group whitespace-nowrap text-base shadow-lg ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {isSubmitting
                      ? 'JOINING...'
                      : window.innerWidth < 640
                        ? 'JOIN'
                        : 'GET EARLY ACCESS'}
                    {!isSubmitting && (
                      <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-200' />
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Submit Message */}
            {submitMessage && (
              <div
                className={`mt-6 p-4 rounded-xl text-center ${
                  submitMessage.includes('🚀')
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

          {/* Benefits List */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto mb-8 md:mb-12 px-4'>
            {[
              { icon: '⚡', text: 'Instant AI Processing' },
              { icon: '🔒', text: 'Enterprise Security' },
              { icon: '🚀', text: 'Priority Support' },
            ].map((benefit, index) => (
              <div
                key={index}
                className='flex items-center justify-center space-x-3 p-4 glass rounded-2xl transition-all duration-300 hover:scale-105'
              >
                <span className='text-xl md:text-2xl'>{benefit.icon}</span>
                <span className='font-medium text-sm md:text-base text-white/90'>
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className='flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 md:space-x-8 text-xs md:text-sm px-4 text-white/70'>
            <div className='flex items-center space-x-2'>
              <div className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></div>
              <span>No spam, unsubscribe anytime</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-2 h-2 bg-cyan-400 rounded-full animate-pulse'></div>
              <span>Launch expected Q4 2025</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-2 h-2 bg-violet-400 rounded-full animate-pulse'></div>
              <span>Early bird pricing available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
