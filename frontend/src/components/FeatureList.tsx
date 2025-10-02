import { FaMicrophone } from 'react-icons/fa';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import { MdRocketLaunch } from 'react-icons/md';

export function FeatureList() {
  const features = [
    {
      icon: <FaMicrophone className="w-5 h-5 text-cyan-600" />, // teal/blue
      bg: 'bg-cyan-100',
      text: 'Automatic meeting transcription & analysis',
    },
    {
      icon: <FaWandMagicSparkles className="w-5 h-5 text-indigo-600" />, // indigo
      bg: 'bg-indigo-100',
      text: 'AI-generated action items & summaries',
    },
    {
      icon: <MdRocketLaunch className="w-5 h-5 text-purple-600" />, // purple
      bg: 'bg-purple-100',
      text: 'Intelligent workflow automation',
    },
  ];

  return (
    <ul className='space-y-6'>
      {features.map((f, i) => (
        <li key={i} className='xui-d-flex xui-flex-ai-center gap-3'>
          <div
            className={`xui-d-flex xui-flex-ai-center xui-flex-jc-center px-1 py-2 rounded-lg ${f.bg}`}
          >
            {f.icon}
          </div>
          <span>{f.text}</span>
        </li>
      ))}
    </ul>
  );
}
