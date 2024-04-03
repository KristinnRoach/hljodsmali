'use client';

import { FC } from 'react';

const error = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div>
      returning error from error.tsx
      <button onClick={reset}>Try again</button>
    </div>
  );
};

export default error;
