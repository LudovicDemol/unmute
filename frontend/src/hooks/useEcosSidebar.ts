type SidebarRouteConfig = {
  hidden: boolean;      // disparaît complètement
  defaultExpanded: boolean;  // réduit par défaut
};

export function getSidebarConfig(pathname: string): SidebarRouteConfig {
  if (pathname === "/") {
    return { hidden: true, defaultExpanded: false };
  }
  if (pathname.startsWith("/conversation/")) {
    return { hidden: false, defaultExpanded: false }; // réduit par défaut
  }
  return { hidden: false, defaultExpanded: true }; // comportement normal
}