// src/components/dashboard/layout/Navigator.tsx
import { FiActivity, FiBarChart2, FiSettings, } from "react-icons/fi";
import { FaRegCircleCheck } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { IoVideocamOutline } from "react-icons/io5";
import { TbUsers } from "react-icons/tb";
import { LuBuilding2 } from "react-icons/lu";
import { IoCalendarClearOutline } from "react-icons/io5";
import RecordingStatus from "./RecordingStatus";

export default function Navigator() {
  const location = useLocation();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <FiActivity /> },
    { to: "/dashboard/live-meetings", label: "Live Meetings", icon: <IoVideocamOutline /> },
    { to: "/dashboard/tasks", label: "Action Items", icon: <FaRegCircleCheck /> },
    { to: "/dashboard/analytics", label: "Analytics", icon: <FiBarChart2 /> },
    { to: "/dashboard/team", label: "Team", icon: <TbUsers /> },
    { to: "/dashboard/clients", label: "Clients", icon: <LuBuilding2 /> },
    { to: "/dashboard/calendar", label: "Calendar", icon: <IoCalendarClearOutline /> },
    { to: "/dashboard/settings", label: "Settings", icon: <FiSettings /> },
  ];

  return (
    <div className="navigator">
      <div className="brand">
        <img
          src="/src/assets/images/qylon-logo.png"
          alt="Qylon Logo"
          className="xui-img-100 xui-h-auto"
        />
      </div>

      <div className="links">

        {links.map(({ to, label, icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`link-box flex items-center gap-3 xui-bdr-rad-2 xui-text-[var(--black)] ${
                isActive
                  ? "xui-text-[var(--black)] border border-[var(--gray-300)] xui-bdr-rad-2"
                  : "text-gray-600"
              }`}
            >
              <div className="icon text-lg">{icon}</div>
              <span className="text">{label}</span>
            </Link>
          );
        })}
        {/* Recording Card Below */}
        <div className="bottom-fixed">
            <RecordingStatus />
        </div>
      </div>
        
    </div>
  );
}
