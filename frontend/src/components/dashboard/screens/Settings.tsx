import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function Settings() {
    const { setNavbar } = useOutletContext<NavbarContext>();
    useEffect(() => {
        setNavbar({
        title: "Settings",
        subtitle: "Adjust your application settings",
        });
    }, [setNavbar]);
    return (
        <div>Settings</div>
    )
}
