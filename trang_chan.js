document.addEventListener("DOMContentLoaded", () => {
  const messageElement = document.getElementById("custom-message");
  if (messageElement && typeof BLOCK_MESSAGE !== "undefined") {
    messageElement.textContent = BLOCK_MESSAGE;
  }

  const signatureLink = document.getElementById("signature-link");
  if (signatureLink && typeof REPO_URL !== "undefined") {
    signatureLink.href = REPO_URL;
  }
});
