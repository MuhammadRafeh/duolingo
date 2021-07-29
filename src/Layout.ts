import { SharedValues } from "../components/AnimatedHelpers";

export type Offset = SharedValues<{
  order: number;
  width: number;
  height: number;
  x: number;
  y: number;
  originalX: number;
  originalY: number;
}>;

const isNotInPlaceholder = (order: number) => {
  "worklet";
  return order !== -1;
}

const sortAscending = (a: Offset, b: Offset) => {
  "worklet";
  return a.order.value > b.order.value ? 1: -1;
}

export const calculateLayout = (inputOffsets: Offset[], containerWidth: number) => {
  "worklet";

  const offsets = inputOffsets.filter(isNotInPlaceholder).sort(sortAscending);

  if (offsets.length === 0) return;

  const height = offsets[0].height.value;
  let lineNumber = 0;
  let lineBreakAt = 0;

  offsets.forEach((offset: Offset, index: number) => {
    //totalWidth is the width of the all words that are on line
    const totalWidth = offsets.slice(lineBreakAt, index).reduce((acc: number, o) => acc + o.width.value, 0);
    if (totalWidth + offset.width.value > containerWidth){
      lineNumber += 1;
      lineBreakAt = index;
      offset.x.value = 0;
    } else {
      offset.x.value = totalWidth;
    }
    offset.y.value = height * lineNumber
  });
}
