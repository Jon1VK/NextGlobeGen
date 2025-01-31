import type { Locale } from "next-globe-gen";

const posts = [
  {
    id: 1,
    author: "John Doe",
    date: "2023-10-01",
    translations: [
      {
        locale: "en",
        title: "The Beauty of Nature",
        slug: "the-beauty-of-nature",
        content: "Nature is not a place to visit. It is home.",
      },
      {
        locale: "fi",
        title: "Luonnon Kauneus",
        slug: "luonnon-kauneus",
        content: "Luonto ei ole paikka, johon vierailla. Se on koti.",
      },
    ],
  },
  {
    id: 2,
    author: "Emily Johnson",
    date: "2023-10-03",
    translations: [
      {
        locale: "en",
        title: "The Importance of Mindfulness",
        slug: "the-importance-of-mindfulness",
        content:
          "Mindfulness helps us to live in the moment and appreciate life.",
      },
      {
        locale: "fi",
        title: "Tietoinen Läsnäolo",
        slug: "tietoinen-lasnaolo",
        content:
          "Tietoinen läsnäolo auttaa meitä elämään hetkessä ja arvostamaan elämää.",
      },
    ],
  },
  {
    id: 3,
    author: "Michael Brown",
    date: "2023-10-04",
    translations: [
      {
        locale: "en",
        title: "The Importance of Technology and Innovation",
        slug: "the-importance-of-technology-and-innovation",
        content: "Innovation drives us forward and shapes our future.",
      },
      {
        locale: "fi",
        title: "Teknologian ja Innovaation Tärkeys",
        slug: "teknologian-ja-innovaation-tarkeys",
        content: "Innovaatio vie meitä eteenpäin ja muokkaa tulevaisuuttamme.",
      },
    ],
  },
];

export async function getPosts(locale: Locale) {
  await new Promise((res) => setTimeout(res, 1000));
  return posts
    .map(({ translations, ...post }) => {
      const translation = translations.find((t) => t.locale === locale);
      if (!translation) return;
      return { ...post, ...translation };
    })
    .filter((v) => !!v);
}

export async function getPost(id: number, locale: Locale) {
  await new Promise((res) => setTimeout(res, 1000));
  const post = posts.find((post) => post.id === id);
  if (!post) return undefined;
  const { translations, ...rest } = post;
  const translation = translations.find((t) => t.locale === locale);
  if (!translation) return;
  return { ...rest, ...translation };
}
