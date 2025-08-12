const BACKEND_URL = ""; // Glitch server URL

// === DevTools Detection ===
(function devToolsDetection() {
    let threshold = 160; 
    let devtoolsOpen = false;

    setInterval(() => {
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {
            devtoolsOpen = true;
        }
        if (devtoolsOpen) {
            window.location.href = "/404.html";
        }
    }, 1000);
})();

// === Internet Connection & Backend Check ===
async function checkConnection() {
    if (!navigator.onLine) {
        window.location.href = "/404.html";
        return;
    }
    try {
        const res = await fetch(`${BACKEND_URL}/ping`);
        const data = await res.json();
        if (!data.status || data.status !== "ok") {
            window.location.href = "/404.html";
        }
    } catch {
        window.location.href = "/404.html";
    }
}

window.addEventListener("offline", checkConnection);
setInterval(checkConnection, 5000);
