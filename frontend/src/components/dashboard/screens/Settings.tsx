import { Bell, CreditCard, Link, Shield, SlidersHorizontal, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import IntegrationSettings from '../widgets/IntegrationSettings';
import NotificationSettings from '../widgets/NotificationSettings';
import ProfileSettings from '../widgets/ProfileSettings';
import SecuritySettings from '../widgets/SecuritySettings';
import SettingsSidebar from '../widgets/SettingsSidebar';
import StatsHeader from '../widgets/StatsHeader';
// Optional new imports — create these components if not existing
// import BillingSettings from "../widgets/BillingSettings";
// import TeamSettings from "../widgets/TeamSettings";
// import PreferencesSettings from "../widgets/PreferencesSettings";
import '../../../settings.css';
import BillingSettings from '../widgets/BillingSettings';

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');

  const settingsItems = [
    { id: 'profile', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  ];

  const getActiveTitle = () => {
    const activeItem = settingsItems.find(item => item.id === activeSection);
    return activeItem ? activeItem.label : 'Settings';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'integrations':
        return <IntegrationSettings />;
      case 'billing':
        return <BillingSettings />; // Replace with <BillingSettings />
      case 'security':
        return <SecuritySettings />;
      case 'team':
        return <div>Team settings go here.</div>; // Replace with <TeamSettings />
      case 'preferences':
        return <div>Preferences settings go here.</div>; // Replace with <PreferencesSettings />
      default:
        return <ProfileSettings />;
    }
  };

  const { setNavbar } = useOutletContext<NavbarContext>();

  useEffect(() => {
    setNavbar({
      title: 'Settings',
      subtitle: 'Adjust your application settings',
    });
  }, [setNavbar]);

  return (
    <>
    <SettingsSidebar
      items={settingsItems}
      activeItem={activeSection}
      onItemClick={setActiveSection}
    />
    <div className='xui-mt-1'>
      <StatsHeader title={getActiveTitle()}>{renderContent()}</StatsHeader>
    </div>
    </>
  );
}
