document.getElementById("upload-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const fileInput = document.getElementById("resume");
  const formData = new FormData();
  const jobDescription = document.getElementById("job-description").value;
  formData.append("job_description", jobDescription);
  formData.append("file", fileInput.files[0]);

  try {
    const response = await fetch("http://127.0.0.1:5000/analyze_resume", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    // Show result section
    document.getElementById("result").classList.remove("hidden");

    // Fill in the fields
    document.getElementById("email").innerText = data.email;
    document.getElementById("phone").innerText = data.phone;

    // Education
    const eduList = document.getElementById("education");
    eduList.innerHTML = "";
    data.education.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      eduList.appendChild(li);
    });

    // Skill match percentage
    document.getElementById("match-percentage").innerText = `Skill Match: ${data.skill_match_percentage}%`;

    // Matched Skills
    const matchedList = document.getElementById("matched-skills");
    matchedList.innerHTML = "";
    data.matched_skills.forEach(skill => {
      const li = document.createElement("li");
      li.textContent = skill;
      matchedList.appendChild(li);
    });

    // Missing skills
    const missingSkillsList = document.getElementById("missing-skills");
    missingSkillsList.innerHTML = "";
    data.missing_skills.forEach(skill => {
      const li = document.createElement("li");
      li.textContent = skill;
      missingSkillsList.appendChild(li);
    });

  } catch (err) {
    alert("Error analyzing resume.Please wait and try again.");
    console.error(err);
  }
});
