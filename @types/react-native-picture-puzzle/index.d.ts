declare module 'react-native-picture-puzzle' {
  import { ImageSourcePropType } from 'react-native';

  export interface PicturePuzzleProps {
    size: number;
    pieces: readonly number[];
    hidden: number | null;
    source: ImageSourcePropType;
    onChange: (nextPieces: readonly number[], nextHidden: number | null) => void;
  }

  export const PicturePuzzle: React.FC<PicturePuzzleProps>;
} 