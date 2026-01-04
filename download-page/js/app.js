// ====== CONFIG (Kau cuma tukar bahagian ini) ======
const CONFIG = {
  telegramUrl: "https://t.me/Kiwi5G88?text=Hi",whatsappUrl: "https://wa.me/601137099600?text=Hi",

  android: {
    label: "Android - 2026.01.04",url: "https://appsetup.yidaiyiluclub.com/apk/Mega888_V1.2.apk"
  },
  ios: {
    label: "iOS 64Bit - 2026.01.04",url: "https://appsetup.yidaiyiluclub.com/apk/Mega888_V1.2.apk"
  },
  windows: {
    label: "Windows PC - 2026.01.04",url: "https://appsetup.yidaiyiluclub.com/pc/Mega888.zip"
  }
};

// ====== SET UI TEXT ======
document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("btnTelegram").href = CONFIG.telegramUrl;
document.getElementById("btnWhatsapp").href = CONFIG.whatsappUrl;

document.getElementById("androidSub").textContent = CONFIG.android.label;
document.getElementById("iosSub").textContent = CONFIG.ios.label;
document.getElementById("winSub").textContent = CONFIG.windows.label;

// ====== SAFE DOWNLOAD HANDLER ======
function goDownload(url, hintElId){
  if(!url || url.includes("PASTE_")){
    const hint = document.getElementById(hintElId);
    hint.textContent = "❗ Link belum diisi. Sila paste link download dalam js/app.js (CONFIG).";
    return;
  }
  // direct open (download)
  window.location.href = url;
}

document.getElementById("btnAndroid").addEventListener("click", ()=> goDownload(CONFIG.android.url, "androidHint"));
document.getElementById("btnIOS").addEventListener("click", ()=> goDownload(CONFIG.ios.url, "iosHint"));
document.getElementById("btnWindows").addEventListener("click", ()=> goDownload(CONFIG.windows.url, "winHint"));

// ====== OPTIONAL: Hide iOS button if empty ======
if(!CONFIG.ios.url || CONFIG.ios.url.trim()===""){
  document.getElementById("btnIOS").disabled = true;
  document.getElementById("btnIOS").textContent = "iOS (Link not available)";
  document.getElementById("btnIOS").style.opacity = ".65";
  document.getElementById("btnIOS").style.cursor = "not-allowed";
}
