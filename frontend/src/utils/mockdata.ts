import {
  Calendar,
  Monitor,
  Smartphone,
  FolderSync as Sync,
} from 'lucide-react';

export const faqs = [
  {
    question: 'How accurate is the action item extraction?',
    answer:
      'Our AI has been trained specifically for business conversations and achieves 95%+ accuracy in identifying action items, assignees, and deadlines.',
  },
  {
    question: 'Does it work with our existing PM tools?',
    answer:
      'Yes! We integrate seamlessly with ClickUp, Asana, and Monday.com. Tasks appear in your existing projects and workflows.',
  },
  {
    question: 'Is my meeting data secure?',
    answer:
      "Absolutely. All data is encrypted in transit and at rest. We're SOC 2 compliant and never store recordings longer than necessary for processing.",
  },
  {
    question: 'What if I have both virtual and in-person meetings?',
    answer:
      'Qylon handles both! Use our meeting bot for virtual calls and our mobile app for in-person conversations.',
  },
  {
    question: 'Can I customize how tasks are created?',
    answer:
      'Yes, you can set rules for task assignment, project placement, priority levels, and more through our dashboard.',
  },
];

export const captureMethods = [
  {
    number: '1',
    icon: Monitor,
    title: 'Silent Desktop Recording',
    description:
      'System-level audio capture from your computer. No visible bots, no announcements. Works with any app—Zoom, Teams, phone calls, even local recordings.',
    highlight: true,
  },
  {
    number: '2',
    icon: Smartphone,
    title: 'Mobile Conversations',
    description:
      'Capture in-person meetings, brainstorming sessions, client calls, and networking events with our mobile app. High-quality audio with offline processing.',
  },
  {
    number: '3',
    icon: Calendar,
    title: 'Calendar Integration',
    description:
      'Automatically detect meetings from your calendar and set up recording. Pre-meeting preparation and post-meeting intelligence extraction.',
  },
  {
    number: '4',
    icon: Sync,
    title: 'Optional Meeting Bots',
    description:
      "For teams that prefer traditional bots, we support all major platforms. But unlike other tools, you're not limited to just this method.",
  },
];
