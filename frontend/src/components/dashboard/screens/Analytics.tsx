import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function Analytics() {
  const { setNavbar } = useOutletContext<NavbarContext>();

  useEffect(() => {
    setNavbar({
      title: 'Analytics',
      subtitle: 'View your analytics and reports',
    });
  }, [setNavbar]);
  return <div>Analytics</div>;
}
