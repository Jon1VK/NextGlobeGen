import { getLocale, getTranslations, Link } from "next-globe-gen";
import { getPosts } from "./posts";

export default async function Page() {
  const locale = getLocale();
  const t = getTranslations();
  const posts = await getPosts(locale);

  return (
    <>
      <h1>{t("posts", { _description: "Heading for the blog posts list" })}</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href="/dynamic/[id]/[slug]"
              params={{
                id: post.id.toString(),
                slug: post.slug,
              }}
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
