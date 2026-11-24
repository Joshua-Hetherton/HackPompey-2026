document.querySelectorAll('.tier').forEach((tier) => {
    const imagePath = tier.dataset.image;
    const blockSize = Math.max(1, Number(tier.dataset.block) || 8);

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

        tier.style.backgroundImage = `url("${outputCanvas.toDataURL('image/jpeg', 0.82)}")`;
        tier.classList.add('pixelated');
    };

    image.src = imagePath.replaceAll('\\', '/');
});