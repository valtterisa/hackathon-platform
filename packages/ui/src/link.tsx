"use client";

import {
  createContext,
  useContext,
  type AnchorHTMLAttributes,
  type ComponentType,
  type ReactNode,
} from "react";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const LinkContext = createContext<ComponentType<LinkProps>>(
  function PlainLink(props) {
    return <a {...props} />;
  },
);

/** Lets each app route `href`s through its own router link (e.g. next/link). */
export function UiLinkProvider({
  link,
  children,
}: {
  link: ComponentType<LinkProps>;
  children: ReactNode;
}) {
  return <LinkContext.Provider value={link}>{children}</LinkContext.Provider>;
}

export function UiLink(props: LinkProps) {
  const Link = useContext(LinkContext);
  return <Link {...props} />;
}
