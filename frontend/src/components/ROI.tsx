import { TrendingUp, Clock, Target, DollarSign } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ROI() {
  const { isDark } = useTheme();

  const stats = [
    {
      icon: Clock,
      number: '5+',
      label: 'HOURS SAVED WEEKLY',
      description: 'Per knowledge worker',
    },
    {
      icon: Target,
      number: '95%',
      label: 'TASK COMPLETION RATE',
      description: 'Improved follow-through',
    },
    {
      icon: TrendingUp,
      number: '300%',
      label: 'PRODUCTIVITY BOOST',
      description: 'Team efficiency gain',
    },
    {
      icon: DollarSign,
      number: '$50K+',
      label: 'ANNUAL SAVINGS',
      description: 'Per 10-person team',
    },
  ];

  return (
    <section
      className={`py-24 relative overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-black' : 'bg-white'
      }`}
    >
      {/* Animated Background */}
      <div className='absolute inset-0'>
        <div
          className={`absolute inset-0 ${
            isDark
              ? 'bg-gradient-to-br from-cyan-950/20 via-black to-purple-950/20'
              : 'bg-gradient-to-br from-cyan-50/50 via-white to-purple-50/50'
          }`}
        ></div>
        <div
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-radial rounded-full ${
            isDark ? 'from-cyan-500/5 to-transparent' : 'from-cyan-500/10 to-transparent'
          }`}
        ></div>
      </div>

      <div className='container mx-auto px-6 relative z-10'>
        <div className='max-w-5xl mx-auto'>
          {/* Main ROI Container */}
          <div
            className={`relative p-12 rounded-3xl border backdrop-blur-xl ${
              isDark
                ? 'bg-gradient-to-br from-gray-900/50 via-black/80 to-gray-900/50 border-cyan-500/20'
                : 'bg-gradient-to-br from-white/80 via-gray-50/90 to-white/80 border-cyan-500/30'
            }`}
          >
            {/* Glow Effect */}
            <div
              className={`absolute -inset-1 bg-gradient-to-r rounded-3xl blur-xl opacity-50 ${
                isDark
                  ? 'from-cyan-500/20 via-purple-500/20 to-cyan-500/20'
                  : 'from-cyan-500/30 via-purple-500/30 to-cyan-500/30'
              }`}
            ></div>

            <div className='relative'>
              {/* Header */}
              <div className='text-center mb-12'>
                <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full text-green-400 text-sm tracking-wide mb-6'>
                  <span className='w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse'></span>
                  MEASURABLE IMPACT
                </div>
                <h2 className='text-4xl md:text-6xl font-bold mb-6'>
                  <span className='bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent'>
                    QUANTIFIABLE RESULTS
                  </span>
                </h2>
                <p
                  className={`text-xl max-w-3xl mx-auto ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Stop wasting time on manual task creation and follow-ups. Let AI handle the
                  busywork while you focus on what drives real business value.
                </p>
              </div>

              {/* Stats Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className='text-center group'
                    style={{
                      animationDelay: `${index * 150}ms`,
                    }}
                  >
                    {/* Icon */}
                    <div className='w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300'>
                      <stat.icon className='w-8 h-8 text-white' />
                    </div>

                    {/* Number */}
                    <div className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2'>
                      {stat.number}
                    </div>

                    {/* Label */}
                    <div
                      className={`text-sm font-semibold tracking-wide mb-2 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {stat.label}
                    </div>

                    {/* Description */}
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {stat.description}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className='text-center mt-12'>
                <div className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full text-cyan-400 backdrop-blur-sm'>
                  <TrendingUp className='w-5 h-5 mr-2' />
                  <span className='font-semibold tracking-wide'>ROI GUARANTEED IN FIRST MONTH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
