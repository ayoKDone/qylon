import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function Contents() {
  const { setNavbar } = useOutletContext<NavbarContext>();

  useEffect(() => {
    setNavbar({
      title: 'Contents',
      subtitle: 'Manage and organize your content library',
    });
  }, [setNavbar]);
  return <div>Contents</div>;
}
