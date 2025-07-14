// feature2.js — Cleaned and Working JavaScript for Resume Analyzer

// Helper to show messages nicely
function showMessage(elem, text, color = "black", display = "block") {
  elem.innerHTML = text;
  elem.style.color = color;
  elem.style.display = display;
}

function toggleInstructions() {
  const box = document.getElementById("instructionsBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

// Check user ID before upload (on "Next")
async function checkUserIdBeforeUpload() {
  const name_id = document.getElementById("name_id").value.trim().toLowerCase();
  const pinContainer = document.getElementById("pin-container");
  const pinLabel = document.getElementById("pin-label");
  const msgBox = document.getElementById("user-check-msg");
  const newMsg = document.getElementById("new-user-msg");
  const pinInput = document.getElementById("pin");

  if (!name_id) {
    showMessage(msgBox, "❌ Please enter a Resume ID.", "red");
    pinContainer.style.display = "none";
    newMsg.style.display = "none";
    return;
  }

  showMessage(msgBox, "🔄 Checking ID...", "blue");
  newMsg.style.display = "none";
  pinContainer.style.display = "none";
  pinInput.value = "";
  ["checkPinBtn", "setPinBtn"].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.remove();
  });

  try {
    const res = await fetch(`/check_user_id?user_id=${encodeURIComponent(name_id)}`);
    const data = await res.json();

    pinContainer.style.display = "block";

    if (data.exists) {
      pinLabel.textContent = "Enter your 4-digit PIN:";
      showMessage(msgBox, "🔐 Existing ID. Please verify PIN.", "red");

      const checkBtn = document.createElement("button");
      checkBtn.id = "checkPinBtn";
      checkBtn.textContent = "Verify PIN & Continue";
      checkBtn.type = "button";
      checkBtn.onclick = submitExistingUser;
      pinContainer.appendChild(checkBtn);
    } else {
      pinLabel.textContent = "Set your 4-digit PIN:";
      showMessage(newMsg, "✅ New ID. Set a PIN to continue.", "green");

      const setBtn = document.createElement("button");
      setBtn.id = "setPinBtn";
      setBtn.textContent = "Set PIN & Continue";
      setBtn.type = "button";
      setBtn.onclick = submitNewUser;
      pinContainer.appendChild(setBtn);
    }
  } catch (err) {
    showMessage(msgBox, "❌ Error checking ID.", "red");
    console.error(err);
  }
}

async function submitExistingUser() {
  const name_id = document.getElementById("name_id").value.trim().toLowerCase();
  const pin = document.getElementById("pin").value.trim();
  const msgBox = document.getElementById("user-check-msg");
  const form = document.getElementById("uploadForm");

  if (pin.length !== 4 || isNaN(pin)) {
    showMessage(msgBox, "❌ Please enter a valid 4-digit PIN.", "red");
    return;
  }

  try {
    const res = await fetch(`/verify_pin?name_id=${encodeURIComponent(name_id)}&pin=${encodeURIComponent(pin)}`);
    const data = await res.json();

    if (data.valid) {
      showMessage(msgBox, "✅ PIN verified. You may now upload resumes.", "green");
      form.style.display = "block";
      document.getElementById("hidden_user_id").value = name_id;
      document.getElementById("hidden_user_pin").value = pin;
    } else {
      showMessage(msgBox, "❌ Incorrect PIN.", "red");
      form.style.display = "none";
    }
  } catch (err) {
    showMessage(msgBox, "❌ Error verifying PIN.", "red");
    console.error(err);
  }
}

async function submitNewUser() {
  const name_id = document.getElementById("name_id").value.trim().toLowerCase();
  const pin = document.getElementById("pin").value.trim();
  const msgBox = document.getElementById("user-check-msg");
  const form = document.getElementById("uploadForm");

  if (pin.length !== 4 || isNaN(pin)) {
    showMessage(msgBox, "❌ Please enter a valid 4-digit PIN.", "red");
    return;
  }

  try {
    const res = await fetch("/store_user_pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name_id, pin }),
    });
    const data = await res.json();

    if (data.success) {
      showMessage(msgBox, "✅ PIN set. You may now upload resumes.", "green");
      form.style.display = "block";
      document.getElementById("hidden_user_id").value = name_id;
      document.getElementById("hidden_user_pin").value = pin;
    } else {
      showMessage(msgBox, "❌ Failed to set PIN.", "red");
    }
  } catch (err) {
    showMessage(msgBox, "❌ Error storing PIN.", "red");
    console.error(err);
  }
}

// Upload resume
const uploadForm = document.getElementById("uploadForm");
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(uploadForm);
  const msg = document.getElementById("uploadMsg");
  showMessage(msg, "Uploading...", "blue");

  try {
    const res = await fetch("/store_resume", { method: "POST", body: formData });
    const data = await res.json();

    if (data.message) {
      showMessage(msg, "✅ " + data.message, "green");
      uploadForm.reset();
    } else {
      showMessage(msg, "❌ " + (data.error || "Upload failed."), "red");
    }
  } catch (err) {
    showMessage(msg, "❌ Error uploading.", "red");
    console.error(err);
  }
});

// Analyze resumes
const analyzeForm = document.getElementById("analyzeForm");
analyzeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name_id = document.getElementById("analyze_user_id").value.trim().toLowerCase();
  const pin = document.getElementById("analyze_pin").value.trim();
  const jd = document.getElementById("required_skills").value.trim();
  const resultsBox = document.getElementById("results");

  if (!name_id || !pin || pin.length !== 4 || !jd) {
    showMessage(resultsBox, "❌ Please provide Resume ID, 4-digit PIN, and job description.", "red");
    return;
  }

  showMessage(resultsBox, "Analyzing resumes, please wait...", "blue");

  try {
    const verify = await fetch(`/verify_pin?name_id=${encodeURIComponent(name_id)}&pin=${encodeURIComponent(pin)}`);
    const verifyData = await verify.json();

    if (!verifyData.valid) {
      showMessage(resultsBox, "❌ Incorrect PIN. Please try again.", "red");
      return;
    }

    const res = await fetch("/match_resumes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name_id, pin, job_description: jd }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Server responded with error page:", errorText);
      showMessage(resultsBox, `❌ Server error (${res.status}). Check console for details.`, "red");
      return;
    }

    const data = await res.json();

    if (!res.ok || !data.results) {
      showMessage(resultsBox, "❌ " + (data.error || "No results found."), "red");
      return;
    }

    resultsBox.innerHTML = `<h3>Top Resume Matches:</h3>`;

    for (const resume of data.results) {
      const downloadRes = await fetch(`/download_resume/${encodeURIComponent(name_id)}/${encodeURIComponent(resume.file_name)}`);
      const downloadData = await downloadRes.json();
      const downloadURL = downloadRes.ok ? downloadData.download_url : "#";

      const card = document.createElement("div");
      card.className = "resume-card";


      card.innerHTML = `
        <h3><strong>${resume.name_id}</strong></h3>
        <p><b>Phone:</b> ${resume.phone}</p>
        <p><b>Email:</b> ${resume.email}</p>
        <p><b>Match %:</b> ${resume.match_percent}%</p>
        <a href="${downloadURL}" target="_blank" download>
          <button style="margin-top: 10px;">⬇️ Download Resume</button>
        </a>
      `;

      resultsBox.appendChild(card);
    }
  } catch (err) {
    showMessage(resultsBox, "❌ Error analyzing resumes.", "red");
    console.error(err);
  }
});

// Clear resumes
const clearBtn = document.getElementById("clearBtn");
clearBtn.addEventListener("click", async () => {
  const name_id = prompt("Enter Resume ID to clear:").trim().toLowerCase();
  const pin = prompt("Enter your 4-digit PIN:");

  if (!name_id || !pin || pin.length !== 4 || isNaN(pin)) {
    alert("❌ Please enter a valid Resume ID and 4-digit PIN.");
    return;
  }

  try {
    const res = await fetch(`/clear_resumes?name_id=${encodeURIComponent(name_id)}&pin=${encodeURIComponent(pin)}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (data.message) alert("✅ " + data.message);
    else alert("❌ " + (data.error || "Failed to clear resumes."));
  } catch (err) {
    alert("❌ Error clearing resumes.");
    console.error(err);
  }
});

// Init listeners
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("checkIdBtn").addEventListener("click", checkUserIdBeforeUpload);
});
