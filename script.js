document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and content
            tabButtons.forEach((btn) => btn.classList.remove('active'));
            tabContents.forEach((content) => content.classList.remove('active'));

            // Add active class to clicked button and target content
            button.classList.add('active');
            const targetTab = button.dataset.tab;
            document.getElementById(`${targetTab}-converter`).classList.add('active');
        });
    });

    // Image to PDF Upload Handling
    const dropZone = document.querySelector('.drop-zone');
    const imagePreview = document.querySelector('.image-preview');
    const imageInput = document.querySelector('.drop-zone-input');
    const imageToPdfButton = document.querySelector('#image-converter .btn-convert');

    let imageFiles = []; // Store uploaded images

    // Open file input dialog when drop zone is clicked
    dropZone.addEventListener('click', () => imageInput.click());
    
    // Handle file upload
    imageInput.addEventListener('change', handleFileUpload);

    function handleFileUpload(event) {
        const files = event.target.files;
        imageFiles = [...files]; // Store files for PDF generation
        imagePreview.innerHTML = ''; // Clear previous previews

        // Display previews of uploaded images
        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    const img = document.createElement('img');
                    img.src = reader.result;
                    img.style.width = '100px';
                    img.style.margin = '10px';
                    imagePreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Image to PDF Conversion Logic
    imageToPdfButton.addEventListener('click', () => {
        if (imageFiles.length === 0) {
            alert('Please upload at least one image.');
            return;
        }

        const { jsPDF } = window.jspdf;  // Access jsPDF from window.jspdf
        const pdf = new jsPDF(); // Create a new jsPDF instance

        imageFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = () => {
                const imgData = reader.result;
                const img = new Image();
                img.src = imgData;

                img.onload = () => {
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight(); // Correct way to get height

                    const imageWidth = img.width;
                    const imageHeight = img.height;

                    // Maintain aspect ratio
                    const width = pdfWidth;
                    const height = (imageHeight * width) / imageWidth;

                    // Add new page for additional images
                    if (index > 0) pdf.addPage(); 

                    // Add the image to the current page
                    pdf.addImage(img, 'JPEG', 0, 0, width, height);

                    // Save the PDF after the last image
                    if (index === imageFiles.length - 1) {
                        pdf.save('images.pdf');
                    }
                };
            };
            reader.readAsDataURL(file);
        });
    });

    // Text to PDF Conversion Logic
    const textInput = document.querySelector('.text-input');
    const fontSelect = document.querySelector('.font-select');
    const fontSizeSelect = document.querySelector('.font-size');
    const textToPdfButton = document.querySelector('#text-converter .btn-convert');

    // Update font style based on selection
    fontSelect.addEventListener('change', () => {
        textInput.style.fontFamily = fontSelect.value;
    });

    // Update font size based on selection
    fontSizeSelect.addEventListener('change', () => {
        textInput.style.fontSize = `${fontSizeSelect.value}px`;
    });

   // Convert text to PDF
textToPdfButton.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) {
        alert('Please enter some text to convert.');
        return;
    }

    const { jsPDF } = window.jspdf;  // Access jsPDF from window.jspdf

    const pdf = new jsPDF();
    const fontSize = parseInt(fontSizeSelect.value, 10);
    pdf.setFont(fontSelect.value, 'normal');
    pdf.setFontSize(fontSize);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margins = 10;
    const wrappedText = pdf.splitTextToSize(text, pageWidth - margins * 2);

    // Calculate the maximum number of lines per page
    const lineHeight = fontSize * 1.2; // Line height with some padding
    const linesPerPage = Math.floor((pdf.internal.pageSize.getHeight() - margins * 2) / lineHeight);

    let currentPage = 1;
    let lineIndex = 0;

    // Add lines to the PDF, with page breaks when needed
    while (lineIndex < wrappedText.length) {
        // Add text to the current page
        const pageText = wrappedText.slice(lineIndex, lineIndex + linesPerPage);
        pdf.text(pageText, margins, margins + (lineIndex % linesPerPage) * lineHeight);

        // Update the line index and check if a page break is needed
        lineIndex += linesPerPage;

        // If there are more lines, add a new page
        if (lineIndex < wrappedText.length) {
            pdf.addPage();
        }
    }

    pdf.save('text.pdf');
});
});