import { useState } from 'react';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

export default function NotificationSettings() {
  const [phone, setPhone] = useState('');

  return (
    <>
      <section className='xui-p-1 xui-bdr-rad-half xui-bdr-w-1 xui-bdr-s-solid xui-bdr-fade xui-mt-1'>
        <div className='xui-d-flex xui-flex-ai-center xui-grid-gap-1'>
          <div className='w-[48px] h-[48px] xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center xui-bg-light-blue-1 xui-bdr-rad-half'></div>
          <div>
            <h3 className='xui-font-w-500 text-[16px]'>Email Notifications</h3>
            <span className='xui-opacity-6 text-[14px]'>Receive updates via email</span>
          </div>
        </div>
        <div className='xui-mt-2 xui-d-grid xui-grid-col-1 xui-grid-gap-2'>
          <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
            <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
              <p className='xui-opacity-8 text-[15px]'>Meeting Recordings Ready</p>
              <span className='xui-opacity-6 text-[14px]'>
                Get notified when your meeting recordings are processed
              </span>
            </div>
            <div className='xui-toggle-switch'>
              <input type='checkbox' id='toggle' />
              <div className='slider'></div>
            </div>
          </div>
          <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
            <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
              <p className='xui-opacity-8 text-[15px]'>Action Items Assigned</p>
              <span className='xui-opacity-6 text-[14px]'>
                Receive notifications when tasks are assigned to you
              </span>
            </div>
            <div className='xui-toggle-switch'>
              <input type='checkbox' id='toggle' />
              <div className='slider'></div>
            </div>
          </div>
          <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
            <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
              <p className='xui-opacity-8 text-[15px]'>Workflow Completions</p>
              <span className='xui-opacity-6 text-[14px]'>
                Get notified when automated workflows complete
              </span>
            </div>
            <div className='xui-toggle-switch'>
              <input type='checkbox' id='toggle' />
              <div className='slider'></div>
            </div>
          </div>
          <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
            <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
              <p className='xui-opacity-8 text-[15px]'>Weekly Summaries</p>
              <span className='xui-opacity-6 text-[14px]'>
                Receive a weekly digest of your activity
              </span>
            </div>
            <div className='xui-toggle-switch'>
              <input type='checkbox' id='toggle' />
              <div className='slider'></div>
            </div>
          </div>
        </div>
      </section>
      <section className='xui-p-1 xui-bdr-rad-half xui-bdr-w-1 xui-bdr-s-solid xui-bdr-fade xui-mt-1'>
        <div className='xui-d-flex xui-flex-ai-center xui-grid-gap-1'>
          <div className='w-[48px] h-[48px] xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center xui-bg-light-blue-1 xui-bdr-rad-half'></div>
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
            <div className='xui-toggle-switch'>
              <input type='checkbox' id='toggle' />
              <div className='slider'></div>
            </div>
          </div>
          <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
            <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
              <p className='xui-opacity-8 text-[15px]'>Task Reminders</p>
              <span className='xui-opacity-6 text-[14px]'>
                Reminders for upcoming task deadlines
              </span>
            </div>
            <div className='xui-toggle-switch'>
              <input type='checkbox' id='toggle' />
              <div className='slider'></div>
            </div>
          </div>
          <div className='xui-d-flex xui-flex-jc-space-between xui-flex-ai-center'>
            <div className='xui-d-grid xui-grid-col-1 xui-grid-gap-half'>
              <p className='xui-opacity-8 text-[15px]'>System Alerts</p>
              <span className='xui-opacity-6 text-[14px]'>
                Important system notifications and updates
              </span>
            </div>
            <div className='xui-toggle-switch'>
              <input type='checkbox' id='toggle' />
              <div className='slider'></div>
            </div>
          </div>
        </div>
      </section>
      <section className='xui-p-1 xui-bdr-rad-half xui-bdr-w-1 xui-bdr-s-solid xui-bdr-fade xui-mt-1'>
        <div className='xui-d-flex xui-flex-ai-center xui-grid-gap-1'>
          <div className='w-[48px] h-[48px] xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center xui-bg-light-green-1 xui-bdr-rad-half'></div>
          <div>
            <h3 className='xui-font-w-500 text-[16px]'>SMS Notifications</h3>
            <span className='xui-opacity-6 text-[14px]'>Receive text message alerts</span>
          </div>
        </div>
        <div className='xui-mt-2 xui-d-grid xui-grid-col-1 xui-grid-gap-2'>
          <form className='xui-form' action=''>
            <div className='xui-max-w-600 xui-w-fluid-100'>
              <div className='xui-d-flex xui-flex-ai-center xui-grid-gap-half'>
                <PhoneInput
                  defaultCountry='us'
                  value={phone}
                  style={{
                    flex: 1,
                  }}
                  onChange={phone => setPhone(phone)}
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
              <span className='xui-opacity-6 text-[14px]'>
                Only receive SMS for urgent system alerts
              </span>
            </div>
            <div className='xui-toggle-switch'>
              <input type='checkbox' id='toggle' />
              <div className='slider'></div>
            </div>
          </div>
        </div>
      </section>
      <section className='xui-p-1 xui-bdr-rad-half xui-bdr-w-1 xui-bdr-s-solid xui-bdr-fade xui-mt-1'>
        <h3 className='xui-font-w-500 text-[16px]'>Notification Frequency</h3>
        <div className='xui-mt-2 xui-d-grid xui-grid-col-1 xui-grid-gap-2'>
          <form className='xui-form' action=''>
            <div className='xui-form-box xui-max-w-500 xui-w-fluid-100'>
              <select name='frequency' id='frequency'>
                <option value='Immediate'>Immediate</option>
                <option value='Daily'>Daily</option>
                <option value='Weekly'>Weekly</option>
              </select>
              <span className='xui-text-fade text-[12px]'>
                Choose how often you want to receive non-urgent notifications
              </span>
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
