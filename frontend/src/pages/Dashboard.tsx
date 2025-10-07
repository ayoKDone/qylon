import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/layout/DashboardLayout';
import DashboardOverview from '../components/dashboard/screens/Overview';
import LiveMeetings from '../components/dashboard/screens/LiveMeetings';
import ActionItems from '../components/dashboard/screens/ActionItems';
import Analytics from '../components/dashboard/screens/Analytics';
import Team from '../components/dashboard/screens/Team';
import Clients from '../components/dashboard/screens/Clients';
import Calendar from '../components/dashboard/screens/Calendar';
import Settings from '../components/dashboard/screens/Settings';

export default function DashboardPage() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="live-meetings" element={<LiveMeetings />} />
        <Route path="tasks" element={<ActionItems />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="team" element={<Team />} />
        <Route path="clients" element={<Clients />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
