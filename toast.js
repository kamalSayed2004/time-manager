class Toast {
  constructor() {
    this.container = document.createElement("div");
    this.container.className = "toast-container";
    document.body.appendChild(this.container);
  }

  show(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    this.container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(100%)";
      setTimeout(() => {
        if (this.container.contains(toast)) {
          this.container.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
}

const toast = new Toast();
window.toast = toast;
