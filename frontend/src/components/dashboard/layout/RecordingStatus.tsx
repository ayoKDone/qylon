// src/components/dashboard/layout/RecordingStatus.tsx
import { useState, useEffect } from 'react';
import { FiPlay, FiStopCircle, FiMic } from 'react-icons/fi';

export default function RecordingStatus() {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRecording) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setSeconds(0);
      setIsRecording(true);
    }
  };

  const formatTime = (s: number) => {
    const minutes = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  return (
    <div className="p-4 m-1 bg-white rounded-2xl border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Recording Status</h3>
        <div
          className={`w-3 h-3 rounded-full ${
            isRecording ? 'bg-red-500' : 'bg-gray-300'
          }`}
        ></div>
      </div>

      <div className="flex justify-between mt-1">
        <div className="mt-3">
          <p className="text-2xl font-bold">{formatTime(seconds)}</p>
          <p className="xui-font-sz-small text-gray-500">
            {isRecording ? 'Recording...' : 'Ready to record'}
          </p>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={toggleRecording}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:opacity-90 transition"
          >
            {isRecording ? <FiStopCircle size={20} /> : <FiPlay size={20} />}
          </button>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <FiMic className="text-green-500" />
        <span className="text-sm font-medium text-gray-600">Audio On</span>
      </div>
    </div>
  );
}
