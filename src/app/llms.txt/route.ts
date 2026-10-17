import { categories, categoryOrder } from "@/lib/taxonomy";
import { SERVICE_DETAILS, servicePath } from "@/lib/services";
import { PROJECTS, projectPath } from "@/lib/projects";
import { PROCESS_STEPS } from "@/lib/process";
import { CONTACT_EMAIL, INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/* /llms.txt (llmstxt.org): a plain summary of the studio for AI assistants, prerendered at build time. */
export function GET() {
  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "SPARK is one studio covering research, design, engineering and hosting, based in Casablanca and working with clients worldwide. Project enquiries go through the \"Start a Project\" form on any page.",
    "",
    "## Services",
    "",
    `- [All services](${SITE_URL}/services): the five disciplines on one page`,
    ...categoryOrder.map(
      (id) => `- [${SERVICE_DETAILS[id].title}](${SITE_URL}${servicePath(id)}): ${categories[id].name}. ${SERVICE_DETAILS[id].text}`,
    ),
    "",
    "## Case studies",
    "",
    `- [All case studies](${SITE_URL}/work)`,
    ...PROJECTS.map(
      (project) => `- [${project.title}](${SITE_URL}${projectPath(project.slug)}): ${project.type}. ${project.summary}`,
    ),
    "",
    "## Process",
    "",
    ...PROCESS_STEPS.map((step) => `- ${step.title}: ${step.body}`),
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
