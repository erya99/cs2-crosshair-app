import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://cs2crosshub.pro",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ];
}