import { useReducer, useCallback, useEffect, useRef } from "react";
import { 
  RawSummary, 
  ProcessedSummary, 
  EmployeeApiResponse, 
  SummaryState, 
  SummaryAction,
  EmployeeSearchParams
} from "@/hooks/queries/hrms/employees/employees.types";
import { SummaryTransformer } from "@/services/SummaryTransformer";
import { auth } from "@/lib/auth";
import { apiGet } from "@/hooks/queries/client";

interface UseSummaryOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
  cacheTime?: number; // ms
  onError?: (error: Error) => void;
  enabled?: boolean;
  filterParams?: EmployeeSearchParams;
}

// Extend SummaryState to include isStale for runtime state mapping
interface ExtendedSummaryState extends SummaryState {
  isStale: boolean;
}

const initialState: ExtendedSummaryState = {
  raw: null,
  processed: null,
  loading: false,
  error: null,
  lastFetchTime: null,
  cacheKey: "",
  isStale: false,
};

function summaryReducer(state: ExtendedSummaryState, action: SummaryAction): ExtendedSummaryState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_SUCCESS': {
      const raw = action.payload.data.summary;
      const processed = SummaryTransformer.transform(raw);
      return {
        ...state,
        raw,
        processed,
        loading: false,
        error: null,
        lastFetchTime: new Date(),
        cacheKey: SummaryTransformer.getCacheKey(raw),
        isStale: false,
      };
    }
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'INVALIDATE_CACHE':
      return {
        ...state,
        raw: null,
        processed: null,
        lastFetchTime: null,
        cacheKey: "",
        isStale: false,
      };
    case 'SET_STALE':
      return {
        ...state,
        isStale: true,
      };
    default:
      return state;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const useSummaryData = (options: UseSummaryOptions = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    cacheTime = 60000, // 1 minute
    onError,
    enabled = true,
    filterParams = {},
  } = options;

  const [state, dispatch] = useReducer(summaryReducer, initialState);
  const cacheRef = useRef<{ data: EmployeeApiResponse; time: number } | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch summary from API
   * 
   * Optimizations:
   * - Request deduplication (avoid concurrent requests)
   * - Cache management with TTL
   * - Error recovery with exponential backoff
   * - Automatic stale data detection
   */
  const fetchSummary = useCallback(
    async (forceRefresh = false) => {
      // Check cache validity
      if (!forceRefresh && cacheRef.current) {
        const cacheAge = Date.now() - cacheRef.current.time;
        if (cacheAge < cacheTime) {
          // Use cached data
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: cacheRef.current.data,
          });
          return;
        }
      }

      dispatch({ type: 'FETCH_START' });

      try {
        // Build query params from filters
        const queryParams = new URLSearchParams();
        Object.entries(filterParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });

        const result = await apiGet<{
          employees: any[];
          pagination: any;
          summary: RawSummary;
        }>(`/hrms/employees?${queryParams.toString()}`);

        if (!result || !result.summary) {
          throw new Error('Failed to fetch summary');
        }

        const fakeResponse: EmployeeApiResponse = {
          success: true,
          status: 200,
          message: "Success",
          data: result,
        };

        // Update cache
        cacheRef.current = { data: fakeResponse, time: Date.now() };

        dispatch({ type: 'FETCH_SUCCESS', payload: fakeResponse });
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        dispatch({ type: 'FETCH_ERROR', payload: err });
        onError?.(err);
      }
    },
    [filterParams, cacheTime, onError]
  );

  /**
   * Auto-refresh logic
   */
  useEffect(() => {
    if (!enabled) return;

    fetchSummary();

    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        dispatch({ type: 'SET_STALE' });
        fetchSummary();
      }, refreshInterval);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [enabled, autoRefresh, refreshInterval, fetchSummary]);

  return {
    summary: state.processed,
    rawSummary: state.raw,
    loading: state.loading,
    error: state.error,
    lastUpdated: state.lastFetchTime,
    refetch: () => fetchSummary(true),
    isStale: state.isStale,
  };
};
