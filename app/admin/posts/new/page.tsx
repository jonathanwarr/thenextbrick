import PostForm from "@/components/admin/PostForm";
import { loadTagPickerData } from "@/lib/admin/tags";

type NewPostSearchParams = Promise<{ error?: string }>;

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: NewPostSearchParams;
}) {
  const { error } = await searchParams;
  const { groups, tags } = await loadTagPickerData();
  return (
    <PostForm
      error={error}
      availableGroups={groups}
      availableTags={tags}
      values={{
        title: "",
        slug: "",
        dek: "",
        the_brick: "",
        body_md: "",
        category: "articles",
        status: "draft",
        read_time_min: null,
        tags: [],
        published_at: null,
      }}
    />
  );
}
