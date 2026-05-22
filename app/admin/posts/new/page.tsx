import PostForm from "@/components/admin/PostForm";

type NewPostSearchParams = Promise<{ error?: string }>;

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: NewPostSearchParams;
}) {
  const { error } = await searchParams;
  return (
    <PostForm
      error={error}
      values={{
        title: "",
        slug: "",
        dek: "",
        body_md: "",
        cover_variant: "",
        status: "draft",
        featured: false,
        read_time_min: null,
        tags: [],
      }}
    />
  );
}
