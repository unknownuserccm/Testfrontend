const BACKEND_URL = "https://testbackend-ouw8.onrender.com/"; // Replace with your backend URL

(function() {
  let devtoolsOpen = false;
  let rafLastTime = performance.now();

  // 1. Console getter detection
  function checkConsole() {
    const devtools = {};
    Object.defineProperty(devtools, 'id', {
      get: function() {
        devtoolsOpen = true;
        return true;
      }
    });
    console.log(devtools);
  }

  // 2. Debugger statement timing detection
  function checkDebuggerTiming() {
    const start = performance.now();
    debugger;
    const end = performance.now();
    if (end - start > 100) {
      devtoolsOpen = true;
    }
  }

  // 3. requestAnimationFrame timing detection
  function checkRafTiming() {
    requestAnimationFrame(() => {
      const now = performance.now();
      if (now - rafLastTime > 200) {
        devtoolsOpen = true;
      }
      rafLastTime = now;
      checkRafTiming();
    });
  }

  // Run checks repeatedly
  function detect() {
    devtoolsOpen = false;

    checkConsole();
    checkDebuggerTiming();

    if (devtoolsOpen) {
      window.location.href = "/404.html";
    }
  }

  // Start RAF timing loop
  checkRafTiming();

  // Run detect every second
  setInterval(detect, 1000);

})();
