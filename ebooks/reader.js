import * as pdfjsLib from "./pdfjs/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "./pdfjs/pdf.worker.mjs";

const params = new URLSearchParams(window.location.search);
const book = params.get("book");

let pdfDoc = null;
let pageNum = parseInt(localStorage.getItem(`page_${book}`)) || 1;

const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

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
      viewport
    });

    document.getElementById("pageInfo").innerText =
      `Page ${num} / ${pdfDoc.numPages}`;

    localStorage.setItem(`page_${book}`, num);
  });
}

document.getElementById("next").onclick = () => {
  if (pageNum < pdfDoc.numPages) {
   
