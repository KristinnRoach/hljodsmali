import { useState, useEffect } from 'react';

interface CountdownProps {
  seconds: number;
  onComplete: () => void;
}

const Countdown: React.FC<CountdownProps> = ({ seconds, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  return <div className="countdown">{timeLeft}</div>;
};

export default Countdown;