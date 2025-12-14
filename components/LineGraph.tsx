import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import Colors from '@/constants/colors';

interface LineGraphProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  showGrid?: boolean;
}

export default function LineGraph({ 
  data, 
  width = 300, 
  height = 120,
  color = Colors.primary,
  showDots = true,
  showGrid = true
}: LineGraphProps) {
  const padding = 20;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;
  
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * graphWidth;
    const y = padding + graphHeight - ((value - min) / range) * graphHeight;
    return { x, y, value };
  });
  
  const pathData = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    
    const prevPoint = points[index - 1];
    const cpx1 = prevPoint.x + (point.x - prevPoint.x) / 3;
    const cpy1 = prevPoint.y;
    const cpx2 = prevPoint.x + (2 * (point.x - prevPoint.x)) / 3;
    const cpy2 = point.y;
    
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${point.x} ${point.y}`;
  }, '');
  
  const areaPath = `${pathData} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
  
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {showGrid && (
          <>
            {[0, 0.33, 0.66, 1].map((ratio, index) => {
              const y = padding + graphHeight * ratio;
              return (
                <Line
                  key={index}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="rgba(115, 93, 255, 0.08)"
                  strokeWidth={1}
                />
              );
            })}
          </>
        )}
        
        <Path
          d={areaPath}
          fill={`${color}15`}
        />
        
        <Path
          d={pathData}
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {showDots && points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={Colors.white}
            stroke={color}
            strokeWidth={3}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
