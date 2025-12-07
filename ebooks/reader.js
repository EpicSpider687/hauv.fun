import * as pdfjsLib from "./pdfjs/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "./pdfjs/pdf.worker.mjs";

const params = new URLSearchParams(window.location.search);
const book = params.get("book");

let pdfDoc = null;
let pageNum = parseInt(localStorage.getItem(`page_${book}`)) || 1;

const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

// Load the PDF document
pdfjsLib.getDocument(`books/${book}`).promise.then(pdf => {
  pdfDoc = pdf;
  renderPage(pageNum);
});

// Function to render the page on the canvas
function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: 1.5 });

    // Adjust canvas size based on viewport
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render the page
    page.render({
      canvasContext: ctx,
      viewport
    });

    // Display current page info
    document.getElementById("pageInfo").innerText =
      `Page ${num} / ${pdfDoc.numPages}`;

    // Save the current page to localStorage
    localStorage.setItem(`page_${book}`, num);
  });
}

// Next and Previous button event listeners
document.getElementById("next").onclick = () => {
  if (pageNum < pdfDoc.numPages) {
    pageNum++;
    renderPage(pageNum);
  }
};

document.getElementById("prev").onclick = () => {
  if (pageNum > 1) {
    pageNum--;
    renderPage(pageNum);
  }
};

// Handle clicks on the left or right side of the canvas for mobile
canvas.addEventListener('click', (e) => {
  const halfScreen = canvas.width / 2;

  if (e.clientX < halfScreen) {
    // Left side clicked: Previous page
    if (pageNum > 1) {
      pageNum--;
      renderPage(pageNum);
    }
  } else {
    // Right side clicked: Next page
    if (pageNum < pdfDoc.numPages) {
      pageNum++;
      renderPage(pageNum);
    }
  }
});

// Keyboard navigation for desktop users
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    if (pageNum > 1) {
      pageNum--;
      renderPage(pageNum);
    }
  }
  if (e.key === 'ArrowRight') {
    if (pageNum < pdfDoc.numPages) {
      pageNum++;
      renderPage(pageNum);
    }
  }
});
