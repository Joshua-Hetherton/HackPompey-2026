document.querySelectorAll('.tier, .crossing').forEach((tier) => {
    const imagePath = tier.dataset.image;
    const blockSize = Math.max(1, Number(tier.dataset.block) || 8);
    const isCrossing = tier.classList.contains('crossing');

    if (!imagePath) {
        return;
    }

    const image = new Image();
    image.onload = () => {
        const smallWidth = Math.max(1, Math.ceil(image.naturalWidth / blockSize));
        const smallHeight = Math.max(1, Math.ceil(image.naturalHeight / blockSize));

        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = smallWidth;
        smallCanvas.height = smallHeight;

        const smallContext = smallCanvas.getContext('2d');
        smallContext.imageSmoothingEnabled = false;
        smallContext.drawImage(image, 0, 0, smallWidth, smallHeight);

        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = image.naturalWidth;
        outputCanvas.height = image.naturalHeight;

        const outputContext = outputCanvas.getContext('2d');
        outputContext.imageSmoothingEnabled = false;
        outputContext.drawImage(
            smallCanvas,
            0,
            0,
            smallWidth,
            smallHeight,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight
        );

        if (isCrossing) {
            const pixels = outputContext.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
            for (let index = 0; index < pixels.data.length; index += 4) {
                const gray = (pixels.data[index] * 0.299 + pixels.data[index + 1] * 0.587 + pixels.data[index + 2] * 0.114) * 0.58;
                pixels.data[index] = gray;
                pixels.data[index + 1] = gray;
                pixels.data[index + 2] = gray;
            }
            outputContext.putImageData(pixels, 0, 0);
        }

        const imageFormat = isCrossing ? 'image/png' : 'image/jpeg';
        tier.style.backgroundImage = `url("${outputCanvas.toDataURL(imageFormat, 0.82)}")`;
        tier.classList.add('pixelated');
    };

    image.src = imagePath.replaceAll('\\', '/');
});