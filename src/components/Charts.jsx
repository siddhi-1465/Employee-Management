import React, { useState } from 'react';

// --- COLOR PALETTE FOR DEPARTMENTS ---
const DEPT_COLORS = {
  'Engineering': '#4f46e5', // indigo
  'Product': '#0ea5e9',     // sky
  'Design': '#ec4899',      // pink
  'Marketing': '#f59e0b',   // amber
  'HR': '#10b981',          // emerald
  'Default': '#64748b'
};

// 1. DONUT/PIE CHART: Department Distribution
export function DepartmentDistributionChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  
  // Calculate SVG arc parameters
  let cumulativeAngle = 0;
  const radius = 70;
  const strokeWidth = 24;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  const segments = data.map((item, index) => {
    const percentage = total > 0 ? item.value / total : 0;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle;
    cumulativeAngle += percentage * circumference;

    return {
      ...item,
      color: DEPT_COLORS[item.name] || DEPT_COLORS.Default,
      strokeDasharray,
      strokeDashoffset,
      percentage
    };
  });

  return (
    <div style={styles.chartContainer} className="fade-in">
      <h3 style={styles.chartTitle}>Department Distribution</h3>
      <div style={styles.pieWrapper}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {segments.map((seg, idx) => (
            <circle
              key={idx}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              transform={`rotate(-90 ${center} ${center})`}
              style={{
                transition: 'stroke-width 0.2s ease, opacity 0.2s',
                opacity: hoveredIdx === null || hoveredIdx === idx ? 1 : 0.6,
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
          <circle cx={center} cy={center} r={radius - strokeWidth/2 - 2} fill="var(--card-bg)" />
          <text x="100" y="95" textAnchor="middle" dominantBaseline="middle" style={{ ...styles.pieCenterCount, fill: 'var(--text-main)' }}>
            {total}
          </text>
          <text x="100" y="118" textAnchor="middle" dominantBaseline="middle" style={styles.pieCenterLabel}>
            Employees
          </text>
        </svg>

        {/* Legend */}
        <div style={styles.legendContainer}>
          {segments.map((seg, idx) => (
            <div 
              key={idx} 
              style={{
                ...styles.legendItem,
                opacity: hoveredIdx === null || hoveredIdx === idx ? 1 : 0.5,
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span style={{ ...styles.legendDot, backgroundColor: seg.color }}></span>
              <span style={styles.legendText}>
                <strong>{seg.name}</strong>: {seg.value} ({Math.round(seg.percentage * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. LINE CHART: Employee Growth Trend
export function EmployeeGrowthChart({ data = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (data.length === 0) {
    return (
      <div style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>Employee Growth</h3>
        <p style={{ color: 'var(--text-muted)' }}>No growth data available</p>
      </div>
    );
  }

  // Dimension helpers
  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const maxVal = Math.max(...data.map(d => d.employees), 5);
  const minVal = 0;
  const valRange = maxVal - minVal;

  // Generate SVG Points
  const points = data.map((d, index) => {
    const x = paddingX + (index / Math.max(data.length - 1, 1)) * chartW;
    const y = paddingY + chartH - ((d.employees - minVal) / valRange) * chartH;
    return { x, y, data: d };
  });

  // SVG Path description generator (with nice curves)
  const pathD = points.length > 0 
    ? points.reduce((acc, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        // cubic bezier styling for smooth path
        const prev = points[i - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        const cpY1 = prev.y;
        const cpX2 = prev.x + (p.x - prev.x) / 2;
        const cpY2 = p.y;
        return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
      }, '')
    : '';

  // Area path description for linear gradient filling
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div style={styles.chartContainer} className="fade-in">
      <h3 style={styles.chartTitle}>Employee Growth Trend</h3>
      <div style={{ position: 'relative' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
            <line
              key={idx}
              x1={paddingX}
              y1={paddingY + ratio * chartH}
              x2={width - paddingX}
              y2={paddingY + ratio * chartH}
              stroke="rgba(0, 0, 0, 0.05)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area under curve */}
          {points.length > 0 && (
            <path d={areaD} fill="url(#growthGrad)" />
          )}

          {/* Trend Line */}
          {points.length > 0 && (
            <path
              d={pathD}
              fill="transparent"
              stroke="var(--primary)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          )}

          {/* Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint === idx ? 7 : 4}
                fill="var(--bg-color)"
                stroke="var(--primary)"
                strokeWidth="3.5"
                style={{ transition: 'r 0.15s ease', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}

          {/* X Axis Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - 5}
              textAnchor="middle"
              style={styles.axisLabel}
            >
              {p.data.month}
            </text>
          ))}

          {/* Y Axis Max Label */}
          <text x={10} y={paddingY + 4} style={styles.axisLabel}>
            {Math.round(maxVal)}
          </text>
          {/* Y Axis Min Label */}
          <text x={10} y={height - paddingY + 4} style={styles.axisLabel}>
            0
          </text>
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint !== null && points[hoveredPoint] && (
          <div style={{
            ...styles.tooltip,
            left: `${(points[hoveredPoint].x / width) * 100}%`,
            top: `${(points[hoveredPoint].y / height) * 100 - 45}%`
          }}>
            <strong>{points[hoveredPoint].data.month}</strong>
            <div>Total: {points[hoveredPoint].data.employees}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// 3. BAR CHART: User Activity Trends
export function UserActivityChart({ data = [] }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  // Default values if data empty
  const graphData = data.length > 0 ? data : [
    { name: 'Logins', value: 8 },
    { name: 'Updates', value: 14 },
    { name: 'Deletions', value: 3 },
  ];

  const width = 500;
  const height = 200;
  const paddingX = 40;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const maxVal = Math.max(...graphData.map(d => d.value), 5);
  const barWidth = 40;
  const gap = (chartW - (barWidth * graphData.length)) / (graphData.length - 1 || 1);

  return (
    <div style={styles.chartContainer} className="fade-in">
      <h3 style={styles.chartTitle}>User Activity Trends</h3>
      <div style={{ position: 'relative' }}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
            <line
              key={idx}
              x1={paddingX}
              y1={paddingY + ratio * chartH}
              x2={width - paddingX}
              y2={paddingY + ratio * chartH}
              stroke="rgba(0, 0, 0, 0.05)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Bars */}
          {graphData.map((d, idx) => {
            const x = paddingX + idx * (barWidth + gap);
            const barHeight = (d.value / maxVal) * chartH;
            const y = paddingY + chartH - barHeight;

            return (
              <g key={idx}>
                {/* Background shadow bar */}
                <rect
                  x={x}
                  y={paddingY}
                  width={barWidth}
                  height={chartH}
                  fill="rgba(0, 0, 0, 0.01)"
                  rx="6"
                />
                {/* Value Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={hoveredBar === idx ? 'var(--primary)' : 'var(--primary-light)'}
                  stroke="var(--primary)"
                  strokeWidth="1.5"
                  rx="6"
                  style={{
                    transition: 'fill 0.2s ease, y 0.3s ease, height 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                />
                {/* Labels */}
                <text
                  x={x + barWidth / 2}
                  y={height - 5}
                  textAnchor="middle"
                  style={styles.axisLabel}
                >
                  {d.name}
                </text>
              </g>
            );
          })}

          {/* Y Axis Max Label */}
          <text x={10} y={paddingY + 4} style={styles.axisLabel}>
            {Math.round(maxVal)}
          </text>
          {/* Y Axis Min Label */}
          <text x={10} y={height - paddingY + 4} style={styles.axisLabel}>
            0
          </text>
        </svg>

        {/* Tooltip */}
        {hoveredBar !== null && graphData[hoveredBar] && (
          <div style={{
            ...styles.tooltip,
            left: `${((paddingX + hoveredBar * (barWidth + gap) + barWidth / 2) / width) * 100}%`,
            top: `${((paddingY + chartH - (graphData[hoveredBar].value / maxVal) * chartH) / height) * 100 - 45}%`
          }}>
            <strong>{graphData[hoveredBar].name}</strong>
            <div>Count: {graphData[hoveredBar].value}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// 4. ATTENDANCE RADIAL/PROGRESS RING WIDGET
export function AttendanceRadialWidget({ stats = {} }) {
  const { present = 0, late = 0, absent = 0, totalActive = 0 } = stats;
  const clockedIn = present + late;
  const rate = totalActive > 0 ? Math.round((clockedIn / totalActive) * 100) : 0;

  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (rate / 100) * circumference;

  return (
    <div style={styles.widgetCard} className="glass-card fade-in">
      <div style={styles.widgetHeader}>
        <h4 style={styles.widgetTitle}>Today's Attendance Rate</h4>
        <span className="badge badge-active">{rate}% Active</span>
      </div>

      <div style={styles.widgetBody}>
        {/* SVG Progress Ring */}
        <div style={styles.ringWrapper}>
          <svg height={radius * 2} width={radius * 2}>
            <circle
              stroke="rgba(0, 0, 0, 0.05)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="var(--success)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeLinecap="round"
              transform={`rotate(-90 ${radius} ${radius})`}
            />
          </svg>
          <div style={styles.ringText}>
            <span style={styles.ringPercent}>{rate}%</span>
          </div>
        </div>

        {/* Indicators */}
        <div style={styles.indicators}>
          <div style={styles.indicatorRow}>
            <span style={{ ...styles.indicatorDot, backgroundColor: 'var(--success)' }}></span>
            <span style={styles.indicatorLabel}>On Time:</span>
            <span style={styles.indicatorValue}>{present}</span>
          </div>
          <div style={styles.indicatorRow}>
            <span style={{ ...styles.indicatorDot, backgroundColor: 'var(--warning)' }}></span>
            <span style={styles.indicatorLabel}>Late Arrival:</span>
            <span style={styles.indicatorValue}>{late}</span>
          </div>
          <div style={styles.indicatorRow}>
            <span style={{ ...styles.indicatorDot, backgroundColor: 'var(--danger)' }}></span>
            <span style={styles.indicatorLabel}>Absent:</span>
            <span style={styles.indicatorValue}>{absent}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  chartContainer: {
    backgroundColor: 'var(--card-bg)',
    border: 'var(--card-border)',
    boxShadow: 'var(--glass-shadow)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    flex: 1,
    minWidth: '290px',
  },
  chartTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    color: 'var(--text-main)',
  },
  pieWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  },
  pieCenterCount: {
    fontSize: '24px',
    fontWeight: '800',
  },
  pieCenterLabel: {
    fontSize: '10px',
    fontWeight: '600',
    fill: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  legendContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'opacity 0.2s',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  legendText: {
    fontSize: '0.8rem',
    color: 'var(--text-main)',
  },
  axisLabel: {
    fontSize: '9px',
    fontWeight: '600',
    fill: 'var(--text-muted)',
  },
  tooltip: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--accent)',
    color: 'var(--bg-color)',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.78rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 10,
    pointerEvents: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  widgetCard: {
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    padding: '24px',
    borderRadius: 'var(--radius-lg)',
    flex: 1,
    minWidth: '290px',
  },
  widgetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  widgetTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
  },
  widgetBody: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: '16px',
    flexWrap: 'wrap',
  },
  ringWrapper: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  ringPercent: {
    fontSize: '1.25rem',
    fontWeight: '800',
  },
  indicators: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    maxWidth: '180px',
  },
  indicatorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
  },
  indicatorDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  indicatorLabel: {
    color: 'var(--text-muted)',
    flex: 1,
  },
  indicatorValue: {
    fontWeight: '700',
  },
};
