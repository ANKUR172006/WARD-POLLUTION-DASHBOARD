/**
 * Pollution Trend Prediction Utility
 * 
 * This is a simple, explainable rule-based prediction model for short-term
 * pollution trend analysis (next-day trend prediction).
 * 
 * MODEL LOGIC:
 * - Analyzes last 7-14 days of AQI data for a ward
 * - Compares first and last AQI values in the time window
 * - If AQI increases beyond threshold (10 points) → "INCREASING"
 * - If AQI decreases beyond threshold (10 points) → "DECREASING"
 * - Otherwise → "STABLE"
 * 
 * This is a prototype model designed for:
 * - Explainability: Simple logic that anyone can understand
 * - Transparency: Clear reasoning for predictions
 * - Governance: Supports evidence-based decision making
 * 
 * Note: This is an early-stage model. For production use, consider more
 * sophisticated time-series analysis or ML models.
 */

export interface TrendPrediction {
  wardId: string;
  trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  explanation: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  changeAmount: number;
  changePercent: number;
  dataPoints: number;
}

/**
 * Predict pollution trend based on historical AQI data
 * 
 * @param wardId - Ward identifier
 * @param historicalAQI - Array of historical AQI values (should be 7-14 days)
 * @returns Trend prediction with explanation
 */
export function predictTrend(
  wardId: string,
  historicalAQI: Array<{ date: string; aqi: number }>
): TrendPrediction {
  if (!historicalAQI || historicalAQI.length === 0) {
    return {
      wardId,
      trend: 'STABLE',
      explanation: 'Insufficient data for trend prediction. Need at least 7 days of historical data.',
      confidence: 'LOW',
      changeAmount: 0,
      changePercent: 0,
      dataPoints: 0,
    };
  }

  // Sort by date to ensure chronological order
  const sortedData = [...historicalAQI].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const firstAQI = sortedData[0].aqi;
  const lastAQI = sortedData[sortedData.length - 1].aqi;
  const changeAmount = lastAQI - firstAQI;
  const changePercent = firstAQI > 0 ? ((changeAmount / firstAQI) * 100) : 0;

  // Threshold for determining trend (10 AQI points or 5% change)
  const threshold = Math.max(10, firstAQI * 0.05);

  // Determine trend based on change amount
  let trend: 'INCREASING' | 'DECREASING' | 'STABLE';
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  let explanation: string;

  if (changeAmount > threshold) {
    trend = 'INCREASING';
    confidence = Math.abs(changePercent) > 15 ? 'HIGH' : Math.abs(changePercent) > 8 ? 'MEDIUM' : 'LOW';
    explanation = `Air quality is showing an upward trend. AQI increased by ${Math.round(changeAmount)} points (${changePercent.toFixed(1)}%) over the last ${sortedData.length} days, indicating deteriorating conditions.`;
  } else if (changeAmount < -threshold) {
    trend = 'DECREASING';
    confidence = Math.abs(changePercent) > 15 ? 'HIGH' : Math.abs(changePercent) > 8 ? 'MEDIUM' : 'LOW';
    explanation = `Air quality is showing improvement. AQI decreased by ${Math.round(Math.abs(changeAmount))} points (${Math.abs(changePercent).toFixed(1)}%) over the last ${sortedData.length} days, indicating better conditions.`;
  } else {
    trend = 'STABLE';
    confidence = sortedData.length >= 10 ? 'HIGH' : sortedData.length >= 7 ? 'MEDIUM' : 'LOW';
    explanation = `Air quality is relatively stable. AQI changed by ${Math.round(Math.abs(changeAmount))} points (${Math.abs(changePercent).toFixed(1)}%) over the last ${sortedData.length} days, indicating consistent conditions.`;
  }

  // Add context about data quality
  if (sortedData.length < 7) {
    explanation += ' Note: Prediction based on limited data points. For more accurate predictions, use 10-14 days of historical data.';
  }

  return {
    wardId,
    trend,
    explanation,
    confidence,
    changeAmount: Math.round(changeAmount),
    changePercent: Math.round(changePercent * 10) / 10,
    dataPoints: sortedData.length,
  };
}




