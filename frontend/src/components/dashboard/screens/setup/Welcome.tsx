import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <>
      <section className="">
        <div className="xui-max-w-500 xui-w-fluid-100 xui-py-2">
          <p className="xui-font-sz-[18px]">We are Qylon</p>
          <h1 className="xui-font-w-bold xui-font-sz-[28px] xui-md-font-sz-[40px] xui-mt-2">
            You discuss while we handle the important parts in your meetings.
          </h1>
          <Link
            to={'profile'}
            className="xui-bdr-rad-half bg-gradient-to-r from-purple-500 to-indigo-500 xui-text-white xui-mt-2 xui-btn xui-btn-black"
          >
            <span>Get started</span>
          </Link>
        </div>
      </section>
    </>
  );
}
