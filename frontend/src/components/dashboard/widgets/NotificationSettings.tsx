import { useState } from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

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
  const [phone, setPhone] = useState('');
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
          description: 'Get notified when your meeting recordings are available.',
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
          description: 'Receive SMS messages for urgent or security-related events.',
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
    <>
    <section className='xui-p-1 xui-bdr-rad-half xui-bdr-w-1 xui-bdr-s-solid xui-bdr-fade xui-mt-1'>
      <div className='xui-d-flex xui-flex-ai-center xui-grid-gap-1'>
        <div className='w-[48px] h-[48px] xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center xui-bg-light-blue-1 xui-bdr-rad-half'>

        </div>
        <div>
          <h3 className='xui-font-w-500 text-[16px]'>Email Notifications</h3>
          <span className='xui-opacity-6 text-[14px]'>Receive updates via email</span>
        </div>
      </div>
      <div className='xui-mt-2 xui-d-grid xui-grid-col-1 xui-grid-gap-2'>
        <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
          <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
            <p className='xui-opacity-8 text-[15px]'>Meeting Recordings Ready</p>
            <span className='xui-opacity-6 text-[14px]'>Get notified when your meeting recordings are processed</span>
          </div>
          <div className="xui-toggle-switch">
            <input type="checkbox" id="toggle" />
            <div className="slider"></div>
          </div>
        </div>
        <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
          <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
            <p className='xui-opacity-8 text-[15px]'>Action Items Assigned</p>
            <span className='xui-opacity-6 text-[14px]'>Receive notifications when tasks are assigned to you</span>
          </div>
          <div className="xui-toggle-switch">
            <input type="checkbox" id="toggle" />
            <div className="slider"></div>
          </div>
        </div>
        <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
          <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
            <p className='xui-opacity-8 text-[15px]'>Workflow Completions</p>
            <span className='xui-opacity-6 text-[14px]'>Get notified when automated workflows complete</span>
          </div>
          <div className="xui-toggle-switch">
            <input type="checkbox" id="toggle" />
            <div className="slider"></div>
          </div>
        </div>
        <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
          <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
            <p className='xui-opacity-8 text-[15px]'>Weekly Summaries</p>
            <span className='xui-opacity-6 text-[14px]'>Receive a weekly digest of your activity</span>
          </div>
          <div className="xui-toggle-switch">
            <input type="checkbox" id="toggle" />
            <div className="slider"></div>
          </div>
        </div>
      </div>
    </section>
    <section className='xui-p-1 xui-bdr-rad-half xui-bdr-w-1 xui-bdr-s-solid xui-bdr-fade xui-mt-1'>
      <div className='xui-d-flex xui-flex-ai-center xui-grid-gap-1'>
        <div className='w-[48px] h-[48px] xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center xui-bg-light-blue-1 xui-bdr-rad-half'>

        </div>
        <div>
          <h3 className='xui-font-w-500 text-[16px]'>Push Notifications</h3>
          <span className='xui-opacity-6 text-[14px]'>Get instant browser notifications</span>
        </div>
      </div>
      <div className='xui-mt-2 xui-d-grid xui-grid-col-1 xui-grid-gap-2'>
        <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
          <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
            <p className='xui-opacity-8 text-[15px]'>Real-time Meeting Updates</p>
            <span className='xui-opacity-6 text-[14px]'>Live updates during active meetings</span>
          </div>
          <div className="xui-toggle-switch">
            <input type="checkbox" id="toggle" />
            <div className="slider"></div>
          </div>
        </div>
        <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
          <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
            <p className='xui-opacity-8 text-[15px]'>Task Reminders</p>
            <span className='xui-opacity-6 text-[14px]'>Reminders for upcoming task deadlines</span>
          </div>
          <div className="xui-toggle-switch">
            <input type="checkbox" id="toggle" />
            <div className="slider"></div>
          </div>
        </div>
        <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
          <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
            <p className='xui-opacity-8 text-[15px]'>System Alerts</p>
            <span className='xui-opacity-6 text-[14px]'>Important system notifications and updates</span>
          </div>
          <div className="xui-toggle-switch">
            <input type="checkbox" id="toggle" />
            <div className="slider"></div>
          </div>
        </div>
      </div>
    </section>
    <section className='xui-p-1 xui-bdr-rad-half xui-bdr-w-1 xui-bdr-s-solid xui-bdr-fade xui-mt-1'>
      <div className='xui-d-flex xui-flex-ai-center xui-grid-gap-1'>
        <div className='w-[48px] h-[48px] xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center xui-bg-light-green-1 xui-bdr-rad-half'>

        </div>
        <div>
          <h3 className='xui-font-w-500 text-[16px]'>SMS Notifications</h3>
          <span className='xui-opacity-6 text-[14px]'>Receive text message alerts</span>
        </div>
      </div>
      <div className='xui-mt-2 xui-d-grid xui-grid-col-1 xui-grid-gap-2'>
        <form className='xui-form' action="">
          <div className='xui-max-w-600 xui-w-fluid-100'>
            <div className='xui-d-flex xui-flex-ai-center xui-grid-gap-half'>
              <PhoneInput
                defaultCountry="us"
                value={phone}
                style={{
                  flex: 1
                }}
                onChange={(phone) => setPhone(phone)}
              />
              <button className='xui-btn xui-btn-success xui-bdr-rad-half'>
                <span className='text-[13px]'>Verify</span>
              </button>
            </div>
            <span className='xui-text-green text-[12px]'>Your phone number is verified</span>
          </div>
        </form>
        <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
          <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
            <p className='xui-opacity-8 text-[15px]'>Critical Alerts Only</p>
            <span className='xui-opacity-6 text-[14px]'>Only receive SMS for urgent system alerts</span>
          </div>
          <div className="xui-toggle-switch">
            <input type="checkbox" id="toggle" />
            <div className="slider"></div>
          </div>
        </div>
      </div>
    </section>
    <section className='xui-p-1 xui-bdr-rad-half xui-bdr-w-1 xui-bdr-s-solid xui-bdr-fade xui-mt-1'>
      <h3 className='xui-font-w-500 text-[16px]'>Notification Frequency</h3>
      <div className='xui-mt-2 xui-d-grid xui-grid-col-1 xui-grid-gap-2'>
        <form className='xui-form' action="">
          <div className='xui-form-box xui-max-w-500 xui-w-fluid-100'>
            <select name="frequency" id="frequency">
              <option value="Immediate">Immediate</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
            <span className='xui-text-fade text-[12px]'>Choose how often you want to receive non-urgent notifications</span>
          </div>
        </form>
      </div>
    </section>
    <div className='xui-mt-2 xui-d-flex xui-flex-jc-flex-end'>
      <button className='xui-btn xui-btn-black xui-bdr-rad-half'>
        <span className='text-[14px]'>Save Preferences</span>
      </button>
    </div>
    </>
  );
}
