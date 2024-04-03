import React from 'react';

interface Props {
  condition?: boolean;
  baseClassName?: string;
  trueClassName?: string;
  falseClassName?: string;
  trueContent?: string;
  falseContent?: string;
  trueClick?: () => void;
  falseClick?: () => void;
}

const ConditionClassButton: React.FC<Props> = ({
  condition = true,
  baseClassName = '',
  trueClassName = '',
  falseClassName = '',
  trueContent = '',
  falseContent = '',
  trueClick,
  falseClick,
}) => {
  return (
    <button
      className={`${baseClassName} ${
        condition ? trueClassName : falseClassName
      }`}
      onClick={condition ? trueClick : falseClick}
      type="button"
    >
      {condition ? trueContent : falseContent}
    </button>
  );
};

export default ConditionClassButton;
