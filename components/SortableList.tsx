'use client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
function Item({
  id,
  title,
  index,
  count,
  move,
  remove,
  children,
}: {
  id: string;
  title: string;
  index: number;
  count: number;
  move: (from: number, to: number) => void;
  remove: () => void;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      data-sortable-id={id}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`entry-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="entry-toolbar">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="icon-button drag-handle"
          {...attributes}
          {...listeners}
          aria-label={`Trascina ${title}`}
        >
          <GripVertical size={17} />
        </button>
        <span>{title}</span>
        <div className="entry-actions">
          <button
            type="button"
            className="icon-button"
            aria-label={`Sposta su ${title}`}
            disabled={index === 0}
            onClick={() => move(index, index - 1)}
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label={`Sposta giù ${title}`}
            disabled={index === count - 1}
            onClick={() => move(index, index + 1)}
          >
            <ArrowDown size={16} />
          </button>
          <button
            type="button"
            className="icon-button danger"
            aria-label={`Elimina ${title}`}
            onClick={remove}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
export default function SortableList({
  items,
  move,
  remove,
  children,
}: {
  items: { id: string; title: string }[];
  move: (from: number, to: number) => void;
  remove: (index: number) => void;
  children: (index: number) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      scrollBehavior: 'auto',
    }),
  );
  function onDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id)
      move(
        items.findIndex((i) => i.id === active.id),
        items.findIndex((i) => i.id === over.id),
      );
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item, index) => (
          <Item
            key={item.id}
            {...item}
            index={index}
            count={items.length}
            move={move}
            remove={() => remove(index)}
          >
            {children(index)}
          </Item>
        ))}
      </SortableContext>
    </DndContext>
  );
}
