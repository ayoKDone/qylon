import { LuArrowRight, LuRadio } from "react-icons/lu";

export default function AIProcessingLive() {

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-800 p-5 mb-5 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      
      {/* Subtle grid pattern */}

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-white">Live Conversation Tracking</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
                LIVE
              </span>
            </div>
            <p className="text-white/90 text-sm flex items-center gap-2">
              <LuRadio className="w-3.5 h-3.5" />
              2 active meetings being processed
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-blue-600 font-medium text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap">
          View Live
          <LuArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}