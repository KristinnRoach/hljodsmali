// src/components/UI/LinkList.tsx

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Icon from './Basic/Icon';
import { Save, Trash2 } from 'react-feather';
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
  itemsPerPage?: number;
  onDelete: (id: string) => void;
  onSave: (id: string) => void;
};

export default function LinkList<T extends Item>({
  items,
  title,
  paramName,
  itemsPerPage = 10,
  onDelete,
  onSave,
}: ListProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isShiftDown, setIsShiftDown] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  // Memoize items optimal ?
  const memoizedItems = useMemo(() => items, [items]);
  const selectedItems = searchParams.getAll(paramName);

  const totalPages = Math.ceil(memoizedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = memoizedItems.slice(startIndex, endIndex);

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

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev === 1 ? totalPages : prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev === totalPages ? 1 : prev + 1));
  };

  return (
    <section className={styles.linkList}>
      {currentItems.map((item) => (
        <div key={item.id} className={styles.itemContainer}>
          <Link
            href={getUpdatedHref(item.slug)}
            key={item.id}
            className={`${styles.item} ${
              selectedItems.includes(item.slug) ? styles.selected : ''
            }`}
            onClick={(event) => handleClick(event, item.slug)}
          >
            {item.name}
          </Link>
          <div className={styles.buttons}>
            <button
              onClick={() => onSave(item.id)}
              className={styles.saveButton}
            >
              <Save size={16} className={styles.saveIcon} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className={styles.deleteButton}
            >
              <Trash2 size={16} className={styles.deleteIcon} />
            </button>
          </div>
        </div>
      ))}
      <div className={styles.pagination}>
        <button onClick={handlePrevPage}>{'<'}</button>
        <span>{`${currentPage} / ${totalPages}`}</span>
        <button onClick={handleNextPage}>{'>'}</button>
      </div>
    </section>
  );
}

// function getUpdatedHref(itemId: string): string {
//   const newSelectedItems = isShiftDown
//     ? [...selectedItems, itemId]
//     : [itemId];

//   return `?${newSelectedItems.map((id) => `${paramName}=${id}`).join('&')}`;
// }
