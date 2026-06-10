import Link from "next/link";
import { savePost, deletePost } from "@/app/admin/posts/actions";
import TagPicker, {
  type AvailableGroup,
  type AvailableTag,
} from "./TagPicker";
import PublishedAtInput from "./PublishedAtInput";
import { KNOWN_CATEGORIES } from "@/lib/posts/types";
import { categoryLabels, type Category } from "@/components/ui/BrickCard";

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  dek: string;
  the_brick: string;
  body_md: string;
  category: Category;
  status: "draft" | "scheduled" | "published";
  read_time_min: number | null;
  tags: string[];
  published_at: string | null;
};

export default function PostForm({
  values,
  availableGroups,
  availableTags,
  saved,
  error,
}: {
  values: PostFormValues;
  availableGroups: AvailableGroup[];
  availableTags: AvailableTag[];
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
          <h1 className="text-2xl sm:text-3xl font-medium mt-2" style={{ fontFamily: "var(--font-family-serif)" }}>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <Field
          label="Publish date"
          hint="Used when status is Scheduled or Published. Leave empty for drafts; defaults to now when publishing immediately."
        >
          <PublishedAtInput defaultValueIso={values.published_at} />
        </Field>

        <Field label="Dek" hint="Short subheading shown on cards and the article page.">
          <input
            type="text"
            name="dek"
            defaultValue={values.dek}
            className="w-full px-4 py-2.5 rounded-lg outline-none"
            style={fieldStyle}
          />
        </Field>

        <Field
          label="The Brick"
          hint="The article's value prop, given to the reader immediately. Fills the featured card and shows as a callout near the top of the article. 1 sentence."
        >
          <textarea
            name="the_brick"
            defaultValue={values.the_brick}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg outline-none leading-relaxed"
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

        <Field label="Tags" hint="Click a group to browse. Click a tag to add or remove it.">
          <TagPicker
            groups={availableGroups}
            tags={availableTags}
            initialSelected={values.tags}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Type" hint="Articles provide foundational knowledge · Playbooks provide practical application · Essays provide strategic thinking.">
            <select
              name="category"
              defaultValue={values.category}
              className="w-full px-4 py-2.5 rounded-lg outline-none"
              style={fieldStyle}
            >
              {KNOWN_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c]}
                </option>
              ))}
            </select>
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
