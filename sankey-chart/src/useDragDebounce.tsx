import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { useState } from 'react';
import { useAsync } from 'react-async-hook';

import useConstant from 'use-constant';

interface CallbackProps {
  startX: number;
  startY: number;
  newX: number;
  newY: number;
}

export const useDragDebounce = (onDragEnd: ({ startX, startY, newX, newY }: CallbackProps) => void) => {
  const [params, setParams] = useState({ startX: 0, stopX: 0, startY: 0, stopY: 0 });

  const debouncedFunc = useConstant<any>(() => {
    return AwesomeDebouncePromise(onDragEnd, 800);
  });

  const dragResult = useAsync(async () => {
    debouncedFunc({ params });
  }, [debouncedFunc, params]);

  return {
    dragResult,
    params,
    setParams,
  };
};
