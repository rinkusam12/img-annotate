import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useKey, useMeasure } from 'react-use';
import tinycolor from 'tinycolor2';
type Point = [number, number];
export interface Cooridante {
  title?: string;
  tag: Tag;
  absolutePoints: Point[];
  pathClosed: boolean;
}

interface Tag {
  title: string;
  color: string;
}

export interface Coordinates {
  title: string;
  points: Point[];
  tag: Tag;
}

export interface CommonImageAnnotateProps {
  imgSrc: string;
  onChange?: (coordinates: Coordinates[]) => void;
  tags?: Tag[];
  enableAnnotate?: boolean;
  cordinates?: Cooridante[];
}


export const ImageAnnotate: React.FC<
  CommonImageAnnotateProps
> = ({ imgSrc, tags, enableAnnotate, onChange, ...props }) => {
  const [cordinates, setCoordinates] = useState<Cooridante[]>(props.cordinates || []);


  useEffect(() => {
    if (props.cordinates) {
      setCoordinates(props.cordinates)
    }
  }, [props.cordinates])

  const tgs = useMemo(() => {
    return (
      tags || [
        {
          title: 'buns',
          color: 'red',
        },
        {
          title: 'not-buns',
          color: 'blue',
        },
      ]
    );
  }, [tags]);
  const ref = useRef<HTMLImageElement | null>();
  const [startAnnotate, setStartAnnotate] = useState(enableAnnotate || false);

  useEffect(() => {
    setStartAnnotate(enableAnnotate || false);
  }, [enableAnnotate]);

  const [selectedPolygon, setSelectedPoloygon] = useState<{
    index: number;
    height: number;
    width: number;
    top: number;
    left: number;
    el: SVGPolylineElement;
  } | null>(null);

  const [imageRef, dimension] = useMeasure();

  const [showInput, setShowInput] = useState(false);

  useKey(
    'Delete',
    () => {
      if (selectedPolygon) {
        const existingCoordintes = [...cordinates];
        existingCoordintes.splice(selectedPolygon.index, 1);
        setCoordinates(existingCoordintes);
        setSelectedPoloygon(null);
      }
    },
    {},
    [selectedPolygon]
  );

  useEffect(() => {
    onChange?.(
      cordinates?.map(c => {
        return {
          title: c.title || '',
          points: c.absolutePoints,
          tag: c.tag,
        };
      })
    );
  }, [cordinates]);

  const updateSize = useCallback(() => {
    if (selectedPolygon) {
      updateSelectedBoxSize(selectedPolygon.el, selectedPolygon.index);
    }
  }, [selectedPolygon]);

  useEffect(() => {
    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, [updateSize]);

  const dragging = useRef(false);

  const getXY = (e: MouseEvent) => {
    const rect = ref?.current?.getBoundingClientRect();
    if (rect) {
      const width = rect.width;
      const height = rect.height;
      const xCordinate = (e.clientX - rect.x) / width;
      const yCordinate = (e.clientY - rect.y) / height;
      return { xCordinate, yCordinate, width, height };
    } else {
      throw new Error('Image element not defined');
    }
  };

  const onStartDrawing = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (selectedPolygon) {
      setSelectedPoloygon(null);
      return;
    }
    if (!startAnnotate) return;
    const existingCoordintes = [...cordinates];
    let indexToChange =
      existingCoordintes.length !== 0 ? existingCoordintes.length - 1 : 0;
    if (existingCoordintes[indexToChange]?.pathClosed) {
      indexToChange = indexToChange + 1;
      existingCoordintes[indexToChange] = {
        absolutePoints: [],
        pathClosed: false,
        tag: tgs[0],
      };
    }
    const xy = getXY((e as unknown) as MouseEvent);

    existingCoordintes[indexToChange] = existingCoordintes[indexToChange] || {};
    existingCoordintes[indexToChange].tag = tgs[0];
    existingCoordintes[indexToChange].absolutePoints = [
      ...(existingCoordintes[indexToChange].absolutePoints || []),
      [xy.xCordinate, xy.yCordinate],
    ];
    setCoordinates(existingCoordintes);
  };

  const closePath = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!startAnnotate || selectedPolygon !== null) return;
    e.preventDefault();
    const existingCoordintes = [...cordinates];
    let index = existingCoordintes.length - 1;
    existingCoordintes[index].pathClosed = true;
    setCoordinates(existingCoordintes);
  };

  const updateSelectedBoxSize = (el: SVGPolylineElement, index: number) => {
    const polygonRect = el.getBoundingClientRect();
    const imageRect = ref!.current!.getBoundingClientRect();
    setSelectedPoloygon({
      index: index,
      width: polygonRect.width,
      height: polygonRect.height,
      left: polygonRect.left - imageRect.left,
      top: polygonRect.top - imageRect.top,
      el: el,
    });
  };

  return (
    <div>
      <div style={{ position: 'relative' }}>
        {selectedPolygon && (
          <div
            id="selection-box"
            style={{
              border: '1px dashed',
              background: 'rgba(0,0,0,0.1)',
              position: 'absolute',

              zIndex: 10,
              // pointerEvents: "none",
              transform: `translate(${selectedPolygon.left}px, ${selectedPolygon.top}px)`,
              width: selectedPolygon.width,
              height: selectedPolygon.height,
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                cursor: 'pointer',
                margin: '0.2rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.8)',
              }}
              onClick={() => {
                setShowInput(!showInput);
              }}
            ></div>
            <div
              style={{
                width: '200px',
                background: 'rgba(255,255,255,0.95)',
                maxHeight: !showInput ? 0 : '1000px',
                transition: 'all 0.3s easeIn',
                willChange: 'height',
                overflow: 'hidden',
              }}
            >
              <select
                style={{
                  width: '100%',
                  height: '30px',
                  margin: '0',
                  fontSize: '1.3rem',
                }}
                onChange={e => {
                  const cords = [...cordinates];

                  cords[selectedPolygon.index].tag = tgs[+e.target.value];
                  setCoordinates(cords);
                }}
              >
                {tgs.map((tag, i) => (
                  <option key={tag.title} value={i}>
                    {tag.title}
                  </option>
                ))}
              </select>
              <input
                style={{
                  width: '100%',
                  height: '30px',
                  margin: '0.5rem 0',
                  fontSize: '1.3rem',
                }}
                value={cordinates[selectedPolygon.index]?.title}
                onChange={e => {
                  const cords = [...cordinates];

                  cords[selectedPolygon.index].title = e.target.value;
                  setCoordinates(cords);
                }}
                placeholder="Title"
                type="text"
              />
            </div>
          </div>
        )}
        {cordinates.map((c, index) => (
          <div style={{ position: 'absolute', zIndex: 20 }} key={index}>
            {c?.absolutePoints?.map((x, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  cursor:
                    selectedPolygon?.index === index ? 'move' : 'crosshair',
                  backgroundColor: tinycolor(c?.tag?.color || '#000')
                    .setAlpha(0.65)
                    .toRgbString(),
                  top: '-6px',
                  left: '-6px',
                  transform: `translate(${x[0] * dimension.width}px, ${x[1] *
                    dimension.height}px)`,
                }}
                onClick={e => {
                  if (
                    i === 0 ||
                    (i === c.absolutePoints.length - 1 && !c.pathClosed)
                  ) {
                    closePath(
                      (e as unknown) as React.MouseEvent<
                        SVGSVGElement,
                        MouseEvent
                      >
                    );
                  }
                }}
                onMouseDown={() => {
                  dragging.current = true;
                }}
                onMouseMove={e => {
                  if (selectedPolygon?.index === index && dragging.current) {
                    const xy = getXY((e as unknown) as MouseEvent);
                    const exCords = [...cordinates];
                    exCords[index].absolutePoints[i][0] = xy.xCordinate;
                    exCords[index].absolutePoints[i][1] = xy.yCordinate;
                    setCoordinates(exCords);
                    updateSelectedBoxSize(selectedPolygon.el, index);
                  }
                }}
                onMouseUp={() => {
                  dragging.current = false;
                }}
              ></span>
            ))}
          </div>
        ))}
        <svg
          width={dimension.width}
          height={dimension.height}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: '1',
            // pointerEvents: "none",
          }}
          onClick={onStartDrawing}
          onDoubleClick={closePath}
        >
          {cordinates.map((c, i) => (
            <Fragment key={i}>
              <polyline
                onClick={e => {
                  e.stopPropagation();
                  updateSelectedBoxSize(e.currentTarget, i);
                }}
                key={i}
                points={
                  c.pathClosed
                    ? [...c?.absolutePoints, c.absolutePoints[0]]
                      .map(x => [
                        x[0] * dimension.width,
                        x[1] * dimension.height,
                      ])
                      .map(z => z.join(','))
                      .join(' ')
                    : c?.absolutePoints
                      .map(x => [
                        x[0] * dimension.width,
                        x[1] * dimension.height,
                      ])
                      .map(z => z.join(','))
                      .join(' ')
                }
                style={{
                  fill: tinycolor(c?.tag?.color || '#000')
                    .setAlpha(0.3)
                    .toRgbString(),
                  stroke: tinycolor(c?.tag?.color || '#000')
                    .setAlpha(0.5)
                    .toRgbString(),
                  strokeWidth: '2px',
                }}
              >
                {c.title && <title>{c.title}</title>}
              </polyline>
            </Fragment>
          ))}
        </svg>
        <img
          ref={r => {
            if (r) {
              ref.current = r;
              imageRef(r);
            }
          }}
          style={{ width: '100%', height: 'auto' }}
          src={imgSrc}
          alt="Canvas Image"
        />
      </div>
    </div>
  );
};

ImageAnnotate.defaultProps = {
  cordinates: [],
};
