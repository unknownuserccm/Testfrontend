const BACKEND_URL = "https://testbackend-ouw8.onrender.com/"; // Change to your backend URL

(function() {
  let devtoolsSuspected = false;

  async function reportToBackend(trigger) {
    try {
      await fetch(`${BACKEND_URL}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          trigger,
          fingerprint: {
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            timestamp: Date.now(),
          }
        })
      });
    } catch (e) {
      console.warn("Reporting failed:", e);
    }
  }

  function checkDimensions() {
    if (Math.abs(window.outerWidth - window.innerWidth) > 160 ||
        Math.abs(window.outerHeight - window.innerHeight) > 160) {
      devtoolsSuspected = true;
      reportToBackend("dimension_mismatch");
    }
  }

  function debuggerTrap() {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 50) {
      devtoolsSuspected = true;
      reportToBackend("debugger_pause");
    }
  }

  function consoleTrap() {
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: function() {
        devtoolsSuspected = true;
        reportToBackend("console_opened");
      }
    });
    console.log(element);
  }

  async function wasmDelayCheck() {
    try {
      const wasmModule = await WebAssembly.compile(
        new Uint8Array([0x00,0x61,0x73,0x6d,0x01,0x00,0x00,0x00,
          0x01,0x05,0x01,0x60,0x00,0x01,0x7f,
          0x03,0x02,0x01,0x00,
          0x07,0x05,0x01,0x01,0x66,0x00,0x00,
          0x0a,0x07,0x01,0x05,0x00,0x41,0x2a,0x0f,0x0b])
      );
      const instance = await WebAssembly.instantiate(wasmModule);
      const start = performance.now();
      instance.exports.f();
      if (performance.now() - start > 50) {
        devtoolsSuspected = true;
        reportToBackend("wasm_delay");
      }
    } catch {
      devtoolsSuspected = true;
      reportToBackend("wasm_error");
    }
  }

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") ||
      (e.metaKey && e.altKey && e.key.toLowerCase() === "i")
    ) {
      devtoolsSuspected = true;
      reportToBackend("devtools_shortcut");
    }
  });

  function functionTamperCheck() {
    if (Function.prototype.toString.toString().length !== 33) {
      devtoolsSuspected = true;
      reportToBackend("function_tamper");
    }
  }

  setInterval(() => {
    checkDimensions();
    debuggerTrap();
    consoleTrap();
    wasmDelayCheck();
    functionTamperCheck();

    if (devtoolsSuspected) {
      fetch(`${BACKEND_URL}/verify`, { credentials: "include" })
        .then(res => {
          if (res.status === 403) window.location.href = "/blocked.html";
        });
    }
  }, 2000);
})();
