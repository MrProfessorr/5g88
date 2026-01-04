// ====== CONFIG (Kau cuma tukar bahagian ini) ======
const CONFIG = {
  telegramUrl: "https://t.me/USERNAME_KAU",            // ✅ tukar
  whatsappUrl: "https://wa.me/60123456789?text=Hi",    // ✅ tukar

  android: {
    label: "Android - 2024.04.02",
    url: "PASTE_ANDROID_APK_LINK_DI_SINI"
  },
  ios: {
    label: "iOS 64Bit - 2024.04.09",
    url: "PASTE_IOS_LINK_DI_SINI" // boleh kosong kalau tak ada
  },
  windows: {
    label: "Windows PC - 2022.02.13",
    url: "PASTE_WINDOWS_EXE_LINK_DI_SINI"
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
