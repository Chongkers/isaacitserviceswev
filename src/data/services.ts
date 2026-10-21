// Single source for the service cards, modals and /services/<slug>/ pages.
// Copy is the site owner's existing text (CLAUDE.md: no AI-written copy); edit it here.
// Illustrations live in src/assets/services/ (unDraw, see ASSETS.md).

export interface Quote {
  text: string;
  role: string;
  company: string;
}

export interface Service {
  slug: string;
  title: string;
  summary: string;
  items: string[];
  note?: string;
  quotes?: Quote[];
  caseStudy?: { title: string; body: string };
  icon: { viewBox: string; paths: string };
  illustrations: [hero: string, detail: string];
}

export const services: Service[] = [
  {
    slug: 'it-solutions-delivery',
    title: 'IT Solutions Delivery',
    summary:
      'Custom Web & Mobile App development, Cloud Migration (Azure/AWS/GCP), and ERP/CRM implementations including Salesforce and Zoho.',
    items: ['Custom Web & Mobile App development', 'Cloud Migration (Azure/AWS/GCP)', 'ERP/CRM implementations including Salesforce and Zoho'],
    icon: {
      viewBox: '0 0 20 20',
      paths:
        '<path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>',
    },
    illustrations: ['web-developer', 'deploy-globally'],
  },
  {
    slug: 'business-intelligence',
    title: 'Business Intelligence',
    summary: 'Power BI dashboards, data warehousing, and predictive modeling for BPO, Finance, and Retail sectors.',
    items: ['Power BI dashboards', 'Data warehousing', 'Predictive modeling'],
    note: 'For BPO, Finance, and Retail sectors.',
    caseStudy: {
      title: 'Driving Efficiency in Humanitarian Response Through BI Solutions',
      body: 'ISAAC IT Services partnered with a leading NGO to create a BI dashboard that tracked typhoon relief efforts. By cleansing and integrating data from multiple sources, the team delivered real-time insights on resource allocation, relief effectiveness, and respondent preferences. The solution empowered the NGO to make faster, data-informed decisions and improve the impact of future disaster responses.',
    },
    icon: {
      viewBox: '0 0 24 24',
      paths:
        '<path fill-rule="evenodd" d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0 1 12 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 0 1 7.5 5.455V5.25Zm7.5 0v.09a49.488 49.488 0 0 0-6 0v-.09a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5Zm-3 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd"/><path d="M3 18.4v-2.796a4.3 4.3 0 0 0 .713.31A26.226 26.226 0 0 0 12 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 0 1-6.477-.427C4.047 21.128 3 19.852 3 18.4Z"/>',
    },
    illustrations: ['real-time-analytics', 'predictive-analytics'],
  },
  {
    slug: 'cybersecurity',
    title: 'Cybersecurity',
    summary: 'VAPT, Managed SOC, and Compliance readiness for DPA, ISO 27001, and local NPC/BSP regulations.',
    items: ['VAPT', 'Managed SOC', 'Compliance readiness for DPA, ISO 27001, and local NPC/BSP regulations'],
    quotes: [
      {
        text: 'Partnering with ISAAC IT Services significantly strengthened our cybersecurity posture. Their Cybersecurity Team-as-a-Service provided us with access to experienced security professionals.',
        role: 'Operations Manager',
        company: 'Materials Solutions Inc.',
      },
      {
        text: 'ISAAC IT Services provided us with excellent SOC Managed Services support, giving our organization 24/7 visibility into security threats.',
        role: 'CISO',
        company: 'Chryschem',
      },
    ],
    icon: {
      viewBox: '0 0 24 24',
      paths:
        '<path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clip-rule="evenodd"/>',
    },
    illustrations: ['firewall', 'security-on'],
  },
  {
    slug: 'it-operations',
    title: 'IT Operations (ITOps)',
    summary: '24/7 Infrastructure monitoring, Helpdesk as a Service, and full Microsoft 365/Azure administration.',
    items: ['24/7 Infrastructure monitoring', 'Helpdesk as a Service', 'Full Microsoft 365/Azure administration'],
    quotes: [
      {
        text: 'Company reliable technology partner for our organization. Their IT Shared Services approach helped streamline our day-to-day IT operations, improve system reliability, and reduce downtime across multiple departments.',
        role: 'Operations Manager',
        company: 'Gulf Oil Philippines',
      },
    ],
    icon: {
      viewBox: '0 0 20 20',
      paths:
        '<path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>',
    },
    illustrations: ['maintenance', 'server-status'],
  },
  {
    slug: 'digital-marketing',
    title: 'Digital Marketing',
    summary: 'Data-driven SEO, Social Media management, and specialized OFW-targeted or Real Estate campaigns.',
    items: ['Data-driven SEO', 'Social Media management', 'Specialized OFW-targeted or Real Estate campaigns'],
    icon: {
      viewBox: '0 0 20 20',
      paths:
        '<path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"/><path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>',
    },
    illustrations: ['web-search', 'social-media'],
  },
  {
    slug: 'ai-solutions',
    title: 'AI Solutions',
    summary:
      'Transform business processes with AI Chatbots, Intelligent Process Automation (IPA), and custom Machine Learning solutions.',
    items: ['AI Chatbots', 'Intelligent Process Automation (IPA)', 'Custom Machine Learning solutions'],
    quotes: [
      {
        text: 'ISAAC IT Services successfully delivered automation and custom solutions that improved our operational efficiency and reporting processes.',
        role: 'CIO',
        company: 'Kennemer Group',
      },
    ],
    icon: {
      viewBox: '0 0 24 24',
      paths:
        '<path fill-rule="evenodd" d="M10.5 3.798v5.02a3 3 0 0 1-.879 2.121l-2.377 2.377a9.845 9.845 0 0 1 5.091 1.013 8.315 8.315 0 0 0 5.713.636l.285-.071-3.954-3.955a3 3 0 0 1-.879-2.121v-5.02a23.614 23.614 0 0 0-3 0Zm4.5.138a.75.75 0 0 0 .093-1.495A24.837 24.837 0 0 0 12 2.25a25.048 25.048 0 0 0-3.093.191A.75.75 0 0 0 9 3.936v4.882a1.5 1.5 0 0 1-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0 1 15 8.818V3.936Z" clip-rule="evenodd"/>',
    },
    illustrations: ['ai-chat', 'artificial-intelligence'],
  },
];

export const serviceHref = (s: Service) => `/services/${s.slug}/`;
