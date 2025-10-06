import { ReactNode } from 'react';

interface StatsHeaderProps {
  title?: string;
  rightContent?: ReactNode;
  children?: ReactNode;
}

export default function StatsHeader({ title, rightContent, children }: StatsHeaderProps) {
  return (
    <div className="xui-bg-white xui-bdr-rad-1-half border border-gray-200 p-6">
      {(title || rightContent) && (
        <div className="xui-d-flex xui-flex-ai-center xui-flex-jc-space-between">
          {title && <h2 className="text-lg xui-font-w-600 text-gray-900">{title}</h2>}
          {rightContent && (
            <div className="xui-d-flex xui-flex-ai-center gap-3">
              {rightContent}
            </div>
          )}
        </div>
      )}
      {children && (
        <div className={title || rightContent ? "xui-mt-1-half" : ""}>
          {children}
        </div>
      )}
    </div>
  );
}

// Usage Examples:

// No title, just content
// <StatsHeader>
//   <QuickActions />
// </StatsHeader>

// Just title
// <StatsHeader title="Dashboard" />

// Just icons (no title)
// <StatsHeader
//   rightContent={
//     <>
//       <MessageSquare className="w-5 h-5 text-gray-600" />
//       <Smartphone className="w-5 h-5 text-gray-600" />
//     </>
//   }
// />

// Title + icons
// <StatsHeader
//   title="AI Command Center"
//   rightContent={
//     <>
//       <MessageSquare className="w-5 h-5 text-gray-600" />
//       <Smartphone className="w-5 h-5 text-gray-600" />
//     </>
//   }
// />

// With children content
// <StatsHeader title="AI Command Center" rightContent={<>...</>}>
//   <StatsCard />
//   <OtherCards />
// </StatsHeader>
