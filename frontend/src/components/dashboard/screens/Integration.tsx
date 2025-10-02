import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function Integration() {
  const { setNavbar } = useOutletContext<NavbarContext>();
  useEffect(() => {
    setNavbar({
      title: 'Integration',
      subtitle: 'Manage your integrations and connected apps',
    });
  }, [setNavbar]);
  return <div>Integration</div>;
}
