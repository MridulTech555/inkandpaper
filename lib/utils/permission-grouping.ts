export function groupPermissionsByCategory(
  permissionNames: readonly string[],
): { category: string; permissions: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const name of permissionNames) {
    const [category] = name.split(":");
    const list = groups.get(category) ?? [];
    list.push(name);
    groups.set(category, list);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, permissions]) => ({ category, permissions }));
}
