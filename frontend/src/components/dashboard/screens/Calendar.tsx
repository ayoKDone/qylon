import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function Calendar() {
  const { setNavbar } = useOutletContext<NavbarContext>();
  useEffect(() => {
    setNavbar({
      title: 'Calendar',
      subtitle: 'View and manage your calendar events',
    });
  }, [setNavbar]);
  return <div>Calendar</div>;
}
