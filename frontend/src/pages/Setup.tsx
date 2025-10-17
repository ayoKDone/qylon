import { Route, Routes } from 'react-router-dom';
import SetUpLayout from '../components/dashboard/layout/SetupLayout';
import AllIntegrations from '../components/dashboard/screens/setup/AllIntegrations';
import Completed from '../components/dashboard/screens/setup/Completed';
import DemoSetup from '../components/dashboard/screens/setup/DemoSetup';
import IntegrateGoogle from '../components/dashboard/screens/setup/IntegrateGoogle';
import Profile from '../components/dashboard/screens/setup/Profile';
import TeamOnboarding from '../components/dashboard/screens/setup/TeamOnboarding';
import Welcome from '../components/dashboard/screens/setup/Welcome';

export default function Setup() {
  return (
    <>
      <Routes>
        <Route element={<SetUpLayout />}>
          <Route index element={<Welcome />} />
          <Route path='profile' element={<Profile />} />
          <Route path='team-setup' element={<TeamOnboarding />} />
          <Route path='add-calendar' element={<IntegrateGoogle />} />
          <Route path='integrations' element={<AllIntegrations />} />
          <Route path='demo' element={<DemoSetup />} />
          <Route path='complete' element={<Completed />} />
        </Route>
      </Routes>
    </>
  );
}
