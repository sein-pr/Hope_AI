document.addEventListener('DOMContentLoaded', () => {
  const modalContainer = document.createElement('div');
  modalContainer.id = 'video-modal-placeholder';
  document.body.appendChild(modalContainer);

  // Load the modal HTML
  fetch('components/video-modal.html')
    .then((res) => res.text())
    .then((html) => {
      modalContainer.innerHTML = html;

      const video = document.getElementById('uraVideo');
      const modalElement = document.getElementById('videoModal');

      if (!video || !modalElement) return;

      // Pause and reset video on modal close
      modalElement.addEventListener('hidden.bs.modal', () => {
        video.pause();
        video.currentTime = 0;
      });
    })
    .catch((err) => {
      console.error('Failed to load video modal:', err);
    });
});
