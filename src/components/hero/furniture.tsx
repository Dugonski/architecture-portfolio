import type { ReactElement } from 'react';
import { palette } from './palette';
import { Armchair, BookStack, CubbyShelf, EamesChair, FloorLamp, Plant, Puff, SideTable, Stool } from './pieces';

export interface FurnitureKind {
  id: string;
  /** Height in meters, used to size hit areas and spawn heights. */
  height: number;
  element: ReactElement;
}

export const furniture: Record<string, FurnitureKind> = {
  chair: { id: 'chair', height: 0.85, element: <EamesChair /> },
  armchair: { id: 'armchair', height: 0.82, element: <Armchair /> },
  puff: { id: 'puff', height: 0.4, element: <Puff /> },
  puffPink: { id: 'puffPink', height: 0.4, element: <Puff color={palette.pink} /> },
  sideTable: { id: 'sideTable', height: 0.75, element: <SideTable /> },
  lamp: { id: 'lamp', height: 1.55, element: <FloorLamp /> },
  plant: { id: 'plant', height: 1.08, element: <Plant /> },
  shelf: { id: 'shelf', height: 0.5, element: <CubbyShelf /> },
  stool: { id: 'stool', height: 0.48, element: <Stool /> },
  books: { id: 'books', height: 0.2, element: <BookStack /> },
};
