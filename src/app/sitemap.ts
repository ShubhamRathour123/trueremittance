import type { MetadataRoute } from "next";

const routes = ["", "/about", "/methodology", "/trust"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://trueremittance.vercel.app${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "monthly",
    priority: route === "" ? 1 : 0.7
  }));
}
