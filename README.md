# Library to polygon annoate on image and get cordinates of each point

## Installation command

`npm i img-annotate`

## Storybook Available on GitHub Repository

Clone with following command:
`git clone https://github.com/rinkusam12/img-annotate.git`

`npm i` or `yarn install` or `pnpm install`

`npm run storybook`

### Available Props

type: "inside" | "outside"
onChange?: (coordinates: Coordinates[]) => void;
tags?: Tag[];
enableAnnotate?: boolean;

If type = 'outside' you must provide props
cordinates: Cooridante[];
setCoordinates: React.Dispatch<React.SetStateAction<Cooridante[]>>;

type Point = [number, number];

interface Cooridante {
  title?: string;
  tag: Tag;
  absolutePoints: Point[];
  pathClosed: boolean;
}

/*One on onChange not to be confused with Cooridante*/
interface Coordinates {
  title: string;
  points: Point[];
  tag: string;
}