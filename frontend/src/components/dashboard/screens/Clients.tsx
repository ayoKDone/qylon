import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function Clients() {
    const { setNavbar } = useOutletContext<NavbarContext>();
        
    useEffect(() => {
        setNavbar({
        title: "Clients",
        subtitle: "Manage your clients and their information",
        });
    }, [setNavbar]);
    return (
        <div>Clients</div>
    )
}
