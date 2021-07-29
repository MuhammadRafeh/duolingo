import React, { ReactElement } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  useSharedValue,
  useDerivedValue,
  useAnimatedReaction,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import { between, useVector } from "react-native-redash";

import { calculateLayout, calculateOrder, lastOrder, Offset, reorder } from "./Layout";
import Placeholder, { MARGIN_TOP, MARGIN_LEFT } from "./components/Placeholder";

interface SortableWordProps {
  offsets: Offset[];
  children: ReactElement<{ id: number }>;
  index: number;
  containerWidth: number;
}

const SortableWord = ({ offsets, index, children, containerWidth }: SortableWordProps) => {
  const offset = offsets[index];
  // offsets.forEach((element) => console.log(element.order.value))
  
  const isInPlaceholder = useDerivedValue(() => {
    console.log('asdasd',offset.order.value)
    if (offset.order.value == -1) {
      return true
    } else {
      return false;
    }
  })
  // console.log(isInPlaceholder)

  // const translation = useVector(offset.originalX.value - MARGIN_LEFT, offset.originalY.value + MARGIN_TOP);
  const translation = useVector();

  const isGestureStart = useSharedValue(false);

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      if (isInPlaceholder.value){
        // console.log('true trues', isInPlaceholder)
        translation.x.value = offset.originalX.value  - MARGIN_LEFT;
        translation.y.value = offset.originalY.value  + MARGIN_TOP;
      } else {
        // ctx.x = translation.x.value;
        // ctx.y = translation.y.value;
        translation.x.value = offset.x.value;
        translation.y.value = offset.y.value;
      }
      ctx.x = translation.x.value;
      ctx.y = translation.y.value;
      isGestureStart.value = true
    },
    onActive: ({translationX, translationY}, ctx) => {
      translation.x.value = ctx.x + translationX;
      translation.y.value = ctx.y + translationY;
      if (isInPlaceholder.value && translation.y.value < 100){// here it is on line
        // offset.order.value = calculateOrder(offsets)
        offset.order.value = calculateOrder(offsets)
        // console.log('aaaaaaaaaasdasd')
        calculateLayout(offsets, containerWidth);
      } else if (!isInPlaceholder.value && translation.y.value > 100){
        offset.order.value = -1;
        // calculateLayout(offsets, containerWidth);
        console.log('aaaaaaaaa')
      }
    },
    onEnd: () => {
      isGestureStart.value = false;
      translation.x.value = withSpring(offset.x.value)
      translation.y.value = withSpring(offset.y.value)
    }
  })
  
  // console.log('{}{}', isInPlaceholder.value)
  const translateX = useDerivedValue(() => {
    if (isGestureStart.value) {
      return translation.x.value;
    }
    return withSpring(isInPlaceholder.value ? offset.originalX.value - MARGIN_LEFT: offset.x.value)
  })
  const translateY = useDerivedValue(() => {
    if (isGestureStart.value) {
    return translation.y.value; 
    }
    return withSpring(isInPlaceholder.value ? offset.originalY.value + MARGIN_TOP: offset.y.value)
  })
  const style = useAnimatedStyle(() => {
    return {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: isGestureStart.value ? 100: 0,
      width: offset.width.value,
      height: offset.height.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value }
      ]
    };
  });
  return (
    <>
      <Placeholder offset={offset} />
      <Animated.View style={style}>
        <PanGestureHandler onGestureEvent={onGestureEvent}>
          <Animated.View style={StyleSheet.absoluteFill}>
            {children}
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </>
  );
};

export default SortableWord;
