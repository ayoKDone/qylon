import { Activity, BarChart3, Calendar, ChevronLeft, ChevronRight, Target, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import CalendarGrid from "../widgets/CalendarGrid";
import ProgressBar from "../widgets/ProgressBar";
import SectionHeader from "../widgets/SectionHeader";
import StatsHeader from "../widgets/StatsHeader";
import TabNavigation from "../widgets/TabNavigation";
import TeamMemberCard from "../widgets/TeamMemberCard";

type NavbarContext = {
  setNavbar: (val: { title: string; subtitle?: string }) => void;
};

export default function Team() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const previousWeek = () => {
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
    };

    const nextWeek = () => {
        setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
    };
    const teamMembers = [
        {
            name: "Sarah Chen",
            role: "Project Manager",
            avatar: "SC",
            avatarColor: "bg-blue-500",
            level: 12,
            streak: 7,
            tasksCompleted: 8,
            totalTasks: 12,
            rate: 92,
            overdue: 1,
            avgTime: "2.5h",
            score: 92,
            points: 2850,
            progressColor: "bg-blue-500",
            color: "bg-blue-500",
        },
        {
            name: "Mike Johnson",
            role: "Senior Consultant",
            avatar: "MJ",
            avatarColor: "bg-green-500",
            level: 15,
            streak: 4,
            tasksCompleted: 14,
            totalTasks: 18,
            rate: 87,
            overdue: 2,
            avgTime: "1.8h",
            score: 87,
            points: 3420,
            progressColor: "bg-green-500",
            color: "bg-blue-500",
        },
        {
            name: "Alex Rivera",
            role: "Account Manager",
            avatar: "AR",
            avatarColor: "bg-purple-500",
            level: 18,
            streak: 12,
            tasksCompleted: 7,
            totalTasks: 9,
            rate: 95,
            overdue: 0,
            avgTime: "1.2h",
            score: 95,
            points: 4230,
            progressColor: "bg-purple-500",
            color: "bg-blue-500",
        },
        {
            name: "Emma Davis",
            role: "Technical Lead",
            avatar: "ED",
            avatarColor: "bg-amber-500",
            level: 10,
            streak: 5,
            tasksCompleted: 12,
            totalTasks: 15,
            rate: 89,
            overdue: 1,
            avgTime: "3.1h",
            score: 89,
            points: 1980,
            progressColor: "bg-amber-500",
            color: "bg-blue-500",
        },
    ];
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", label: "Overview", icon: Activity },
        { id: "calendar", label: "Team Calendar", icon: Calendar },
        { id: "action-items", label: "Action Items", icon: Target },
        { id: "recordings", label: "Recordings", icon: Video },
        { id: "performance", label: "Performance", icon: BarChart3 },
    ];
    const { setNavbar } = useOutletContext<NavbarContext>();

    useEffect(() => {
        setNavbar({
        title: "Team",
        subtitle: "Manage your team members and their roles",
        });
    }, [setNavbar]);
    return (
        <div className="space-y-6">
            <SectionHeader
                title="Team Dashboard"
                subtitle="Monitor team performance and collaboration"
                primaryAction={{
                label: "Add Member",
                onClick: () => console.log("Add member"),
                }}
            >

                <TabNavigation
                    tabs={tabs}
                    defaultTab="overview"
                    onTabChange={setActiveTab}
                />
            </SectionHeader>
            {/* Render content based on active tab */}
            <div>
                {activeTab === "overview" &&
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-4">
                        <StatsHeader title="Team Members">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                {teamMembers.map((member) => (
                                    <TeamMemberCard key={member.name} {...member} />
                                ))}
                            </div>
                        </StatsHeader>
                    </div>
                    <div className="lg:col-span-8">
                        <StatsHeader title="Team Performance">
                            <div className="space-y-4">
                                <ProgressBar
                                    label="Team Completion Rate"
                                    value={91}
                                    color="bg-green-500"
                                    valueColor="text-green-600"
                                />

                                <ProgressBar
                                    label="Total Tasks Completed"
                                    value={41}
                                    maxValue={54}
                                    color="bg-blue-500"
                                    valueColor="text-blue-600"
                                />
                            </div>
                        </StatsHeader>
                    </div>
                </div>
                }
                {activeTab === "calendar" &&
                    <div className="lg:col-span-8">
                        <StatsHeader
                            title="Team Calendar & Events"
                            rightContent={
                            <div className="flex items-center gap-2">
                                <button onClick={previousWeek} className="p-2 hover:bg-gray-100 rounded-lg">
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <span className="text-sm font-semibold text-gray-700">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                                </span>
                                <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-lg">
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            }
                        >
                            <CalendarGrid
                            teamMembers={teamMembers}
                            currentDate={currentDate}  // Pass the state
                            startHour={8}
                            endHour={17}
                            />
                        </StatsHeader>
                    </div>
                }
                {activeTab === "action-items" && <div>Action Items Content</div>}
                {activeTab === "recordings" && <div>Recordings Content</div>}
                {activeTab === "performance" && <div>Performance Content</div>}
            </div>
        </div>
    )
}
