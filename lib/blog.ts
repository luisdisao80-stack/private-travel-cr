import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  readTime: number;
  image: string;
  imageAlt: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

// Obtiene todos los slugs disponibles
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const files = fs.readdirSync(postsDirectory);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

// Obtiene la metadata de todos los posts
export function getAllPosts(): BlogPostMeta[] {
  const slugs = getAllPostSlugs();

  const posts = slugs
    .map((slug) => {
      const fullPath = path.join(postsDirectory, `${slug}.md`);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
        author: data.author || "Private Travel CR",
        category: data.category || "Travel",
        readTime: data.readTime || 5,
        image: data.image || "",
        imageAlt: data.imageAlt || "",
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return posts;
}

// Obtiene un post completo por slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // Convertir markdown a HTML.
  //
  // El `gfm` va ANTES de `html` y no es opcional: sin él, remark usa
  // CommonMark pelado, que no conoce las tablas de markdown. Las 21
  // tablas del blog (las de precios de SJO y LIR, entre ellas) salían
  // en vivo como un párrafo de barritas — "La Fortuna | $220 | 3 h |" —
  // en vez de una tabla. Se ve mal y Google no puede leer los precios.
  // El `html` con `sanitize` apagado (por defecto) deja pasar el
  // <table> que genera gfm.
  const processedContent = await remark().use(gfm).use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    date: data.date || "",
    author: data.author || "Private Travel CR",
    category: data.category || "Travel",
    readTime: data.readTime || 5,
    image: data.image || "",
    imageAlt: data.imageAlt || "",
    content: contentHtml,
  };
}
