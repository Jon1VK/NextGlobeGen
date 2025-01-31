import { getLocale, redirect } from "next-globe-gen";
import { notFound } from "next/navigation";
import { getPost } from "../posts";

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = getLocale();
  const post = await getPost(Number(id), locale);
  if (!post) notFound();

  redirect("/dynamic/[id]/[slug]", {
    params: {
      id: id,
      slug: post.slug,
    },
  });
}
