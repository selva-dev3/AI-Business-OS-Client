import { RawSummary, ProcessedSummary, CardMetricData } from "@/hooks/queries/hrms/employees/employees.types";

/**
 * SENIOR-LEVEL TRANSFORMER
 * 
 * Responsibilities:
 * - Validate incoming data
 * - Calculate percentages with safety
 * - Detect data quality issues
 * - Handle edge cases (0 employees, NaN, etc)
 * - Maintain immutability
 * - Support incremental calculations
 */
export class SummaryTransformer {
  /**
   * Transform raw API summary into processed metrics
   * 
   * Edge Cases Handled:
   * - totalHeadcount = 0 (avoid division by zero)
   * - Negative values (treat as 0, log warning)
   * - Missing fields (use defaults)
   * - NaN/Infinity results (fallback to 0)
   */
  static transform(raw: RawSummary): ProcessedSummary {
    // 1. VALIDATION
    const validated = this.validateAndNormalize(raw);
    
    // 2. PERCENTAGE CALCULATION
    const percentages = this.calculateSafePercentages(validated);
    
    // 3. DATA QUALITY ASSESSMENT
    const quality = this.assessDataQuality(validated, percentages);
    
    return {
      ...validated,
      ...percentages,
      lastUpdated: new Date(),
      isStale: false,
      dataQuality: quality,
    };
  }

  /**
   * Validate and normalize raw data
   * 
   * Rules:
   * - All values must be non-negative integers
   * - Sum of parts should equal or be <= totalHeadcount
   * - Convert to 0 if invalid
   */
  private static validateAndNormalize(raw: RawSummary): RawSummary {
    const normalize = (value: unknown, min = 0): number => {
      if (value === null || value === undefined) return min;
      const num = Number(value);
      if (!Number.isFinite(num) || num < min) {
        console.warn(`Invalid summary value: ${value}, using ${min}`);
        return min;
      }
      return Math.floor(num);
    };

    const totalHeadcount = normalize(raw.totalHeadcount, 0);
    const activeStaff = normalize(raw.activeStaff, 0);
    const onLeave = normalize(raw.onLeave, 0);
    const inactive = normalize(raw.inactive, 0);
    const suspended = normalize(raw.suspended, 0);

    // Warn if parts exceed total (data inconsistency)
    const partSum = activeStaff + onLeave + inactive + suspended;
    if (partSum > totalHeadcount) {
      console.warn(
        `Summary parts (${partSum}) exceed totalHeadcount (${totalHeadcount})`
      );
    }

    return { totalHeadcount, activeStaff, onLeave, inactive, suspended };
  }

  /**
   * Calculate percentages safely
   * 
   * Formula:
   * - percentage = (value / total) * 100
   * - If total = 0, percentage = 0 (not NaN)
   * - Round to 2 decimal places
   * - Percentages may not sum to 100 if total includes overlap
   */
  private static calculateSafePercentages(data: RawSummary): {
    activePercentage: number;
    onLeavePercentage: number;
    inactivePercentage: number;
    suspendedPercentage: number;
  } {
    const calculatePercentage = (value: number, total: number): number => {
      if (total === 0) return 0;
      const percent = (value / total) * 100;
      return Math.round(percent * 100) / 100; // 2 decimal places
    };

    const total = data.totalHeadcount || 1; // Prevent division by zero

    return {
      activePercentage: calculatePercentage(data.activeStaff, total),
      onLeavePercentage: calculatePercentage(data.onLeave, total),
      inactivePercentage: calculatePercentage(data.inactive, total),
      suspendedPercentage: calculatePercentage(data.suspended, total),
    };
  }

  /**
   * Assess data quality
   * 
   * Metrics:
   * - EXCELLENT: No issues, data looks complete
   * - GOOD: Minor issues but usable
   * - FAIR: Significant inconsistencies
   * - POOR: Critical issues, not recommended for decisions
   */
  private static assessDataQuality(
    data: RawSummary,
    percentages: any
  ): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
    const issues: string[] = [];

    // Check 1: All values present
    if (data.totalHeadcount === undefined) issues.push('Missing totalHeadcount');
    if (data.activeStaff === undefined) issues.push('Missing activeStaff');

    // Check 2: Sanity check (parts vs total)
    const partSum = data.activeStaff + data.onLeave + data.inactive + data.suspended;
    if (partSum > data.totalHeadcount * 1.05) {
      // Allow 5% variance
      issues.push('Parts exceed total');
    }

    // Check 3: Logical consistency
    if (data.activeStaff > data.totalHeadcount) {
      issues.push('Active staff exceeds total');
    }

    // Check 4: Suspiciously round numbers (might indicate stale data)
    if (data.totalHeadcount % 100 === 0 && data.totalHeadcount > 0) {
      issues.push('Round number detected (possible cached/stale data)');
    }

    // Determine quality level
    if (issues.length === 0) return 'EXCELLENT';
    if (issues.length === 1) return 'GOOD';
    if (issues.length <= 3) return 'FAIR';
    return 'POOR';
  }

  /**
   * Calculate metrics for dashboard cards
   * 
   * Returns UI-ready data with formatting
   */
  static toCardMetrics(processed: ProcessedSummary): CardMetricData[] {
    return [
      {
        label: 'Total Headcount',
        value: processed.totalHeadcount,
        percentage: 100,
        icon: '👥',
        color: '#6b7280',
        trend: null,
      },
      {
        label: 'Active Staff',
        value: processed.activeStaff,
        percentage: processed.activePercentage,
        icon: '✅',
        color: '#10b981',
        trend: null,
        status: 'ACTIVE',
      },
      {
        label: 'On Leave',
        value: processed.onLeave,
        percentage: processed.onLeavePercentage,
        icon: '🏖️',
        color: '#f59e0b',
        trend: null,
        status: 'ON_LEAVE',
      },
      {
        label: 'Inactive',
        value: processed.inactive,
        percentage: processed.inactivePercentage,
        icon: '⏸️',
        color: '#6b7280',
        trend: null,
        status: 'INACTIVE',
      },
      {
        label: 'Suspended',
        value: processed.suspended,
        percentage: processed.suspendedPercentage,
        icon: '⛔',
        color: '#ef4444',
        trend: null,
        status: 'SUSPENDED',
      },
    ];
  }

  /**
   * Create cache key for memoization
   */
  static getCacheKey(raw: RawSummary): string {
    return `summary_${JSON.stringify(raw)}`;
  }
}
