/* eslint-disable react-hooks/rules-of-hooks */
import React, { ReactElement, useState } from "react";
import { View, StyleSheet, Dimensions, LayoutChangeEvent } from "react-native";
import { useSharedValue, runOnUI } from "react-native-reanimated";

import SortableWord from "./SortableWord";
import Lines from "./components/Lines";
import { calculateLayout } from "./Layout";

const margin = 32;
const containerWidth = Dimensions.get("window").width - margin * 2;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});

interface WordListProps {
  children: ReactElement<{ id: number }>[];
}

const WordList = ({ children }: WordListProps) => {
  const [ready, setReady] = useState(false);
  const offsets = children.map(() => ({
    order: useSharedValue(-1), //-1 if it has no order
    width: useSharedValue(0),
    height: useSharedValue(0),
    x: useSharedValue(0),
    y: useSharedValue(0),
    originalX: useSharedValue(0),
    originalY: useSharedValue(0),
  }));
  if (!ready) {
    return (
      <View style={styles.row}>
        {children.map((child, index) => { //index is a Order
          return <View
            key={index}
            onLayout={({ nativeEvent: { layout: { width, height, x, y } } }) => {
              const offset = offsets[index];
              offset.order.value = index;
              offset.width.value = width;
              offset.height.value = height;
              offset.originalX.value = x;
              offset.originalY.value = y;
              console.log(x, y)
              runOnUI(() => {
                console.log(23)
                if (offsets.length == (index + 1)) {
                  setReady(true);
                  calculateLayout(offsets, containerWidth);
                }
              })();
            }}
          >
            {child}
          </View>;
        })}
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Lines />
      {children.map((child, index) => (
        <SortableWord
          key={index}
          offsets={offsets}
          index={index}
          containerWidth={containerWidth}
        >
          {child}
        </SortableWord>
      ))}
    </View>
  );
};

export default WordList;
