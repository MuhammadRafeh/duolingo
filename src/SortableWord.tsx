import React, { ReactElement } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  useSharedValue,
  useDerivedValue,
} from "react-native-reanimated";
import { PanGestureHandler } from "react-native-gesture-handler";
import { between, useVector } from "react-native-redash";

import { calculateLayout, lastOrder, Offset, reorder } from "./Layout";
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
    if (offset.order.value == -1) {
      return true
    } else {
      return false;
    }
  })

  const translation = useVector(offset.originalX.value - MARGIN_LEFT, offset.originalY.value + MARGIN_TOP);

  const isGestureStart = useSharedValue(false);

  const onGestureEvent = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      if (isInPlaceholder){
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
    },
    onEnd: () => {
      isGestureStart.value = false;
    }
  })
  
  // console.log('{}{}', isInPlaceholder.value)
  const translateX = useDerivedValue(() => {
    if (isGestureStart.value) {
      return translation.x.value;
    }
    if (isInPlaceholder.value) {
      return offset.originalX.value - MARGIN_LEFT;
    }
    return offset.x.value;
  })
  const translateY = useDerivedValue(() => {
    if (isGestureStart.value) {
    return translation.y.value; 
    }
    if (isInPlaceholder.value) {
      return offset.originalY.value + MARGIN_TOP;
    }
    return offset.y.value;
  })
  const style = useAnimatedStyle(() => {
    return {
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: isGestureStart ? 100: 0,
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
