import { useState, useRef, useCallback } from 'react';
import type { PageType } from '../types';

export function useNavigation(initial: PageType = 'home') {
  const [currentPage, setCurrentPage] = useState<PageType>(initial);
  const history = useRef<PageType[]>([initial]);

  const navigate = useCallback((page: PageType) => {
    history.current.push(page);
    setCurrentPage(page);
  }, []);

  const goBack = useCallback(() => {
    if (history.current.length > 1) {
      history.current.pop();
      const prev = history.current[history.current.length - 1];
      setCurrentPage(prev);
    } else {
      history.current = ['home'];
      setCurrentPage('home');
    }
  }, []);

  const reset = useCallback((page: PageType = 'home') => {
    history.current = [page];
    setCurrentPage(page);
  }, []);

  return { currentPage, navigate, goBack, reset };
}
