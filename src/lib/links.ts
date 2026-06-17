export function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

export function getExternalLinkProps(href: string) {
  if (!isExternalHref(href)) {
    return {};
  }

  return {
    target: "_blank",
    rel: "noreferrer noopener",
  };
}
