// src/components/UI/LinkList_CSR.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Accordion, AccordionItem } from '@nextui-org/accordion';
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

export default function LinkList_CSR<T extends Item>({
  items,
  title,
  paramName,
}: ListProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isShiftDown, setIsShiftDown] = useState(false);

  const selectedItems = searchParams.getAll(paramName);

  // function getUpdatedHref(itemId: string): string {
  //   const newSelectedItems = isShiftDown
  //     ? [...selectedItems, itemId]
  //     : [itemId];

  //   return `?${newSelectedItems.map((id) => `${paramName}=${id}`).join('&')}`;
  // }

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
    <div>
      <Accordion isCompact={true}>
        <AccordionItem title={title}>
          <div className={styles.linkList}>
            {items.map((item) => (
              <Link
                href={getUpdatedHref(item.slug)}
                key={item.id}
                className={`${styles.linkListItem} ${
                  selectedItems.includes(item.slug) ? styles.selected : ''
                }`}
                onClick={(event) => handleClick(event, item.slug)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
