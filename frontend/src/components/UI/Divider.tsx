// src/components/ui/Divider.tsx
export function Divider({ label }: { label: string }) {
  return (
    <div className="relative my-6 text-center">
      <span className="absolute left-0 top-1/2 h-px w-full bg-gray-200"></span>
      <span className="relative bg-white px-4 text-sm text-gray-500">
        {label}
      </span>
    </div>
  );
}
