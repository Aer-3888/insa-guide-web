import React from 'react';
import type {ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import {RuntimeProvider} from '@site/src/components/runtimes/RuntimeContext';
import {PageCodeProvider} from '@site/src/components/CodeRunner/PageCodeContext';

interface RootProps {
  children: ReactNode;
}

export default function Root({children}: RootProps): ReactNode {
  const {pathname} = useLocation();

  return (
    <RuntimeProvider>
      <PageCodeProvider key={pathname}>
        {children}
      </PageCodeProvider>
    </RuntimeProvider>
  );
}
