// imageResizer.js
export async function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (event) => {
            img.src = event.target.result;
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Calcular el nuevo tamaño
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                const newFile = new File([blob], file.name, { type: file.type });
                resolve(newFile);
            }, file.type);
        };

        reader.readAsDataURL(file);
    });
}

export function formatoFechaHora(fecha) {
    const ahora = fecha;
    const opciones = {
        weekday: 'short',  // 'mie' para miércoles
        year: 'numeric',   // '2024'
        month: 'short',    // 'Oct'
        day: 'numeric',    // '23'
        hour: '2-digit',   // '11'
        minute: '2-digit', // '26'
        hour12: true       // para formato de 12 horas
    };
    return ahora.toLocaleString('es-ES', opciones);
}
