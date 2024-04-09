'use client';

import { FC } from 'react';

const error = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div>
      An error occured..
      <button onClick={reset}>Try again?</button>
    </div>
  );
};

export default error;
