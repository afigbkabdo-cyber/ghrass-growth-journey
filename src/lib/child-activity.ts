/** Keep only explicitly selected, available classes; never add a default target. */
export function selectedActivityClasses(selected: string[], available: string[]) {
  return [...new Set(selected)].filter((id) => available.includes(id));
}

export function optionalThirdMeal(enabled: boolean, status: string, time: string, notes: string) {
  return {
    meal3Enabled: enabled,
    meal3Status: enabled ? status || null : null,
    meal3Time: enabled ? time || null : null,
    meal3Notes: enabled ? notes || null : null,
  };
}