import Cropper from 'cropperjs';

const getCroppedImg = (imageSrc, crop) => {
  return new Promise((resolve, reject) => {
    // Create a new image element
    const image = document.createElement('img');
    image.src = imageSrc;

    image.onload = () => {
      try {
        // Append the image to a temporary container to ensure it's part of the DOM
        const container = document.createElement('div');
        container.style.display = 'none'; // Hide container
        document.body.appendChild(container);
        container.appendChild(image);

        // Initialize Cropper
        const cropper = new Cropper(image, {
          viewMode: 1,
          autoCropArea: 1,
          background: false,
          zoomable: false,
          scalable: false,
          cropBoxMovable: false,
          cropBoxResizable: false,
          data: {
            x: crop.x,
            y: crop.y,
            width: crop.width,
            height: crop.height,
          },
        });

        // Get cropped canvas and convert to Blob
        const canvas = cropper.getCroppedCanvas();
        if (!canvas) {
          throw new Error('Failed to create canvas');
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileUrl = URL.createObjectURL(blob);
              resolve(fileUrl);
            } else {
              reject(new Error('Canvas is empty'));
            }

            // Cleanup
            cropper.destroy();
            document.body.removeChild(container);
          },
          'image/jpeg',
          0.8 // Adjust image quality if needed
        );
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
};

export default getCroppedImg;
