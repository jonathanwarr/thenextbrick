import Link from "next/link";
import { savePost, deletePost } from "@/app/admin/posts/actions";

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  dek: string;
  body_md: string;
  cover_variant: string;
  status: "draft" | "scheduled" | "published";
  featured: boolean;
  read_time_min: number | null;
  tags: string[];
};

export default function PostForm({
  values,
  saved,
  error,
}: {
  values: PostFormValues;
  saved?: boolean;
  error?: string;
}) {
  const isEdit = Boolean(values.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/posts"
            className="text-sm hover:opacity-70"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ← All posts
          </Link>
          <h1 className="text-3xl font-medium mt-2" style={{ fontFamily: "var(--font-family-serif)" }}>
            {isEdit ? "Edit post" : "New post"}
          </h1>
        </div>
        {isEdit && (
          <form action={deletePost}>
            <input type="hidden" name="id" value={values.id} />
            <button
              type="submit"
              className="px-3 py-1.5 text-sm rounded-full transition-opacity hover:opacity-80 cursor-pointer"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border)",
              }}
            >
              Delete
            </button>
          </form>
        )}
      </div>

      {saved && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-primary)",
            color: "var(--color-text-primary)",
          }}
        >
          Saved.
        </div>
      )}
      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-primary)",
            color: "var(--color-primary)",
          }}
        >
          {error}
        </div>
      )}

      <form action={savePost} className="space-y-5">
        {isEdit && <input type="hidden" name="id" value={values.id} />}

        <Field label="Title" required>
          <input
            type="text"
            name="title"
            required
            defaultValue={values.title}
            className="w-full px-4 py-2.5 rounded-lg outline-none"
            style={fieldStyle}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Slug" hint="lowercase-with-dashes. Defaults to slugified title.">
            <input
              type="text"
              name="slug"
              defaultValue={values.slug}
              className="w-full px-4 py-2.5 rounded-lg outline-none"
              style={fieldStyle}
            />
          </Field>
          <Field label="Status">
            <select
              name="status"
              defaultValue={values.status}
              className="w-full px-4 py-2.5 rounded-lg outline-none"
              style={fieldStyle}
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </Field>
        </div>

        <Field label="Dek" hint="Short subheading shown on cards and the article page.">
          <input
            type="text"
            name="dek"
            defaultValue={values.dek}
            className="w-full px-4 py-2.5 rounded-lg outline-none"
            style={fieldStyle}
          />
        </Field>

        <Field label="Body (Markdown)" required>
          <textarea
            name="body_md"
            required
            defaultValue={values.body_md}
            rows={20}
            className="w-full px-4 py-2.5 rounded-lg outline-none font-mono text-sm leading-relaxed"
            style={fieldStyle}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Tags" hint="Comma-separated slugs (e.g. prompting, agents).">
            <input
              type="text"
              name="tags"
              defaultValue={values.tags.join(", ")}
              className="w-full px-4 py-2.5 rounded-lg outline-none"
              style={fieldStyle}
            />
          </Field>
          <Field label="Cover variant" hint="Optional.">
            <input
              type="text"
              name="cover_variant"
              defaultValue={values.cover_variant}
              className="w-full px-4 py-2.5 rounded-lg outline-none"
              style={fieldStyle}
            />
          </Field>
          <Field label="Read time (minutes)">
            <input
              type="number"
              name="read_time_min"
              min={0}
              defaultValue={values.read_time_min ?? ""}
              className="w-full px-4 py-2.5 rounded-lg outline-none"
              style={fieldStyle}
            />
          </Field>
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={values.featured}
            className="w-4 h-4 accent-current"
            style={{ accentColor: "var(--color-primary)" }}
          />
          <span className="text-sm">Featured</span>
        </label>

        <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-full font-medium text-sm transition-opacity hover:opacity-90 cursor-pointer"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-text-primary)",
            }}
          >
            Save
          </button>
          <Link
            href="/admin/posts"
            className="text-sm hover:opacity-70"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  backgroundColor: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-primary)",
};

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span style={{ color: "var(--color-primary)" }}> *</span>}
      </span>
      {children}
      {hint && (
        <span className="block text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          {hint}
        </span>
      )}
    </label>
  );
}
