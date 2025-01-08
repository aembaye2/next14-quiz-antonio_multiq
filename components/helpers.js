const retrieveAndLogImageAsJson = () => {
  // Retrieve the image data URL from localStorage
  const imageDataURL = localStorage.getItem("canvasImage-4"); // replace with your image key

  if (!imageDataURL) {
    console.error("Image not found in localStorage");
    return;
  }

  // Create an Image object
  const image = new Image();

  // Load the image from the data URL
  image.onload = () => {
    // Create a canvas to draw the image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      console.error("Failed to get 2D context");
      return;
    }

    // Set canvas size based on the image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0);

    // Convert canvas to a data URL (or you could use .toBlob() if needed)
    const jsonImageData = {
      imageDataURL: canvas.toDataURL("image/png"), // This is the Base64-encoded image data
      width: canvas.width,
      height: canvas.height,
    };

    // Log the JSON object that represents the image
    console.log("Image in JSON format:", JSON.stringify(jsonImageData));
  };

  // Set the source of the image to the data URL from localStorage
  image.src = imageDataURL;
};
