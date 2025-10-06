// src/components/dashboard/layout/DashboardLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Navigator from "./Navigator";

export default function DashboardLayout() {
  const [navbar, setNavbar] = useState<{ title?: string; subtitle?: string }>({
    title: undefined,
    subtitle: undefined,
  });

  return (
    <section className="xui-dashboard">
      <Navigator />
      <div className="screen" xui-navbar="true">
        <div className="sticky top-0 z-10 px-5 mb-3">
          <Navbar title={navbar.title ?? ""} subtitle={navbar.subtitle ?? ""}/>
        </div>
        <main className="p-6 content">
          {/* 👇 Pass setter to children */}
          <Outlet context={{ setNavbar }} />
        </main>
      </div>
    </section>
  );
}
