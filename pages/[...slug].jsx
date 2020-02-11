import matter from "gray-matter";
import fetch from "isomorphic-unfetch";
import marked from "marked";

export default function DocsPage({ error, content, frontmatter }) {
  if (error) {
    return <p>404: page not found</p>;
  }
  return (
    <>
      <p>frontmatter: {JSON.stringify(frontmatter)}</p>
      <div dangerouslySetInnerHTML={{ __html: content }}></div>
    </>
  );
}

export async function unstable_getStaticProps({ params }) {
  const root =
    "https://raw.githubusercontent.com/jescalan/external-markdown-source/master";
  const page = `${root}/${params.slug.join("/")}.mdx`;

  console.log(`fetching ${page} from github api`);
  return fetchText(page).then(res => {
    if (is404(res)) {
      const indexPage = `${root}/${params.slug.join("/")}/index.mdx`;
      console.log(`page not found, trying ${indexPage}`);
      return fetchText(indexPage).then(res => {
        if (is404(res)) return { props: { error: true } };
        return { props: processMarkdown(res) };
      });
    } else {
      return { props: processMarkdown(res) };
    }
  });
}

function is404(res) {
  return res === "404: Not Found\n";
}

function fetchText(page) {
  return fetch(page).then(res => res.text());
}

function processMarkdown(res) {
  const { content, data } = matter(res);
  return {
    content: marked(content),
    frontmatter: data
  };
}
