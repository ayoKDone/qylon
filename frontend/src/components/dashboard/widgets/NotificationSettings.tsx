import { useState } from 'react';

type NotificationCategory =
  | 'emailMeetingRecordings'
  | 'emailActionItems'
  | 'emailWorkflowCompletions'
  | 'emailWeeklySummaries'
  | 'pushMeetingUpdates'
  | 'pushTaskReminders'
  | 'pushSystemAlerts'
  | 'smsCriticalAlerts';

type Frequency = 'immediate' | 'daily' | 'weekly' | 'never';

interface NotificationState {
  emailMeetingRecordings: boolean;
  emailActionItems: boolean;
  emailWorkflowCompletions: boolean;
  emailWeeklySummaries: boolean;
  pushMeetingUpdates: boolean;
  pushTaskReminders: boolean;
  pushSystemAlerts: boolean;
  smsCriticalAlerts: boolean;
  frequency: Frequency;
}

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState<NotificationState>({
    emailMeetingRecordings: true,
    emailActionItems: true,
    emailWorkflowCompletions: false,
    emailWeeklySummaries: true,
    pushMeetingUpdates: true,
    pushTaskReminders: true,
    pushSystemAlerts: false,
    smsCriticalAlerts: false,
    frequency: 'immediate',
  });

  const toggleNotification = (key: NotificationCategory) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const setFrequency = (value: Frequency) => {
    setNotifications(prev => ({
      ...prev,
      frequency: value,
    }));
  };

  const sections = [
    {
      title: 'Email Notifications',
      items: [
        {
          id: 'emailMeetingRecordings' as const,
          title: 'Meeting recordings ready',
          description:
            'Get notified when your meeting recordings are available.',
        },
        {
          id: 'emailActionItems' as const,
          title: 'Action items assigned',
          description: 'Receive an email when tasks are assigned to you.',
        },
        {
          id: 'emailWorkflowCompletions' as const,
          title: 'Workflow completions',
          description: 'Be alerted when automated workflows complete.',
        },
        {
          id: 'emailWeeklySummaries' as const,
          title: 'Weekly summaries',
          description: 'Weekly email summary of your team’s activities.',
        },
      ],
    },
    {
      title: 'Push Notifications',
      items: [
        {
          id: 'pushMeetingUpdates' as const,
          title: 'Real-time meeting updates',
          description: 'Receive live updates during ongoing meetings.',
        },
        {
          id: 'pushTaskReminders' as const,
          title: 'Task reminders',
          description: 'Push alerts for upcoming or overdue tasks.',
        },
        {
          id: 'pushSystemAlerts' as const,
          title: 'System alerts',
          description: 'Be notified of important system announcements.',
        },
      ],
    },
    {
      title: 'SMS Notifications',
      items: [
        {
          id: 'smsCriticalAlerts' as const,
          title: 'Critical alerts only',
          description:
            'Receive SMS messages for urgent or security-related events.',
        },
      ],
    },
  ];

  const frequencies: { value: Frequency; label: string }[] = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'daily', label: 'Daily digest' },
    { value: 'weekly', label: 'Weekly summary' },
    { value: 'never', label: 'Never' },
  ];

  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-600">
          Manage your email, push, and SMS notification preferences.
        </p>
      </div>

      {/* Notification Categories */}
      {sections.map(section => (
        <div key={section.title} className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">
            {section.title}
          </h3>
          <div className="space-y-3">
            {section.items.map(item => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between rounded-lg border border-gray-200"
              >
                <div className="flex-1">
                  <h4 className="text-base font-medium text-gray-900">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={() => toggleNotification(item.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications[item.id] ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  role="switch"
                  aria-checked={notifications[item.id]}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications[item.id] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Frequency Settings (Dropdown) */}
      <div className="mt-6 xui-d-flex xui-flex-jc-space-between">
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-3">
            Frequency Settings
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Choose how often you want to receive notifications.
          </p>
        </div>
        <div className="xui-form-box">
          <select
            value={notifications.frequency}
            onChange={e => setFrequency(e.target.value as Frequency)}
            className="block w-full max-w-sm rounded-md border border-gray-300 bg-white p-2 text-gray-700 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            {frequencies.map(f => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
