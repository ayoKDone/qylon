import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function LiveMeetings() {
  const { setNavbar } = useOutletContext<NavbarContext>();
  useEffect(() => {
    setNavbar({
      title: 'Live Meetings',
      subtitle: 'Monitor and manage your live meetings',
    });
  }, [setNavbar]);
  return <div>LiveMeetings</div>;
}
