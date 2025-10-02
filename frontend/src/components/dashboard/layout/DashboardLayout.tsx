// src/components/dashboard/layout/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import Navigator from "./Navigator";
import Navbar from "./Navbar";
import { useState } from "react";

export default function DashboardLayout() {
  const [navbar, setNavbar] = useState<{ title?: string; subtitle?: string }>({
    title: undefined,
    subtitle: undefined,
  });

  return (
    <section className="xui-dashboard">
      <Navigator />
      <div className="screen" xui-navbar="true">
        <div className="sticky top-0 z-10 px-6">
          <Navbar title={navbar.title ?? ""} subtitle={navbar.subtitle ?? ""}/>
        </div>
        <main className="p-6">
          {/* 👇 Pass setter to children */}
          <Outlet context={{ setNavbar }} />
        </main>
      </div>
    </section>
  );
}
