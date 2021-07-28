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
  const isInPlaceholder = useDerivedValue(() => {
    if (offset.order.value == -1) {
      return true
    } else {
      return false;
    }
  })
  const translateX = useDerivedValue(() => {
    if (isInPlaceholder.value) {
      return offset.originalX.value - MARGIN_LEFT ;
    }
    return offset.x.value;
  })
  const translateY = useDerivedValue(() => {
    if (isInPlaceholder.value) {
      return offset.originalY.value + MARGIN_TOP ;
    }
    return offset.y.value;
  })
  const style = useAnimatedStyle(() => {
    return {
      position: "absolute",
      top: 0,
      left: 0,
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
        <Animated.View style={StyleSheet.absoluteFill}>
          {children}
        </Animated.View>
      </Animated.View>
    </>
  );
};

export default SortableWord;
