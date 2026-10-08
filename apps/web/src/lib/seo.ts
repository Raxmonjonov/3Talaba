import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  absoluteUrl,
  AUTH_PATHS,
  getDictionary,
  landingPath,
  LOCALES,
  seoMeta,
  SITE_URL,
  type Locale,
} from "@/i18n/config";

const SITE_NAME = "3Talab";

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
}

function upsertLink(rel: string, hreflang: string | null, href: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    if (hreflang) element.setAttribute("hreflang", hreflang);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function structuredData(locale: Locale) {
  const dictionary = getDictionary(locale);

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/apple-touch-icon.png"),
        width: 180,
        height: 180,
      },
      description: dictionary.meta.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: dictionary.meta.description,
      inLanguage: LOCALES.map((option) => option.code),
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ];
}

/**
 * This app is a client-rendered SPA, so the document head is managed from here.
 * Static assets (og-image, sitemap.xml, robots.txt, icons) ship from public/.
 */
export function useSeo(locale: Locale) {
  useEffect(() => {
    const meta = seoMeta(locale);
    const canonical = absoluteUrl(landingPath(locale));

    document.title = meta.title;
    document.documentElement.lang = locale;

    upsertMeta('meta[name="description"]', { name: "description", content: meta.description });
    // Landing pages are meant to be indexed; auth pages set noindex again.
    upsertMeta('meta[name="robots"]', { name: "robots", content: "index, follow" });

    upsertLink("canonical", null, canonical);
    for (const option of LOCALES) {
      upsertLink("alternate", option.hreflang, absoluteUrl(landingPath(option.code)));
    }
    upsertLink("alternate", "x-default", absoluteUrl(landingPath("uz")));

    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: meta.title });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: meta.description,
    });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    upsertMeta('meta[property="og:locale"]', {
      property: "og:locale",
      content: meta.option.ogLocale,
    });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: meta.image });
    upsertMeta('meta[property="og:image:width"]', {
      property: "og:image:width",
      content: "1200",
    });
    upsertMeta('meta[property="og:image:height"]', {
      property: "og:image:height",
      content: "630",
    });
    upsertMeta('meta[property="og:image:alt"]', {
      property: "og:image:alt",
      content: getDictionary(locale).meta.ogAlt,
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: meta.title });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: meta.description,
    });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: meta.image });
    upsertMeta('meta[name="twitter:image:alt"]', {
      name: "twitter:image:alt",
      content: getDictionary(locale).meta.ogAlt,
    });

    let script = document.head.querySelector<HTMLScriptElement>(
      'script[data-3talab="structured-data"]'
    );
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset["3talab"] = "structured-data";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData(locale));
  }, [locale]);
}

/**
 * Auth pages are personal entry points: a localized tab title, the right
 * <html lang>, a canonical that ignores the ?locale= variant, and noindex
 * (they carry no public content). The landing's useSeo flips robots back
 * to index, follow when the visitor returns.
 */
export function useAuthSeo(mode: "login" | "register", locale: Locale) {
  useEffect(() => {
    const dictionary = getDictionary(locale);
    const label = mode === "login" ? dictionary.nav.login : dictionary.nav.register;

    document.title = `${label} — 3Talab`;
    document.documentElement.lang = locale;
    upsertMeta('meta[name="robots"]', { name: "robots", content: "noindex, follow" });
    upsertLink("canonical", null, absoluteUrl(AUTH_PATHS[mode]));
  }, [mode, locale]);
}

const APP_ROUTES = ["/dashboard", "/study", "/placement"];

/**
 * The signed-in app screens are Uzbek-only personal data: keep the tab title
 * neutral, the language correct for assistive tech, and the pages out of the
 * index. Renders nothing.
 */
export function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!APP_ROUTES.some((route) => pathname.startsWith(route))) return;

    document.title = "3Talab";
    document.documentElement.lang = "uz";
    upsertMeta('meta[name="robots"]', { name: "robots", content: "noindex, nofollow" });
  }, [pathname]);

  return null;
}
