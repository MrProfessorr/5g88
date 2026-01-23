export function getSiteKey(){
  const sp = new URLSearchParams(location.search);
  const q = (sp.get("site") || "").toLowerCase();
  if(q) return q;

  const ls = (localStorage.getItem("selectedSite") || "").toLowerCase();
  if(ls) return ls;

  return "5g88";
}

export function siteRoot(siteKey){
  return `sites/${siteKey}`;
}
