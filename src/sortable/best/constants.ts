import {
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  MeasuringConfiguration,
} from "@dnd-kit/core";

export const DND_MEASURING: MeasuringConfiguration = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

export const DND_SENSOR_CONFIGS = [
  {
    sensor: MouseSensor,
    options: {
      activationConstraint: {
        distance: 7,
      },
    },
  },
  {
    sensor: TouchSensor,
    options: {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    },
  },
];

export const LEVEL_INDENTATION = 12;
export const FOLDER_AUTO_OPEN_DELAY = 800;
export const BETWEEN_FOLDERS_GAP = 10;
