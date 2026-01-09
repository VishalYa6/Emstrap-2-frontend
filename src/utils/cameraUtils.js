/**
 * Utility functions for camera access and photo capture
 * Handles permissions and error cases
 */

/**
 * Request camera permission and capture a photo
 * @returns {Promise<File>} The captured photo file
 */
export const capturePhoto = () => {
  return new Promise((resolve, reject) => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile
    
    input.onchange = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          reject(new Error('Please select an image file'));
          return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          reject(new Error('Image size must be less than 10MB'));
          return;
        }
        
        resolve(file);
      } else {
        reject(new Error('No file selected'));
      }
    };

    input.onerror = () => {
      reject(new Error('Failed to access camera'));
    };

    // Trigger file picker
    input.click();
  });
};

/**
 * Alternative: Use MediaDevices API for direct camera access
 * This provides better UX but requires HTTPS
 */
export const capturePhotoFromCamera = () => {
  return new Promise((resolve, reject) => {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      reject(new Error('Camera access is not supported in this browser'));
      return;
    }

    // Request camera permission
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        // Create video element to show camera preview
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        // Create canvas to capture photo
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.addEventListener('loadedmetadata', () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        });

        // Function to capture photo
        const capture = () => {
          ctx.drawImage(video, 0, 0);
          
          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              // Stop camera stream
              stream.getTracks().forEach((track) => track.stop());
              
              if (blob) {
                // Convert blob to File
                const file = new File([blob], `photo_${Date.now()}.jpg`, {
                  type: 'image/jpeg',
                });
                resolve(file);
              } else {
                reject(new Error('Failed to capture photo'));
              }
            },
            'image/jpeg',
            0.9
          );
        };

        // You can show a preview UI here and call capture() on button click
        // For now, we'll capture immediately (you may want to add UI)
        setTimeout(capture, 500); // Small delay to ensure video is ready
      })
      .catch((error) => {
        let errorMessage = 'Camera access denied';
        
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please enable camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        }
        
        reject(new Error(errorMessage));
      });
  });
};

