const params = new URLSearchParams(window.location.search);
const book = params.get("book");

const saveKey = `page_${book}`;
let pageNum = parseInt(localStorage.getItem(saveKey)) || 1;

const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

let pdfDoc = null;

pdfjsLib.GlobalWorkerOptions.workerSrc = "pdfjs/pdf.worker.js";

pdfjsLib.getDocument(`books/${book}`).promise.then(pdf => {
  pdfDoc = pdf;
  renderPage(pageNum);
});

function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    page.render({
      canvasContext: ctx,
      viewport: viewport
    });

    document.getElementById("pageInfo").innerText =
      `Page ${num} / ${pdfDoc.numPages}`;

    localStorage.setItem(saveKey, num);
  });
}

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

