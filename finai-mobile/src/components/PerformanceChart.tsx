import { useState } from 'react';
import { Text, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';
import { money } from '../lib/format';
import { brand, useTheme } from '../lib/theme';

type Point = { month: string; value: number };

const HEIGHT = 180;
const PAD = { top: 16, bottom: 26, side: 8 };

/** Smooth curve through the points (Catmull-Rom converted to cubic Béziers). */
function smoothPath(points: { x: number; y: number }[]) {
  return points.reduce((path, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const p0 = points[i - 2] ?? points[i - 1];
    const p1 = points[i - 1];
    const p3 = points[i + 1] ?? p;
    const c1x = p1.x + (p.x - p0.x) / 6;
    const c1y = p1.y + (p.y - p0.y) / 6;
    const c2x = p.x - (p3.x - p1.x) / 6;
    const c2y = p.y - (p3.y - p1.y) / 6;
    return `${path} C ${c1x},${c1y} ${c2x},${c2y} ${p.x},${p.y}`;
  }, '');
}

/** Area chart of portfolio value. Drag across it to read each month. */
export default function PerformanceChart({ data }: { data: Point[] }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  const min = Math.min(...data.map((d) => d.value));
  const max = Math.max(...data.map((d) => d.value));
  const range = max - min || 1;
  const chartHeight = HEIGHT - PAD.top - PAD.bottom;
  const points = data.map((d, i) => ({
    ...d,
    x: PAD.side + (i / (data.length - 1)) * Math.max(0, width - PAD.side * 2),
    y: PAD.top + chartHeight - ((d.value - min) / range) * chartHeight * 0.9 - chartHeight * 0.05,
  }));
  const selected = points[active ?? points.length - 1];

  function track(event: GestureResponderEvent) {
    if (!width) return;
    const step = (width - PAD.side * 2) / (data.length - 1);
    const index = Math.round((event.nativeEvent.locationX - PAD.side) / step);
    setActive(Math.max(0, Math.min(data.length - 1, index)));
  }

  const line = width ? smoothPath(points) : '';
  const baseline = PAD.top + chartHeight;
  const area = width ? `${line} L ${points[points.length - 1].x},${baseline} L ${points[0].x},${baseline} Z` : '';

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] }}>{money(selected.value)}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{selected.month}</Text>
      </View>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={track}
        onResponderMove={track}
        onResponderRelease={() => setActive(null)}
        onResponderTerminate={() => setActive(null)}
        style={{ height: HEIGHT }}
      >
        {width > 0 && (
          <Svg width={width} height={HEIGHT}>
            <Defs>
              <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={brand.indigo} stopOpacity={colors.isDark ? 0.35 : 0.22} />
                <Stop offset="1" stopColor={brand.indigo} stopOpacity={0} />
              </LinearGradient>
              <LinearGradient id="line" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={brand.blue} />
                <Stop offset="0.55" stopColor={brand.indigo} />
                <Stop offset="1" stopColor={brand.purple} />
              </LinearGradient>
            </Defs>
            <Path d={area} fill="url(#area)" />
            <Path d={line} fill="none" stroke="url(#line)" strokeWidth={3} strokeLinecap="round" />
            <Line x1={selected.x} x2={selected.x} y1={PAD.top} y2={baseline} stroke={colors.border} strokeWidth={1} strokeDasharray="4 4" />
            <Circle cx={selected.x} cy={selected.y} r={9} fill={brand.indigo} fillOpacity={0.2} />
            <Circle cx={selected.x} cy={selected.y} r={5} fill="#fff" stroke={brand.indigo} strokeWidth={3} />
          </Svg>
        )}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
          {data.map((d, i) => (
            <Text
              key={d.month}
              style={{
                fontSize: 11,
                color: i === (active ?? data.length - 1) ? colors.text : colors.textSubtle,
                fontWeight: i === (active ?? data.length - 1) ? '700' : '400',
              }}
            >
              {d.month}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
