import { getLocale, redirect } from "next-globe-gen";
import { notFound } from "next/navigation";
import { getPost } from "../../posts";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const locale = getLocale();
  const post = await getPost(Number(id), locale);
  if (!post) notFound();

  if (post.slug !== slug) {
    redirect("/dynamic/[id]/[slug]", {
      params: {
        id: id,
        slug: post.slug,
      },
    });
  }

  return (
    <>
      <h1>{post.title}</h1>
      <p>
        {post.author} -{" "}
        <time dateTime={post.date}>
          {new Date(post.date).toLocaleDateString(locale, {
            dateStyle: "long",
          })}
        </time>
      </p>
      <p>{post.content}</p>
    </>
  );
}
