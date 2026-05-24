import { createServiceClient } from "@/lib/supabase/server";
import type { AvailableGroup, AvailableTag } from "@/components/admin/TagPicker";

export async function loadTagPickerData(): Promise<{
  groups: AvailableGroup[];
  tags: AvailableTag[];
}> {
  const supabase = createServiceClient();
  const [{ data: groups }, { data: tags }] = await Promise.all([
    supabase.from("tag_groups").select("id, name, sort_order").order("sort_order"),
    supabase.from("tags").select("id, slug, name, group_id, sort_order").order("sort_order"),
  ]);
  return {
    groups: (groups ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      sortOrder: g.sort_order,
    })),
    tags: (tags ?? []).map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      groupId: t.group_id,
      sortOrder: t.sort_order,
    })),
  };
}
