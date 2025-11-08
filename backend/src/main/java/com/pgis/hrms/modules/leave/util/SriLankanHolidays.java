package com.pgis.hrms.modules.leave.util;

import java.time.LocalDate;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Utility class for Sri Lankan public holidays and Poya days
 * Includes Buddhist, Hindu, Islamic, and Christian holidays
 */
public class SriLankanHolidays {

    // Fixed holidays for 2025
    private static final Map<Integer, List<LocalDate>> FIXED_HOLIDAYS = new HashMap<>();
    
    // Poya days (Buddhist full moon holidays) for 2025-2026
    private static final Map<Integer, List<LocalDate>> POYA_DAYS = new HashMap<>();
    
    static {
        // Initialize 2025 fixed holidays
        List<LocalDate> holidays2025 = new ArrayList<>();
        holidays2025.add(LocalDate.of(2025, Month.JANUARY, 14));   // Tamil Thai Pongal Day
        holidays2025.add(LocalDate.of(2025, Month.FEBRUARY, 4));   // Independence Day
        holidays2025.add(LocalDate.of(2025, Month.MARCH, 14));     // Mahasivarathri Day
        holidays2025.add(LocalDate.of(2025, Month.APRIL, 10));     // Eid-Ul-Fitr
        holidays2025.add(LocalDate.of(2025, Month.APRIL, 11));     // Day prior to New Year
        holidays2025.add(LocalDate.of(2025, Month.APRIL, 12));     // Sinhala & Tamil New Year
        holidays2025.add(LocalDate.of(2025, Month.APRIL, 13));     // Day following New Year
        holidays2025.add(LocalDate.of(2025, Month.APRIL, 14));     // Good Friday
        holidays2025.add(LocalDate.of(2025, Month.MAY, 1));        // May Day
        holidays2025.add(LocalDate.of(2025, Month.MAY, 12));       // Vesak Poya
        holidays2025.add(LocalDate.of(2025, Month.MAY, 13));       // Day following Vesak
        holidays2025.add(LocalDate.of(2025, Month.JUNE, 16));      // Eid-Ul-Alha
        holidays2025.add(LocalDate.of(2025, Month.DECEMBER, 25));  // Christmas
        FIXED_HOLIDAYS.put(2025, holidays2025);
        
        // Initialize 2026 fixed holidays
        List<LocalDate> holidays2026 = new ArrayList<>();
        holidays2026.add(LocalDate.of(2026, Month.JANUARY, 14));   // Tamil Thai Pongal Day
        holidays2026.add(LocalDate.of(2026, Month.FEBRUARY, 4));   // Independence Day
        holidays2026.add(LocalDate.of(2026, Month.MARCH, 3));      // Mahasivarathri Day
        holidays2026.add(LocalDate.of(2026, Month.MARCH, 30));     // Eid-Ul-Fitr
        holidays2026.add(LocalDate.of(2026, Month.APRIL, 3));      // Good Friday
        holidays2026.add(LocalDate.of(2026, Month.APRIL, 13));     // Day prior to New Year
        holidays2026.add(LocalDate.of(2026, Month.APRIL, 14));     // Sinhala & Tamil New Year
        holidays2026.add(LocalDate.of(2026, Month.MAY, 1));        // May Day
        holidays2026.add(LocalDate.of(2026, Month.MAY, 31));       // Vesak Poya
        holidays2026.add(LocalDate.of(2026, Month.JUNE, 1));       // Day following Vesak
        holidays2026.add(LocalDate.of(2026, Month.JUNE, 6));       // Eid-Ul-Alha
        holidays2026.add(LocalDate.of(2026, Month.DECEMBER, 25));  // Christmas
        FIXED_HOLIDAYS.put(2026, holidays2026);
        
        // Initialize 2025 Poya days
        List<LocalDate> poya2025 = new ArrayList<>();
        poya2025.add(LocalDate.of(2025, Month.JANUARY, 13));   // Duruthu
        poya2025.add(LocalDate.of(2025, Month.FEBRUARY, 12));  // Navam
        poya2025.add(LocalDate.of(2025, Month.MARCH, 14));     // Medin
        poya2025.add(LocalDate.of(2025, Month.APRIL, 12));     // Bak
        poya2025.add(LocalDate.of(2025, Month.MAY, 12));       // Vesak
        poya2025.add(LocalDate.of(2025, Month.JUNE, 10));      // Poson
        poya2025.add(LocalDate.of(2025, Month.JULY, 10));      // Esala
        poya2025.add(LocalDate.of(2025, Month.AUGUST, 8));     // Nikini
        poya2025.add(LocalDate.of(2025, Month.SEPTEMBER, 7));  // Binara
        poya2025.add(LocalDate.of(2025, Month.OCTOBER, 6));    // Vap
        poya2025.add(LocalDate.of(2025, Month.NOVEMBER, 5));   // Il
        poya2025.add(LocalDate.of(2025, Month.DECEMBER, 4));   // Unduvap
        POYA_DAYS.put(2025, poya2025);
        
        // Initialize 2026 Poya days
        List<LocalDate> poya2026 = new ArrayList<>();
        poya2026.add(LocalDate.of(2026, Month.JANUARY, 2));    // Duruthu
        poya2026.add(LocalDate.of(2026, Month.FEBRUARY, 1));   // Navam
        poya2026.add(LocalDate.of(2026, Month.MARCH, 3));      // Medin
        poya2026.add(LocalDate.of(2026, Month.APRIL, 1));      // Bak
        poya2026.add(LocalDate.of(2026, Month.MAY, 1));        // Vesak
        poya2026.add(LocalDate.of(2026, Month.MAY, 30));       // Poson
        poya2026.add(LocalDate.of(2026, Month.JUNE, 29));      // Esala
        poya2026.add(LocalDate.of(2026, Month.JULY, 28));      // Nikini
        poya2026.add(LocalDate.of(2026, Month.AUGUST, 27));    // Binara
        poya2026.add(LocalDate.of(2026, Month.SEPTEMBER, 25)); // Vap
        poya2026.add(LocalDate.of(2026, Month.OCTOBER, 25));   // Il
        poya2026.add(LocalDate.of(2026, Month.NOVEMBER, 23));  // Unduvap
        poya2026.add(LocalDate.of(2026, Month.DECEMBER, 23));  // Duruthu
        POYA_DAYS.put(2026, poya2026);
    }
    
    /**
     * Get all holidays for a specific year
     */
    public static Set<LocalDate> getHolidaysForYear(int year) {
        Set<LocalDate> holidays = new HashSet<>();
        holidays.addAll(FIXED_HOLIDAYS.getOrDefault(year, Collections.emptyList()));
        holidays.addAll(POYA_DAYS.getOrDefault(year, Collections.emptyList()));
        return holidays;
    }
    
    /**
     * Check if a specific date is a holiday
     */
    public static boolean isHoliday(LocalDate date) {
        Set<LocalDate> holidays = getHolidaysForYear(date.getYear());
        return holidays.contains(date);
    }
    
    /**
     * Get all holidays within a date range
     */
    public static List<LocalDate> getHolidaysInRange(LocalDate start, LocalDate end) {
        List<LocalDate> holidays = new ArrayList<>();
        
        for (int year = start.getYear(); year <= end.getYear(); year++) {
            holidays.addAll(getHolidaysForYear(year));
        }
        
        return holidays.stream()
                .filter(date -> !date.isBefore(start) && !date.isAfter(end))
                .sorted()
                .collect(Collectors.toList());
    }
    
    /**
     * Calculate working days excluding holidays
     * Note: Saturdays and Sundays are working days in this organization
     * 
     * @param start Start date (inclusive)
     * @param end End date (inclusive)
     * @return Number of working days (total days - public holidays)
     */
    public static int calculateWorkingDays(LocalDate start, LocalDate end) {
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("Start date must be before or equal to end date");
        }
        
        // Calculate total days (inclusive)
        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
        
        // Count holidays in the range
        long holidayCount = getHolidaysInRange(start, end).size();
        
        // Working days = total days - holidays (weekends are working days)
        return (int) (totalDays - holidayCount);
    }
    
    /**
     * Get a result object with detailed breakdown
     */
    public static WorkingDaysResult calculateWorkingDaysDetailed(LocalDate start, LocalDate end) {
        int totalDays = (int) java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
        List<LocalDate> holidays = getHolidaysInRange(start, end);
        int workingDays = totalDays - holidays.size();
        
        return new WorkingDaysResult(totalDays, holidays.size(), workingDays, holidays);
    }
    
    /**
     * Result object containing working days calculation details
     */
    public static class WorkingDaysResult {
        private final int totalDays;
        private final int holidays;
        private final int workingDays;
        private final List<LocalDate> holidayList;
        
        public WorkingDaysResult(int totalDays, int holidays, int workingDays, List<LocalDate> holidayList) {
            this.totalDays = totalDays;
            this.holidays = holidays;
            this.workingDays = workingDays;
            this.holidayList = holidayList;
        }
        
        public int getTotalDays() { return totalDays; }
        public int getHolidays() { return holidays; }
        public int getWorkingDays() { return workingDays; }
        public List<LocalDate> getHolidayList() { return holidayList; }
    }
}
