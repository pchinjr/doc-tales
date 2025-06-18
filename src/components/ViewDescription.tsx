import React, { useEffect, useState } from "react";

interface ViewDescriptionProps {
  description: string;
  archetype: string;
}

const ViewDescription: React.FC<ViewDescriptionProps> = ({ description, archetype }) => {
  const [visible, setVisible] = useState(false);
  const [currentDescription, setCurrentDescription] = useState(description);

  useEffect(() => {
    // When description changes, fade out, update text, then fade in
    if (description !== currentDescription) {
      setVisible(false);
      
      // Wait for fade out animation to complete
      const timer = setTimeout(() => {
        setCurrentDescription(description);
        setVisible(true);
      }, 300);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
      // Add an empty return to satisfy TypeScript
      return () => {};
    }
  }, [description, currentDescription]);

  return (
    <div className={`view-description ${visible ? "visible" : "hidden"}`}>
      <p>{currentDescription}</p>
    </div>
  );
};

export default ViewDescription;
