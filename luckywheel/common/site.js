// common/site.js

const LS_KEY = "admin.selectedSite.v1";
export function getAdminSite(){
  const sp = new URLSearchParams(location.search);
  const q = (sp.get("site") || "").toLowerCase();
  if(q) return q;

  const ls = (localStorage.getItem(LS_KEY) || "").toLowerCase();
  if(ls) return ls;

  return "5g88";
}

export function setAdminSite(siteKey){
  const v = String(siteKey || "").toLowerCase();
  localStorage.setItem(LS_KEY, v);
  return v;
}

export function siteRoot(siteKey){
  const v = String(siteKey || "5g88").toLowerCase();
  return `sites/${v}`;
}
