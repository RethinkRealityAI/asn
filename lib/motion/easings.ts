/**
 * Shared easing + duration constants for Shea Allnaturals motion system.
 * Matches --ease-warm: cubic-bezier(0.16, 1, 0.3, 1) in globals.css.
 *
 * Use as: transition={{ ease: WARM, duration: DUR.base }}
 */

/** Primary warm spring easing — matches CSS --ease-warm */
export const WARM = [0.16, 1, 0.3, 1] as const;

/** Slightly softer warm ease for exits / secondary reveals */
export const WARM_OUT = [0.22, 1, 0.36, 1] as const;

/** Canonical durations (seconds) */
export const DUR = {
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
} as const;
