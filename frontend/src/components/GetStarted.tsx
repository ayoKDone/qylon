import { FeatureList } from "./FeatureList";
import { TestimonialCarousel } from "./TestimonialCarousel";
import { PiBrain } from "react-icons/pi";
import { MdRocketLaunch } from "react-icons/md";

export default function GetStarted() {
  return (
    <section className="xui-d-grid md:grid-cols-2 min-h-screen">
      {/* Left side */}
      <div className="xui-d-flex xui-flex-ai-center xui-flex-jc-center p-12 bg-white">
        <div className="max-w-md text-center">
          <div className="xui-d-flex xui-flex-ai-center xui-flex-jc-center w-12 h-12 rounded-full bg-purple-100 mb-6 mx-auto">
            <PiBrain className="w-6 h-6 text-purple-500" />
            
          </div>

          <h1 className="text-3xl font-bold mb-4">
            Transform Your Meetings with AI
          </h1>
          <p className="text-gray-600 mb-6">
            Qylon automatically captures, processes, and transforms your meeting
            content into actionable business assets using advanced AI workflows.
          </p>

          <FeatureList />

          <button className="w-full xui-d-flex xui-flex-jc-center gap-2 outline-none mt-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <MdRocketLaunch className="text-white mt-1" />
            Get Started Free
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-purple-600 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="xui-d-flex flex-col xui-flex-ai-center xui-flex-jc-center bg-gradient-to-br from-purple-500 to-indigo-500 text-white p-12 xui-pos-relative">
        <div className="flex-1 xui-d-flex xui-flex-ai-center xui-flex-jc-center">
          <TestimonialCarousel />
        </div>

        {/* Trusted by */}
        <div className="mt-12 text-center">
          <p className="text-sm uppercase tracking-wide opacity-80 mb-4">
            Trusted by Industry Leaders
          </p>
          <div className="xui-d-flex xui-flex-ai-center xui-flex-jc-center gap-8 opacity-90">
            {/* Replace with real logos */}
            <div className="w-16 h-8 bg-white/20 rounded-md xui-d-flex xui-flex-ai-center xui-flex-jc-center">
              <span className="text-xs">Logo 1</span>
            </div>
            <div className="w-16 h-8 bg-white/20 rounded-md xui-d-flex xui-flex-ai-center xui-flex-jc-center">
              <span className="text-xs">Logo 2</span>
            </div>
            <div className="w-16 h-8 bg-white/20 rounded-md xui-d-flex xui-flex-ai-center xui-flex-jc-center">
              <span className="text-xs">Logo 3</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
