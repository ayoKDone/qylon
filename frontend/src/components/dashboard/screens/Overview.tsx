// src/pages/DashboardOverview.tsx
import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Headphones, Smartphone, Monitor } from "lucide-react";
import StatsHeader from "../widgets/StatsHeader";
import QuickActions from "../widgets/QuickActions";
import RecentActivity from "../widgets/RecentActivity";
import StatsGrid from "../widgets/StatsGrid";
import AIProcessingLive from "../widgets/AIProcessingLive";
import { Plus, Upload, Download } from "lucide-react";
import type { Action } from "../widgets/QuickActions";

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};
export default function DashboardOverview() {
    const { setNavbar } = useOutletContext<NavbarContext>();

    const dashboardActions: Action[] = [
        {
            icon: Plus,
            label: "New Meeting",
            iconColor: "text-blue-500",
            onClick: () => console.log("New Meeting clicked"),
        },
        {
            icon: Upload,
            label: "Upload Audio",
            iconColor: "text-teal-500",
            onClick: () => console.log("Upload Audio clicked"),
        },
        {
            icon: Download,
            label: "Export Tasks",
            iconColor: "text-amber-500",
            onClick: () => console.log("Export Tasks clicked"),
        },
    ];

    useEffect(() => {
        setNavbar({
            title: "Good afternoon, Esther",
            subtitle: "AI processing 3 active conversations",
        });
    }, [setNavbar]);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8">
                <StatsHeader 
                    title="AI Command Center" 
                    rightContent={
                        <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-gray-600" />
                            <Smartphone className="w-5 h-5 text-gray-600" />
                            <Headphones className="w-5 h-5 text-gray-600" />
                        </div>
                    }
                >
                    <div className="mb-8">
                        <AIProcessingLive />
                    </div>
                    <div>
                        <StatsGrid />
                    </div>
                </StatsHeader>
            </div>
            
            <div className="lg:col-span-4 flex flex-col gap-4">
                <StatsHeader 
                    title="Quick Actions"
                >
                    <QuickActions actions={dashboardActions} />
                </StatsHeader>
                <StatsHeader 
                    title="Recent Activity"
                >
                    {/* Recent activity content goes here */}
                    <RecentActivity />
                </StatsHeader>
            </div>
        </div>
    );
}
