import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface LineGraphProps {
  title?: string;
  labels: string[];
  data: number[];
  color?: string;
  style?: object;
}

const LineGraph: React.FC<LineGraphProps> = ({
  title = 'Line Graph',
  labels,
  data,
  color = '#3b82f6',
  style = {},
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.max(screenWidth, labels.length * 60);

  return (
    <View style={[styles.container, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <LineChart
          data={{
            labels,
            datasets: [{ data }],
          }}
          width={chartWidth}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => {
              const hex = color.replace('#', '');
              const bigint = parseInt(hex, 16);
              const r = (bigint >> 16) & 255;
              const g = (bigint >> 8) & 255;
              const b = bigint & 255;
              return `rgba(${r},${g},${b},${opacity})`;
            },
            labelColor: () => '#333',
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: '#fff',
            },
          }}
          bezier
          style={styles.chart}
          withShadow={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    marginLeft: -10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  chart: {
    borderRadius: 12,
  },
});

export default LineGraph;