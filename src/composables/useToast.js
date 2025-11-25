import { ref } from "vue";

export function useToast() {
  const toastMessage = ref("");
  const showToast = ref(false);

  const showToastNotification = (message) => {
    toastMessage.value = message;
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  };

  return {
    toastMessage,
    showToast,
    showToastNotification,
  };
}

