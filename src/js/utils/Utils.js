export const Utils = {
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  formatDate(dateString) {
    return new Date(dateString || Date.now()).toLocaleDateString();
  },

  playAlertSound() {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.value = 880; // A5
    gainNode.gain.value = 0.1;

    oscillator.start();

    setTimeout(() => {
      gainNode.gain.value = 0;
    }, 200);
    setTimeout(() => {
      gainNode.gain.value = 0.1;
    }, 400);
    setTimeout(() => {
      oscillator.stop();
    }, 600);
  },
};
