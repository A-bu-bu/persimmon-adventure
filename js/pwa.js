// PWA Service Worker Registration & Installation Prompt Handler
let deferredPrompt = null;

export function initPWA() {
  const installBtn = document.getElementById('btn-pwa-install');
  
  // Register Service Worker if supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.log('[PWA] Service Worker registration failed (normal when opening via file:// protocol):', err);
        });
    });
  }

  // Handle BeforeInstallPrompt event (Chrome, Edge, Android)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.style.display = 'flex';
    }
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] User response to install prompt: ${outcome}`);
        deferredPrompt = null;
        installBtn.style.display = 'none';
      } else {
        alert('請在瀏覽器選單中選擇「安裝應用程式」或「加到主畫面」即可安裝至手機/電腦桌面！');
      }
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App successfully installed');
    if (installBtn) installBtn.style.display = 'none';
    deferredPrompt = null;
  });

  // Check if running as installed standalone app
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  if (isStandalone && installBtn) {
    installBtn.style.display = 'none';
  }
}
