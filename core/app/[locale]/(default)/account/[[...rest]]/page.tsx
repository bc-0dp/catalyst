'use client';

import { useEffect } from 'react';

const Page = () => {
  useEffect(() => {
    if (window.location.hash === '') {
      window.location.hash = '#/orders';
    }
  }, []);

  return <div data-embedded id="bundle-container" style={{ height: '100vh' }} />;
};

export default Page;
