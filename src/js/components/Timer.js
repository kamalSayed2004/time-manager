import { Utils } from "../utils/Utils.js";
import { toast } from "./Toast.js";

export class Timer {
  constructor() {
    this.stopwatchInterval = null;
    this.timerInterval = null;
    this.initStopwatch();
    this.initTimer();
  }

  initStopwatch() {
    let seconds = 0;
    const display = {
      h: document.getElementById("stopwatch-hours"),
      m: document.getElementById("stopwatch-minutes"),
      s: document.getElementById("stopwatch-seconds"),
    };

    const updateDisplay = () => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;

      if (display.h) display.h.textContent = h.toString().padStart(2, "0");
      if (display.m) display.m.textContent = m.toString().padStart(2, "0");
      if (display.s) display.s.textContent = s.toString().padStart(2, "0");
    };

    const startBtn = document.getElementById("stopwatch-start");
    if (startBtn)
      startBtn.onclick = () => {
        clearInterval(this.stopwatchInterval);
        this.stopwatchInterval = setInterval(() => {
          seconds++;
          updateDisplay();
        }, 1000);
      };

    const stopBtn = document.getElementById("stopwatch-stop");
    if (stopBtn) stopBtn.onclick = () => clearInterval(this.stopwatchInterval);

    const resetBtn = document.getElementById("stopwatch-reset");
    if (resetBtn)
      resetBtn.onclick = () => {
        clearInterval(this.stopwatchInterval);
        seconds = 0;
        updateDisplay();
      };
  }

  initTimer() {
    const inputs = {
      h: document.getElementById("timer-hours"),
      m: document.getElementById("timer-minutes"),
      s: document.getElementById("timer-seconds"),
    };

    // Input validation
    Object.values(inputs).forEach((input) => {
      if (!input) return;
      input.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
      });
      input.addEventListener("blur", (e) => {
        if (e.target.value) e.target.value = e.target.value.padStart(2, "0");
      });
    });

    const startBtn = document.getElementById("timer-start");
    if (startBtn)
      startBtn.onclick = () => {
        let h = parseInt(inputs.h.value) || 0;
        let m = parseInt(inputs.m.value) || 0;
        let s = parseInt(inputs.s.value) || 0;
        let totalSeconds = h * 3600 + m * 60 + s;

        if (totalSeconds <= 0) return;

        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
          if (totalSeconds <= 0) {
            clearInterval(this.timerInterval);
            Utils.playAlertSound();
            toast.show("Timer finished!", "success");
            return;
          }
          totalSeconds--;

          const dh = Math.floor(totalSeconds / 3600);
          const dm = Math.floor((totalSeconds % 3600) / 60);
          const ds = totalSeconds % 60;

          inputs.h.value = dh.toString().padStart(2, "0");
          inputs.m.value = dm.toString().padStart(2, "0");
          inputs.s.value = ds.toString().padStart(2, "0");
        }, 1000);
      };

    const stopBtn = document.getElementById("timer-stop");
    if (stopBtn) stopBtn.onclick = () => clearInterval(this.timerInterval);

    const resetBtn = document.getElementById("timer-reset");
    if (resetBtn)
      resetBtn.onclick = () => {
        clearInterval(this.timerInterval);
        inputs.h.value = "";
        inputs.m.value = "";
        inputs.s.value = "";
      };
  }
}
