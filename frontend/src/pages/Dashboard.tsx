import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import DashboardOverview from '../components/dashboard/screens/Overview';
import LiveMeetings from '../components/dashboard/screens/LiveMeetings';
import ActionItems from '../components/dashboard/screens/ActionItems';
import Analytics from '../components/dashboard/screens/Analytics';
import Workflow from '../components/dashboard/screens/Workflow';
import Contents from '../components/dashboard/screens/Contents';
import Integration from '../components/dashboard/screens/Integration';
import Settings from '../components/dashboard/screens/Settings';
import MeetingHistory from '@/components/dashboard/screens/MeetingHistory';

export default function DashboardPage() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path='live-meetings' element={<LiveMeetings />} />
        <Route path='tasks' element={<ActionItems />} />
        <Route path='meeting-history' element={<MeetingHistory />} />
        <Route path='analytics' element={<Analytics />} />
        <Route path='workflow' element={<Workflow />} />
        <Route path='contents' element={<Contents />} />
        <Route path='Integration' element={<Integration />} />
        <Route path='settings' element={<Settings />} />
      </Route>
    </Routes>
  );
}
