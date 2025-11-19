import { ReactNode } from 'react';

interface DoorCardWrapperProps {
  children: ReactNode;
  transform?: string;
  width: number;
  height: number;
}

export function DoorCardWrapper({ children, transform, width, height }: DoorCardWrapperProps) {
  if (!transform) {
    return <>{children}</>;
  }

  return (
    <div 
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </div>
  );
}
