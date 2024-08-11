import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "PejmanNik",
  EMAIL: "pejmanNikram@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 4,
  NUM_WORKS_ON_HOMEPAGE: 0,
  NUM_PROJECTS_ON_HOMEPAGE: 4,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "my blog and portfolio.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "A collection of articles on topics I am passionate about.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "A collection of my projects.",
};

export const SOCIALS: Socials = [
  { 
    NAME: "github",
    HREF: "https://github.com/PejmanNik"
  },
  { 
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/pejman-nikram",
  },
  { 
    NAME: "unsplash",
    HREF: "https://unsplash.com/@pejmannik",
  },
  { 
    NAME: "instagram",
    HREF: "https://www.instagram.com/pejman.nik/",
  }
];
