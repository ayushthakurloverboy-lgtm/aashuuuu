import { LyricLine } from '../types';

export const SECRET_DOOR_LYRICS: LyricLine[] = [
  {
    id: 1,
    startTime: 0.0,
    endTime: 7.2,
    text: "As all the fools on parade cavort and carry on for waiting eyes",
    emphasisWords: ["fools on parade", "waiting eyes"],
    illustrationPhase: "waiting_eyes",
  },
  {
    id: 2,
    startTime: 7.3,
    endTime: 15.2,
    text: "Ones you would rather be beside than in front of, but she's never been the kind to be hollowed by the stares",
    emphasisWords: ["rather be beside", "hollowed by the stares"],
    illustrationPhase: "starry_stares",
  },
  {
    id: 3,
    startTime: 15.2,
    endTime: 18.0,
    text: "Fools on parade",
    emphasisWords: ["Fools on parade"],
    illustrationPhase: "parade_crown",
  },
  {
    id: 4,
    startTime: 18.0,
    endTime: 22.0,
    text: "Frolic and dance about to make a gaze",
    emphasisWords: ["dance about", "make a gaze"],
    illustrationPhase: "playful_gaze",
  },
  {
    id: 5,
    startTime: 22.0,
    endTime: 28.0,
    text: "Turn to a scribble on a page by a picture that hold her absence",
    emphasisWords: ["scribble on a page", "picture", "absence"],
    illustrationPhase: "scribble_picture_frame",
  },
  {
    id: 6,
    startTime: 28.0,
    endTime: 31.0,
    text: "But you'd have to think she cares",
    emphasisWords: ["think she cares"],
    illustrationPhase: "sprouting_stem",
  },
  {
    id: 7,
    startTime: 31.0,
    endTime: 37.5,
    text: "Fools on parade",
    emphasisWords: ["Fools on parade"],
    illustrationPhase: "magnificent_bloom",
  },
  {
    id: 8,
    startTime: 37.5,
    endTime: 43.0,
    text: "Fools on parade...",
    emphasisWords: ["Fools on parade..."],
    illustrationPhase: "secret_door_and_butterflies",
  },
];

export const TOTAL_SONG_DURATION = 43.0; // in seconds matching the audio clip
