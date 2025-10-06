import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function ActionItems() {
    const { setNavbar } = useOutletContext<NavbarContext>();
    
    useEffect(() => {
        setNavbar({
        title: "Tasks",
        subtitle: "View and manage your action items",
        });
    }, [setNavbar]);
    return (
        <div>ActionItems</div>
    )
}
