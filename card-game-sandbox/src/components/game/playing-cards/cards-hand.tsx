import { Box, BoxProps } from "@mui/material";
import { RFlex } from "../../ui/flex";
import React, { useEffect, useRef, useState } from "react";
import { PlayingCard } from "./playing-card";
import {
  BeforeCapture,
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  ResponderProvided,
} from "react-beautiful-dnd";

export const CardHand = ({
  cards,
  onReorder,
  cardWidth = 120,
  containerWidth = "100%",
}: {
  cards: (PlayingCard | "back")[];
  onReorder: (source: number, dest: number) => void;
  cardWidth?: number;
  containerWidth?: BoxProps["width"];
}) => {
  const cardRefs = useRef<
    Record<string, React.MutableRefObject<HTMLDivElement | null>>
  >({});

  const handleDragEnd = (result: DropResult) => {
    const style = cardRefs.current[result.draggableId].current!.style;
    style.transition = "";
    style.width = "";

    if (result.destination) {
      const i = result.destination!.index;
      const j = result.source.index;
      onReorder(i, j);
    }
  };

  const handleBeforeCapture = (before: BeforeCapture) => {
    const style = cardRefs.current[before.draggableId].current!.style;
    style.transition = `none`;
    style.width = `${cardWidth + 2}px`;
  };

  const [currentHover, setCurrentHover] = useState("");
  const [nextHover, setNextHover] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isTransitioning && nextHover !== currentHover) {
      setCurrentHover(nextHover);
      setIsTransitioning(true);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }
  }, [isTransitioning, nextHover, currentHover]);

  return (
    <DragDropContext
      onDragEnd={handleDragEnd}
      onBeforeCapture={handleBeforeCapture}
    >
      <Droppable droppableId="myCards" direction="horizontal">
        {(provided, snapshot) => (
          <RFlex
            {...provided.droppableProps}
            ref={provided.innerRef}
            width={containerWidth}
          >
            {cards.map((card, i) => (
              <Draggable draggableId={`card-${card}`} index={i} key={card}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Box
                      position="relative"
                      ref={
                        (cardRefs.current[`card-${card}`] ??= React.createRef())
                      }
                      sx={{
                        width:
                          card === currentHover ? cardWidth + 2 : cardWidth / 2,
                        transition: "width 0.2s",
                      }}
                      onMouseEnter={() =>
                        !snapshot.isDraggingOver && setNextHover(card)
                      }
                      onMouseLeave={() =>
                        !snapshot.isDraggingOver &&
                        setNextHover((nextHover) =>
                          nextHover === card ? "" : nextHover
                        )
                      }
                    >
                      <Box position="relative" width={cardWidth}>
                        <PlayingCard card={card!} width={cardWidth} />
                      </Box>
                    </Box>
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </RFlex>
        )}
      </Droppable>
    </DragDropContext>
  );
};
