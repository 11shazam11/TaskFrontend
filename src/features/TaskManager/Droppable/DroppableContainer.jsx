// DroppableContainer.jsx
import { useDroppable } from "@dnd-kit/core";

const DroppableContainer = ({ id, children, className }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} id={id} className={className}>
      {children}
    </div>
  );
};

export default DroppableContainer;
