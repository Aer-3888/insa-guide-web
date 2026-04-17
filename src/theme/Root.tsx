import React from 'react';
import type { ReactNode } from 'react';
import { RuntimeProvider } from '@site/src/components/runtimes/RuntimeContext';

interface RootProps {
  children: ReactNode;
}

export default function Root({ children }: RootProps): ReactNode {
  return <RuntimeProvider>{children}</RuntimeProvider>;
}
