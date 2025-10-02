import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function Team() {
    const { setNavbar } = useOutletContext<NavbarContext>();

    useEffect(() => {
        setNavbar({
        title: "Team",
        subtitle: "Manage your team members and their roles",
        });
    }, [setNavbar]);
    return (
        <div>Team</div>
    )
}
