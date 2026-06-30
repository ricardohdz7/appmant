"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import {
  MaintenanceState,
  MaintenanceAction,
  Branch,
  CalendarEntry,
  PlanningEntry,
  CostEntry,
} from "./types";
import { sampleBranches, sampleCalendarEntries, samplePlanningEntries, sampleCostEntries } from "./sampleData";

const MaintenanceContext = createContext<{
  state: MaintenanceState;
  dispatch: React.Dispatch<MaintenanceAction>;
} | null>(null);

const initialState: MaintenanceState = {
  branches: sampleBranches,
  calendarEntries: sampleCalendarEntries,
  planningEntries: samplePlanningEntries,
  costEntries: sampleCostEntries,
  currentYear: 2025,
};

function maintenanceReducer(state: MaintenanceState, action: MaintenanceAction): MaintenanceState {
  switch (action.type) {
    case "ADD_BRANCH":
      return { ...state, branches: [...state.branches, action.payload] };
    case "DELETE_BRANCH":
      return {
        ...state,
        branches: state.branches.filter((b) => b.id !== action.payload),
        calendarEntries: state.calendarEntries.filter((c) => c.branchId !== action.payload),
        planningEntries: state.planningEntries.filter((p) => p.branchId !== action.payload),
        costEntries: state.costEntries.filter((c) => c.branchId !== action.payload),
      };
    case "ADD_CALENDAR_ENTRY":
      return {
        ...state,
        calendarEntries: [
          ...state.calendarEntries.filter(
            (c) => !(c.branchId === action.payload.branchId && c.month === action.payload.month)
          ),
          action.payload,
        ],
      };
    case "UPDATE_CALENDAR_ENTRY":
      const existing = state.calendarEntries.find(
        (c) => c.branchId === action.payload.branchId && c.month === action.payload.month && c.year === action.payload.year
      );
      return {
        ...state,
        calendarEntries: existing
          ? state.calendarEntries.map((c) =>
              c.branchId === action.payload.branchId && c.month === action.payload.month && c.year === action.payload.year
                ? action.payload
                : c
            )
          : [...state.calendarEntries, action.payload],
      };
    case "ADD_PLANNING_ENTRY":
      return { ...state, planningEntries: [...state.planningEntries, action.payload] };
    case "UPDATE_PLANNING_ENTRY":
      return {
        ...state,
        planningEntries: state.planningEntries.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };
    case "DELETE_PLANNING_ENTRY":
      return {
        ...state,
        planningEntries: state.planningEntries.filter((p) => p.id !== action.payload),
      };
    case "ADD_COST_ENTRY":
      return { ...state, costEntries: [...state.costEntries, action.payload] };
    case "DELETE_COST_ENTRY":
      return { ...state, costEntries: state.costEntries.filter((c) => c.id !== action.payload) };
    case "CLEAR_BRANCH_COSTS":
      return { ...state, costEntries: state.costEntries.filter((c) => c.branchId !== action.payload) };
    case "CLEAR_ALL_COSTS":
      return { ...state, costEntries: [] };
    case "SET_YEAR":
      return { ...state, currentYear: action.payload };
    case "LOAD_STATE":
      return action.payload;
    default:
      return state;
  }
}

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(maintenanceReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("maintenanceState");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Reconstruct Date objects from ISO strings
        if (parsed.planningEntries) {
          parsed.planningEntries = parsed.planningEntries.map((p: any) => ({
            ...p,
            scheduledDate: typeof p.scheduledDate === 'string' ? new Date(p.scheduledDate) : p.scheduledDate,
          }));
        }
        if (parsed.costEntries) {
          parsed.costEntries = parsed.costEntries.map((c: any) => ({
            ...c,
            date: typeof c.date === 'string' ? new Date(c.date) : c.date,
          }));
        }
        dispatch({ type: "LOAD_STATE", payload: parsed });
      } catch (e) {
        console.error("Failed to load state from localStorage", e);
      }
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem("maintenanceState", JSON.stringify(state));
  }, [state]);

  return <MaintenanceContext.Provider value={{ state, dispatch }}>{children}</MaintenanceContext.Provider>;
}

export function useMaintenanceContext() {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error("useMaintenanceContext must be used within MaintenanceProvider");
  }
  return context;
}
