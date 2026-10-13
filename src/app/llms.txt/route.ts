import { categories, categoryOrder } from "@/lib/taxonomy";
import { SERVICE_DETAILS } from "@/lib/services";
import { PROJECTS } from "@/lib/projects";
import { CONTACT_EMAIL, INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/* /llms.txt (llmstxt.org): a plain summary of the studio for AI assistants, prerendered at build time. */
export function GET() {
  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "SPARK is a one-studio team covering strategy, design, engineering and hosting, working with clients worldwide. The website is a single page; project enquiries go through its \"Start a Project\" form.",
    "",
    "## Services",
    "",
    ...categoryOrder.map((id) => `- ${categories[id].name}: ${SERVICE_DETAILS[id].text}`),
    "",
    "## Process",
    "",
    "Discover, Design, Build, Launch, Scale: from workshops and audits to Next.js engineering, a careful launch and ongoing iteration.",
    "",
    "## Selected work",
    "",
    ...PROJECTS.map((project) => `- ${project.title} (${project.type}): ${project.summary}`),
    "",
    "## Contact",
    "",
    `- Website: ${SITE_URL}`,
    `- Email: ${CONTACT_EMAIL}`,
    `- Instagram: ${INSTAGRAM_URL}`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
