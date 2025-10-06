import { ReactNode } from 'react';

interface StatsHeaderProps {
  title: string;
  rightContent?: ReactNode;
  children?: ReactNode;
}

export default function StatsHeader({ title, rightContent, children }: StatsHeaderProps) {
  return (
    <div className="xui-bg-white xui-bdr-rad-1-half border border-gray-200 p-6">
      <div className="xui-d-flex xui-flex-ai-center xui-flex-jc-space-between">
        <h2 className="text-lg xui-font-w-600 text-gray-900">{title}</h2>
        {rightContent && (
          <div className="xui-d-flex xui-flex-ai-center gap-3">
            {rightContent}
          </div>
        )}
      </div>
      {children && (
        <div className="xui-mt-1-half">
          {children}
        </div>
      )}
    </div>
  );
}

// Usage Examples:

// For just Title
// <StatsHeader title="Dashboard" />

// For Just icons
// <StatsHeader 
//   title="AI Command Center" 
//   rightContent={
//     <>
//       <MessageSquare className="w-5 h-5 text-gray-600" />
//       <Smartphone className="w-5 h-5 text-gray-600" />
//       <Headphones className="w-5 h-5 text-gray-600" />
//     </>
//   }
// />

// For icons + text
// <StatsHeader 
//   title="Dashboard" 
//   rightContent={
//     <button className="flex items-center gap-2">
//       <Plus className="w-5 h-5" />
//       <span>Add New</span>
//     </button>
//   }
// />

// With children content
// <StatsHeader title="AI Command Center" rightContent={<>...</>}>
//   <StatsCard />
//   <OtherCards />
//   <AnyOtherContent />
// </StatsHeader>