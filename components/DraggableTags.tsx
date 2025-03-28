import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BsGripVertical } from 'react-icons/bs';

interface DraggableTagsProps {
  tags: string[];
  onReorder: (newTags: string[]) => void;
}

interface SortableTagProps {
  id: string;
  tag: string;
}

const SortableTag: React.FC<SortableTagProps> = ({ id, tag }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2
        px-3 py-1.5
        bg-gray-200
        rounded-full
        text-sm
        font-semibold
        text-gray-700
        select-none
        cursor-grab
        active:cursor-grabbing
        ${isDragging ? 'shadow-lg ring-2 ring-[#bc95d4]' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      <BsGripVertical className="text-gray-500" />
      <span>{tag}</span>
    </div>
  );
};

const DraggableTags: React.FC<DraggableTagsProps> = ({ tags, onReorder }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tags.findIndex((tag) => `${tag}` === active.id);
      const newIndex = tags.findIndex((tag) => `${tag}` === over.id);
      onReorder(arrayMove(tags, oldIndex, newIndex));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tags.map(tag => `${tag}`)}
        strategy={rectSortingStrategy}
      >
        <div className="flex flex-wrap gap-2 p-2 min-h-[50px] bg-white rounded-lg">
          {tags.map((tag) => (
            <SortableTag key={tag} id={`${tag}`} tag={tag} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableTags; 