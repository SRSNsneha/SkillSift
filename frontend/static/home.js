const images = [
  'url("/static/resume 3.png")',
  'url("/static/resume 6.png")',
  'url("/static/resume 7.png")',
  'url("/static/resume 8.png")',
  
];

let currentIndex = 0;

function cycleBackground() {
  currentIndex = (currentIndex + 1) % images.length;
  document.body.style.backgroundImage = images[currentIndex];
  updateDots();
}

function updateDots() {
  for (let i = 0; i < images.length; i++) {
    const dot = document.getElementById(`dot${i}`);
    if (dot) {
      dot.classList.toggle('active', i === currentIndex);
    }
  }
}

// Initial background + dot
document.body.style.backgroundImage = images[currentIndex];
updateDots();
