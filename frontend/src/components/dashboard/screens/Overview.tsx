// src/pages/DashboardOverview.tsx
import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Headphones, MessageSquare, Smartphone } from "lucide-react";
import StatsHeader from "../widgets/StatsHeader";

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};
export default function DashboardOverview() {
    const { setNavbar } = useOutletContext<NavbarContext>();

    useEffect(() => {
        setNavbar({
            title: "Good afternoon, Esther",
            subtitle: "AI processing 3 active conversations",
        });
    }, [setNavbar]);
    return (
        <div>
            <StatsHeader 
            title="AI Command Center" 
                rightContent={
                    <>
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    <Smartphone className="w-5 h-5 text-gray-600" />
                    <Headphones className="w-5 h-5 text-gray-600" />
                    </>
                }
            >
                <p className="text-gray-600">Monitor and manage all your AI interactions in one place.</p>
            </StatsHeader>
        </div>
    );
}
