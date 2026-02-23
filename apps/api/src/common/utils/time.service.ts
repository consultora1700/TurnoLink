import { Injectable } from '@nestjs/common';

/**
 * Time format used throughout the application: "HH:MM" (24-hour format)
 */
export type TimeString = string;

/**
 * Parsed time representation
 */
export interface ParsedTime {
  hours: number;
  minutes: number;
  totalMinutes: number;
}

/**
 * Time range representation
 */
export interface TimeRange {
  start: TimeString;
  end: TimeString;
}

/**
 * Service for time-related operations.
 * All times are in 24-hour format "HH:MM".
 */
@Injectable()
export class TimeUtilsService {
  private static readonly TIME_REGEX = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;

  /**
   * Parses a time string into its components
   * @param time Time string in "HH:MM" format
   * @returns Parsed time object with hours, minutes, and totalMinutes
   * @throws Error if time format is invalid
   */
  parse(time: TimeString): ParsedTime {
    if (!TimeUtilsService.TIME_REGEX.test(time)) {
      throw new Error(`Invalid time format: "${time}". Expected "HH:MM" (24-hour format)`);
    }

    const [hours, minutes] = time.split(':').map(Number);
    return {
      hours,
      minutes,
      totalMinutes: hours * 60 + minutes,
    };
  }

  /**
   * Converts a time string to total minutes since midnight
   * @param time Time string in "HH:MM" format
   * @returns Total minutes since midnight (0-1439)
   */
  toMinutes(time: TimeString): number {
    return this.parse(time).totalMinutes;
  }

  /**
   * Converts total minutes since midnight to a time string
   * @param totalMinutes Minutes since midnight (can exceed 1439 for next-day times)
   * @returns Time string in "HH:MM" format
   */
  fromMinutes(totalMinutes: number): TimeString {
    // Handle negative values
    if (totalMinutes < 0) {
      throw new Error(`Invalid minutes value: ${totalMinutes}. Must be non-negative`);
    }

    // Normalize to 24-hour range (for cases like 25:00 -> 01:00)
    const normalizedMinutes = totalMinutes % (24 * 60);
    const hours = Math.floor(normalizedMinutes / 60);
    const minutes = normalizedMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Calculates end time given a start time and duration
   * @param startTime Start time in "HH:MM" format
   * @param durationMinutes Duration in minutes
   * @returns End time in "HH:MM" format
   */
  calculateEndTime(startTime: TimeString, durationMinutes: number): TimeString {
    const startMinutes = this.toMinutes(startTime);
    return this.fromMinutes(startMinutes + durationMinutes);
  }

  /**
   * Adds minutes to a time
   * @param time Time in "HH:MM" format
   * @param minutes Minutes to add (can be negative)
   * @returns Resulting time in "HH:MM" format
   */
  addMinutes(time: TimeString, minutes: number): TimeString {
    const timeMinutes = this.toMinutes(time);
    const newMinutes = timeMinutes + minutes;

    if (newMinutes < 0) {
      throw new Error('Resulting time cannot be negative');
    }

    return this.fromMinutes(newMinutes);
  }

  /**
   * Calculates the difference between two times in minutes
   * @param startTime Start time in "HH:MM" format
   * @param endTime End time in "HH:MM" format
   * @returns Difference in minutes (endTime - startTime)
   */
  differenceInMinutes(startTime: TimeString, endTime: TimeString): number {
    return this.toMinutes(endTime) - this.toMinutes(startTime);
  }

  /**
   * Checks if a time is within a range (inclusive start, exclusive end)
   * @param time Time to check
   * @param rangeStart Start of range
   * @param rangeEnd End of range
   * @returns True if time is within range [rangeStart, rangeEnd)
   */
  isTimeInRange(time: TimeString, rangeStart: TimeString, rangeEnd: TimeString): boolean {
    const timeMinutes = this.toMinutes(time);
    const startMinutes = this.toMinutes(rangeStart);
    const endMinutes = this.toMinutes(rangeEnd);

    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }

  /**
   * Checks if two time ranges overlap
   * @param range1 First time range
   * @param range2 Second time range
   * @returns True if ranges overlap
   */
  doRangesOverlap(range1: TimeRange, range2: TimeRange): boolean {
    const start1 = this.toMinutes(range1.start);
    const end1 = this.toMinutes(range1.end);
    const start2 = this.toMinutes(range2.start);
    const end2 = this.toMinutes(range2.end);

    // Ranges overlap if neither is entirely before or after the other
    return start1 < end2 && start2 < end1;
  }

  /**
   * Compares two times
   * @param time1 First time
   * @param time2 Second time
   * @returns -1 if time1 < time2, 0 if equal, 1 if time1 > time2
   */
  compare(time1: TimeString, time2: TimeString): -1 | 0 | 1 {
    const minutes1 = this.toMinutes(time1);
    const minutes2 = this.toMinutes(time2);

    if (minutes1 < minutes2) return -1;
    if (minutes1 > minutes2) return 1;
    return 0;
  }

  /**
   * Checks if time1 is before time2
   */
  isBefore(time1: TimeString, time2: TimeString): boolean {
    return this.compare(time1, time2) < 0;
  }

  /**
   * Checks if time1 is after time2
   */
  isAfter(time1: TimeString, time2: TimeString): boolean {
    return this.compare(time1, time2) > 0;
  }

  /**
   * Checks if time1 equals time2
   */
  isEqual(time1: TimeString, time2: TimeString): boolean {
    return this.compare(time1, time2) === 0;
  }

  /**
   * Validates if a string is a valid time format
   * @param time String to validate
   * @returns True if valid "HH:MM" format
   */
  isValidTime(time: string): boolean {
    return TimeUtilsService.TIME_REGEX.test(time);
  }

  /**
   * Formats a time ensuring consistent "HH:MM" format with leading zeros
   * @param time Time that might have single-digit hour (e.g., "9:30")
   * @returns Properly formatted time (e.g., "09:30")
   */
  format(time: TimeString): TimeString {
    const parsed = this.parse(time);
    return this.fromMinutes(parsed.totalMinutes);
  }

  /**
   * Generates an array of time slots between start and end
   * @param startTime Start time
   * @param endTime End time
   * @param intervalMinutes Interval between slots
   * @returns Array of time strings
   */
  generateTimeSlots(
    startTime: TimeString,
    endTime: TimeString,
    intervalMinutes: number,
  ): TimeString[] {
    if (intervalMinutes <= 0) {
      throw new Error('Interval must be positive');
    }

    const slots: TimeString[] = [];
    let currentMinutes = this.toMinutes(startTime);
    const endMinutes = this.toMinutes(endTime);

    while (currentMinutes < endMinutes) {
      slots.push(this.fromMinutes(currentMinutes));
      currentMinutes += intervalMinutes;
    }

    return slots;
  }
}
