const BACKEND_URL = "https://testbackend-ouw8.onrender.com/";  // Replace with your actual Render URL

// DevTools detection based on viewport size difference
(function detectDevTools() {
  const threshold = 160; // pixels difference threshold
  let devtoolsOpen = false;

  setInterval(() => {
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      devtoolsOpen = true;
    }

    if (devtoolsOpen) {
      window.location.href = "/404.html";
    }
  }, 1000);
})();

// Check internet connection and ping backend
async function checkConnection() {
  if (!navigator.onLine) {
    window.location.href = "/404.html";
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/ping`);
    const data = await response.json();

    if (!data.status || data.status !== "ok") {
      window.location.href = "/404.html";
    }
  } catch (error) {
    window.location.href = "/404.html";
  }
}

window.addEventListener("offline", checkConnection);
setInterval(checkConnection, 1000);
