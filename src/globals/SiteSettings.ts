import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: { read: () => true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'heroName', type: 'text', required: true, defaultValue: 'Ahmad Saufi', admin: { description: 'Paparan nama besar. Guna <br> untuk baris baru' } },
            {
              name: 'heroRoles',
              type: 'array',
              labels: { singular: 'Role', plural: 'Roles (typewriter)' },
              defaultValue: [
                { role: 'SOFTWARE & AI ENGINEER' },
                { role: 'FULL-STACK DEVELOPER' },
                { role: 'RAG PIPELINE BUILDER' },
                { role: 'AGENTIC AI TINKERER' },
              ],
              fields: [{ name: 'role', type: 'text', required: true }],
            },
            { name: 'heroBody', type: 'textarea', required: true, defaultValue: 'I build intelligent systems and the web apps around them — RAG pipelines, agentic AI workflows, and full-stack products with React, Node.js, Python and cloud infrastructure.' },
            { name: 'heroChip', type: 'text', required: true, defaultValue: 'Software & AI Engineer @ MCMC' },
            { name: 'heroCred', type: 'text', required: true, defaultValue: '3+ years shipping web apps · RAG · Agentic AI · React · Node.js · Python · Docker' },
            { name: 'heroImage', type: 'upload', relationTo: 'media', required: true },
            { name: 'heroImageAlt', type: 'text', defaultValue: 'Glowing neural network sphere with orbiting geometric rings' },
          ],
        },
        {
          label: 'About',
          fields: [
            {
              name: 'aboutParagraphs',
              type: 'array',
              labels: { singular: 'Paragraph', plural: 'Paragraphs' },
              defaultValue: [
                { text: "I'm a software & AI engineer based in Malaysia with 3+ years of experience building web applications. Currently a Software Engineer at MCMC, where I lead development using React, Node.js, and Django Rest Framework — with CI/CD pipelines, containerization, and on-prem deployment." },
                { text: 'Beyond the full-stack work, I build applied AI systems: production RAG platforms with multi-worker document parsing, agentic workflows, and self-hosted LLM infrastructure. I care about clean code, performance, and shipping things that actually work.' },
              ],
              fields: [{ name: 'text', type: 'textarea', required: true }],
            },
            {
              name: 'stats',
              type: 'array',
              labels: { singular: 'Stat', plural: 'Stats (count-up)' },
              defaultValue: [
                { num: 3, suffix: '+', label: 'Years Experience' },
                { num: 2, suffix: '', label: 'Companies' },
                { num: 20, suffix: '+', label: 'Technologies' },
              ],
              fields: [
                { name: 'num', type: 'number', required: true },
                { name: 'suffix', type: 'text', defaultValue: '' },
                { name: 'label', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'email', type: 'email', required: true, defaultValue: 'a.saufi.contact@gmail.com' },
            { name: 'githubUrl', type: 'text', defaultValue: 'https://github.com/saufi-opi' },
            { name: 'linkedinUrl', type: 'text', defaultValue: 'https://linkedin.com/in/ahmad-saufi-mohamad' },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'metaTitle', type: 'text', defaultValue: 'Ahmad Saufi | Software & AI Engineer' },
            { name: 'metaDescription', type: 'textarea', defaultValue: 'Ahmad Saufi — Software & AI Engineer based in Malaysia. RAG pipelines, agentic AI, full-stack web apps, cloud infrastructure & DevOps.' },
            { name: 'ogImage', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Footer',
          fields: [
            { name: 'version', type: 'text', defaultValue: 'v4.0.0' },
            { name: 'footerNote', type: 'text', defaultValue: 'Software & AI Engineer. Next.js + Payload CMS.' },
            {
              name: 'marqueeWords',
              type: 'array',
              labels: { singular: 'Word', plural: 'Marquee words' },
              defaultValue: [{ word: 'Code' }, { word: 'Train' }, { word: 'Deploy' }, { word: 'Ship' }],
              fields: [{ name: 'word', type: 'text', required: true }],
            },
          ],
        },
      ],
    },
  ],
}
