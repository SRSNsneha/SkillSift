// 🔍 Check if user ID already exists
async function checkUserIdBeforeUpload() {
  const userIdInput = document.getElementById("name_id");
  const userId = userIdInput.value.trim().toLowerCase();
  const msgBox = document.getElementById("user-check-msg");
  const newMsg = document.getElementById("new-user-msg");

  msgBox.style.display = "none";
  newMsg.style.display = "none";

  const res = await fetch(`https://skillsift.onrender.com/check_user_id?user_id=${userId}`);
  const data = await res.json();

  if (data.exists) {
    msgBox.innerHTML = `
      🚨 <strong>This ID already exists.</strong><br><br>
      ⚠️ If you're unsure whether this ID is yours, it's safer to use a new one.<br>
      👉 Alternatively, you can clear all existing resumes under this ID using the <strong>"🧹 Clear All Resumes"</strong> button and then reuse it for a fresh comparison.<br>
      ✅ Otherwise, if you're confident this is your ID, you can simply continue below.<br><br>
      <button onclick="proceedToUploadUI()">✅ Continue Anyway</button>
      <button onclick="resetUserId()">❌ Cancel</button>
    `;
    msgBox.style.display = "block";
  } else {
    newMsg.textContent = "✅ New ID registered successfully. You can now upload your resumes!";
    newMsg.style.display = "block";
    proceedToUploadUI();
  }

  document.getElementById("hidden_user_id").value = userId;
}

function resetUserId() {
  document.getElementById("name_id").value = "";
  document.getElementById("user-check-msg").style.display = "none";
  document.getElementById("new-user-msg").style.display = "none";
}

function proceedToUploadUI() {
  const userId = document.getElementById("name_id").value.trim().toLowerCase();
  document.getElementById("uploadForm").style.display = "block";
  document.getElementById("hidden_user_id").value = userId;
  document.getElementById("user-check-msg").style.display = "none";
  document.getElementById("new-user-msg").style.display = "none";
}

// 📤 Upload Resume
document.getElementById("uploadForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const msg = document.getElementById("uploadMsg");
  msg.textContent = "Uploading...";

  try {
    const res = await fetch("https://skillsift.onrender.com/store_resume", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    msg.textContent = res.ok ? `✅ ${data.message}` : `❌ ${data.error}`;
  } catch (err) {
    msg.textContent = "❌ Error....Please Wait.";
  }

  form.reset();
});

// 🔍 Analyze Resumes
document.getElementById("analyzeForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const jobDesc = document.getElementById("required_skills").value.trim();
  const userId = document.getElementById("analyze_user_id").value.trim();
  const resultDiv = document.getElementById("results");
  resultDiv.innerHTML = "<p>Analyzing...</p>";

  try {
    const res = await fetch("https://skillsift.onrender.com/match_resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_description: jobDesc, name_id: userId }),
    });

    const data = await res.json();

    if (res.ok) {
      resultDiv.innerHTML = "<h3>Top 3 Matching Resumes</h3>";
      for (const r of data.results) {
        const fileName = r.file_name;
        const downloadRes = await fetch(`https://skillsift.onrender.com/download_resume/${userId}/${fileName}`);
        const downloadData = await downloadRes.json();
        const downloadURL = downloadRes.ok ? downloadData.download_url : "#";

        const div = document.createElement("div");
        div.classList.add("resume-card");
        div.innerHTML = `
          <div class="card">
            <h3><strong>Resume ID:</strong> ${r.name_id}</h3>
            <p><strong>Email:</strong> ${r.email}</p>
            <p><strong>Phone:</strong> ${r.phone}</p>
            <p><strong>Match %:</strong> ${r.match_percent}%</p>
            <a href="${downloadURL}" target="_blank" download>
              <button>Download Resume</button>
            </a>
          </div>
        `;
        resultDiv.appendChild(div);
      }
    } else {
      resultDiv.innerHTML = `<p style="color:red">❌ ${data.error}</p>`;
    }
  } catch (err) {
    resultDiv.innerHTML = "<p style='color:red'>❌ Error connecting...Please Wait.</p>";
  }
});

// 🧹 Clear All Resumes
document.getElementById("clearBtn").addEventListener("click", async function () {
  const userId = prompt("Enter your Resume ID to clear your own uploaded resumes:");
  const msg = document.getElementById("uploadMsg");
  msg.textContent = "Clearing resumes...";

  try {
    const res = await fetch(`https://skillsift.onrender.com/clear_resumes?name_id=${userId}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (res.ok) {
      msg.textContent = `✅ ${data.message}`;
      document.getElementById("results").innerHTML = "";
    } else {
      msg.textContent = `❌ ${data.error || "Failed to clear resumes."}`;
    }
  } catch (err) {
    msg.textContent = "❌ Error....Please Wait.";
  }
});
