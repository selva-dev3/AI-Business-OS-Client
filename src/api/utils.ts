import axios, { AxiosError } from "axios";
import { ApiErrorResponse } from "./client";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly path: string;
  public readonly requestId: string;
  public readonly details?: Record<string, string[]>;
  public readonly timestamp: string;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = "ApiError";
    this.statusCode = response.statusCode;
    this.errorCode = response.error;
    this.path = response.path;
    this.requestId = response.requestId;
    this.details = response.details;
    this.timestamp = response.timestamp;
  }
}

export function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data) {
      throw new ApiError(axiosError.response.data);
    }
    throw new Error(axiosError.message || "Network error occurred");
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error("An unexpected error occurred");
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || "Network error";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}

export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)));
    } else {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
