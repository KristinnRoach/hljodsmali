// src/components/UI/LinkList.tsx

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './LinkList.module.scss';

type Item = {
  name: string;
  id: string;
  [key: string]: any;
};

type ListProps<T> = {
  items: T[];
  title: string;
  paramName: string;
};

export default function LinkList<T extends Item>({
  items,
  title,
  paramName,
}: ListProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isShiftDown, setIsShiftDown] = useState(false);

  // Memoize items optimal ?
  const memoizedItems = useMemo(() => items, [items]);
  const selectedItems = searchParams.getAll(paramName);

  function getUpdatedHref(itemSlug: string): string {
    const newSelectedSlugs = isShiftDown
      ? [...selectedItems, itemSlug]
      : [itemSlug];

    return `?${newSelectedSlugs
      .map((slug) => `${paramName}=${slug}`)
      .join('&')}`;
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Shift') {
      setIsShiftDown(true);
    }
  }

  function handleKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Shift') {
      setIsShiftDown(false);
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    itemId: string
  ) => {
    event.preventDefault();
    const href = getUpdatedHref(itemId);
    router.replace(href);
  };

  return (
    <>
      {memoizedItems.map((item) => (
        <Link
          href={getUpdatedHref(item.slug)}
          key={item.id}
          // className={`${styles.linkListItem} ${
          //   selectedItems.includes(item.slug) ? styles.selected : ''
          // }`}
          onClick={(event) => handleClick(event, item.slug)}
        >
          {item.name}
        </Link>
      ))}
    </>
  );
}

// function getUpdatedHref(itemId: string): string {
//   const newSelectedItems = isShiftDown
//     ? [...selectedItems, itemId]
//     : [itemId];

//   return `?${newSelectedItems.map((id) => `${paramName}=${id}`).join('&')}`;
// }
