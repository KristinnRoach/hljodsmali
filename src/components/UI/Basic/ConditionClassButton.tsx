import React from 'react';

interface Props {
  id?: string;
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
  id = '',
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
      id={id}
      className={`${baseClassName} ${
        condition ? trueClassName : falseClassName
      }`}
      onClick={condition ? trueClick : falseClick}
      type='button'
    >
      {condition ? trueContent : falseContent}
    </button>
  );
};

export default ConditionClassButton;
