/**
 * Maps form field paths to step numbers
 * Used to navigate to the correct step when validation errors occur
 */

type FieldPath = (string | number)[];

/**
 * Maps a field path to its corresponding step number
 * @param path - The field path from Zod error (e.g., ["firstName"] or ["experiences", 0, "company"])
 * @returns The step number (1-10) or null if path doesn't match any step
 */
export function getStepFromFieldPath(path: FieldPath): number | null {
  if (path.length === 0) return null;

  const firstSegment = path[0];

  // Step 1: User Identity
  if (
    firstSegment === "firstName" ||
    firstSegment === "lastName" ||
    firstSegment === "email" ||
    firstSegment === "phoneNumber"
  ) {
    return 1;
  }

  // Step 2: Professional Baseline
  if (
    firstSegment === "highestFormalEducationLevel" ||
    firstSegment === "currentJobStatus" ||
    firstSegment === "category"
  ) {
    return 2;
  }

  // Step 3: Personal Profile
  if (
    firstSegment === "countryOfResidence" ||
    firstSegment === "timeZone" ||
    firstSegment === "countryOfOrigin" ||
    firstSegment === "city" ||
    firstSegment === "birthYear"
  ) {
    return 3;
  }

  // Step 4: Language Proficiency
  if (firstSegment === "languages") {
    return 4;
  }

  // Step 5: Social Profiles
  if (firstSegment === "linkedinUrl" || firstSegment === "socialProfiles") {
    return 5;
  }

  // Step 6: Availability & Compensation
  if (
    firstSegment === "availability" ||
    firstSegment === "availableIn" ||
    firstSegment === "hoursPerWeek" ||
    firstSegment === "expectedSalary" ||
    firstSegment === "availableFrom"
  ) {
    return 6;
  }

  // Step 7: Skills
  if (firstSegment === "skills") {
    return 7;
  }

  // Step 8: Work Experience
  if (firstSegment === "experiences") {
    return 8;
  }

  // Step 9: Resume & Video
  if (
    firstSegment === "resumeUrl" ||
    firstSegment === "videoUrl" ||
    firstSegment === "notes"
  ) {
    return 9;
  }

  // Step 10: Review (no fields)
  return null;
}

/**
 * Finds the first step number that contains validation errors
 * @param errors - Array of field paths from Zod errors
 * @returns The first step number with errors, or null if no errors found
 */
export function getFirstErrorStep(errors: FieldPath[]): number | null {
  for (const errorPath of errors) {
    const step = getStepFromFieldPath(errorPath);
    if (step !== null) {
      return step;
    }
  }
  return null;
}

/**
 * Extracts field paths from Zod error format
 * @param zodError - The flattened Zod error object
 * @returns Array of field paths
 */
export function extractFieldPaths(zodError: {
  fieldErrors?: Record<string, string[] | undefined>;
  formErrors?: string[];
}): FieldPath[] {
  const paths: FieldPath[] = [];

  if (zodError.fieldErrors) {
    for (const [field, errors] of Object.entries(zodError.fieldErrors)) {
      if (errors && errors.length > 0) {
        // Parse nested paths like "experiences.0.company" or "languages.1.name"
        const path = field.split(".").map((segment) => {
          const num = Number.parseInt(segment, 10);
          return Number.isNaN(num) ? segment : num;
        });
        paths.push(path);
      }
    }
  }

  return paths;
}
