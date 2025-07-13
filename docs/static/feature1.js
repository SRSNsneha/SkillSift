document.getElementById("upload-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const fileInput = document.getElementById("resume");
  const formData = new FormData();
  const jobDescription = document.getElementById("job-description").value;
  formData.append("job_description", jobDescription);
  formData.append("file", fileInput.files[0]);

  const resultSection = document.getElementById("result");
  resultSection.classList.remove("hidden");
  resultSection.innerHTML = "<p>🔍 Analyzing resume... Please wait.</p>";

  try {
    const response = await fetch("https://skillsift.onrender.com/analyze_resume", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    // Build and display result content
    resultSection.innerHTML = `
      <h2>Extracted Information</h2>
      <p><strong>Email:</strong> <span id="email">${data.email}</span></p>
      <p><strong>Phone:</strong> <span id="phone">${data.phone}</span></p>
      <h3>Education:</h3>
      <ul id="education">
        ${data.education.map(item => `<li>${item}</li>`).join("")}
      </ul>
      <h3 id="match-percentage">Skill Match: ${data.skill_match_percentage}%</h3>
      <h3>Matched Skills:</h3>
      <ul id="matched-skills">
        ${data.matched_skills.map(skill => `<li>${skill}</li>`).join("")}
      </ul>
      <h3>Missing Skills:</h3>
      <ul id="missing-skills">
        ${data.missing_skills.map(skill => `<li>${skill}</li>`).join("")}
      </ul>
    `;

  } catch (err) {
    resultSection.innerHTML = "<p style='color:red'>❌ Error analyzing resume. Please try again later.</p>";
    console.error(err);
  }
});
