const images = [
  'url("./static/resume3.png")',
  'url("./static/resume6.png")',
  'url("./static/resume7.png")',
  'url("./static/resume8.png")',
  
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
fetch("https://skillsift.onrender.com/visitor_count")
    .then(response => response.json())
    .then(data => {
      document.getElementById("visitCounter").innerText = "👀 : " + data.count;
    })
    .catch(() => {
      document.getElementById("visitCounter").innerText = "👀 : N/A";
    });

// Initial background + dot
document.body.style.backgroundImage = images[currentIndex];
updateDots();
