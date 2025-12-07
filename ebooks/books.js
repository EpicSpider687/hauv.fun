import * as pdfjsLib from './pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.mjs';

// Only one book
const books = [
    { 
        title: "Sword Art Online Vol. 1", 
        icon: "icons/SAO-V1-Icon.png", 
        pdf: "books/SwordArtOnline-Volume1.pdf" 
    }
];

const container = document.getElementById('book-container');
const modal = document.getElementById('reader-modal');
const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');
const closeBtn = document.getElementById('close-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let pdfDoc = null;
let currentPage = 1;
let currentBookKey = '';
let scale = 1.5; // default scale

function savePage(bookKey, page) {
    localStorage.setItem(bookKey, page);
}

function loadPage(bookKey) {
    return parseInt(localStorage.getItem(bookKey)) || 1;
}

function renderPage(num) {
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page.render({ canvasContext: ctx, viewport });
    });
}

function openBook(book) {
    currentBookKey = book.title;
    currentPage = loadPage(currentBookKey);
    modal.classList.remove('hidden');

    pdfjsLib.getDocument(book.pdf).promise.then(doc => {
        pdfDoc = doc;
        resizeCanvas();
        renderPage(currentPage);
    });
}

// adjust canvas scale to fit screen
function resizeCanvas() {
    if (!pdfDoc) return;
    pdfDoc.getPage(currentPage).then(page => {
        const viewport = page.getViewport({ scale: 1 });
        const maxWidth = window.innerWidth * 0.8;
        const maxHeight = window.innerHeight * 0.8;
        const scaleX = maxWidth / viewport.width;
        const scaleY = maxHeight / viewport.height;
        scale = Math.min(scaleX, scaleY, 2); // max 2x zoom
        renderPage(currentPage);
    });
}

// create book icon
books.forEach(book => {
    const div = document.createElement('div');
    div.className = 'book';
    div.innerHTML = `<img src="${book.icon}" alt="${book.title}"><p>${book.title}</p>`;
    div.addEventListener('click', () => openBook(book));
    container.appendChild(div);
});

// button events
closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

prevBtn.addEventListener('click', () => {
    if (currentPage <= 1) return;
    currentPage--;
    renderPage(currentPage);
    savePage(currentBookKey, currentPage);
});

nextBtn.addEventListener('click', () => {
    if (currentPage >= pdfDoc.numPages) return;
    currentPage++;
    renderPage(currentPage);
    savePage(currentBookKey, currentPage);
});

// keyboard navigation
document.addEventListener('keydown', e => {
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
});

// responsive on window resize
window.addEventListener('resize', () => {
    resizeCanvas();
});
