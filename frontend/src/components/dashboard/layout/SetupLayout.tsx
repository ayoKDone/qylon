// src/components/dashboard/layout/DashboardLayout.tsx
import { Outlet } from 'react-router-dom';

export default function SetUpLayout() {
  return (
    <>
      <nav className="xui-py-[20px] xui xui-container xui-d-flex xui-flex-ai-center xui-flex-jc-space-between">
        <img
          src="/static/images/logo-full.png"
          alt="Qylon Logo"
          className="xui-img-100"
          width={118}
          height={45}
        />
        <p className="text-sm text-gray-500">
          <a
            href="/signup"
            className="text-purple-600 font-medium xui-text-dc-underline"
          >
            Skip this for later
          </a>
        </p>
      </nav>
      <hr />
      <section className="xui-container xui-py-1 xui-md-py-1">
        <Outlet />
      </section>
    </>
  );
}
