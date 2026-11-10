const CATEGORY = "TREE FALL";
const API_URL = "http://localhost:3000";

const complaintsTable = document.getElementById("complaintsTable");
const assignedTable = document.getElementById("assignedTable");
const completedTable = document.getElementById("completedTable");
const modal = document.getElementById("modal");

let selectedCaseId = null;
let contractorId = sessionStorage.getItem("contractorId");

document.addEventListener("DOMContentLoaded", async () => {
  // If contractorId is not set in sessionStorage, find contractor dynamically for this category
  if (!contractorId) {
    try {
      const res = await fetch(`${API_URL}/api/contractors?category=${encodeURIComponent(CATEGORY)}`);
      const contractors = await res.json();
      if (Array.isArray(contractors) && contractors.length > 0) {
        contractorId = contractors[0].id;
        sessionStorage.setItem("contractorId", contractorId);
        sessionStorage.setItem("contractorName", contractors[0].name);
        sessionStorage.setItem("contractorCategory", contractors[0].category);
      }
    } catch (err) {
      console.warn("Could not auto-fetch contractor:", err);
    }
  }

  fetchComplaints();
  initCardSwitch();
});

async function fetchComplaints() {
  try {
    const fetchUrl = `${API_URL}/api/complaints/contractor/${contractorId || ''}?category=${encodeURIComponent(CATEGORY)}`;
    const res = await fetch(fetchUrl);
    const rawData = await res.json();
    const data = Array.isArray(rawData) ? rawData : (rawData.complaints || []);

    if (complaintsTable) complaintsTable.innerHTML = "";
    if (assignedTable) assignedTable.innerHTML = "";
    if (completedTable) completedTable.innerHTML = "";

    let pendingCount = 0;
    let assignedCount = 0;
    let completedCount = 0;

    data.forEach(c => {
      // Location link or text
      let locHtml = c.location || "N/A";
      if (c.location && c.location.includes(',')) {
        locHtml = `<a href="https://maps.google.com?q=${encodeURIComponent(c.location)}" target="_blank" style="color:#007bff;font-weight:500;">View Map</a>`;
      }

      // Media
      let mediaUrl = c.media_url || c.image_path;
      let mediaHtml = mediaUrl 
        ? `<a href="${API_URL}${mediaUrl}" target="_blank">View Media</a>` 
        : '<span style="color:#888;">No Media</span>';

      // Deadline formatted
      let deadlineStr = c.deadline ? new Date(c.deadline).toLocaleDateString() : 'Not Set';

      // Section 1: Pending (assigned by admin, waiting for contractor to take)
      if (c.contractor_status === 'Pending') {
        pendingCount++;
        if (complaintsTable) {
          complaintsTable.innerHTML += `
            <tr>
              <td><strong>${c.case_id}</strong></td>
              <td>${c.subject || ''}</td>
              <td>${c.description || ''}</td>
              <td>${locHtml}</td>
              <td>${mediaHtml}</td>
              <td><span style="color:#d9534f;font-weight:600;">${deadlineStr}</span></td>
              <td>
                <button class="btn-contract" onclick="openModal('${c.case_id}')">Take Contract</button>
                <button onclick="updateStatus('${c.case_id}', 'Rejected')" style="background:#dc3545; color:white; border:none; padding:7px 12px; cursor:pointer; border-radius:4px; margin-left:5px;">Reject</button>
              </td>
            </tr>
          `;
        }
      } 
      // Section 2: Accepted (contractor accepted, waiting for proof of work)
      else if (c.contractor_status === 'Accepted' && !c.contractor_proof_url) {
        assignedCount++;
        if (assignedTable) {
          assignedTable.innerHTML += `
            <tr>
              <td><strong>${c.case_id}</strong></td>
              <td>${c.subject || ''}</td>
              <td>${c.description || ''}</td>
              <td>${locHtml}</td>
              <td>${mediaHtml}</td>
              <td><span style="color:#d9534f;font-weight:600;">${deadlineStr}</span></td>
              <td>
                <input type="file" id="proof_${c.case_id}" accept="image/*,video/*" style="display:none" onchange="uploadProof('${c.case_id}', this)">
                <button class="btn-upload" onclick="document.getElementById('proof_${c.case_id}').click()">Upload Proof</button>
              </td>
            </tr>
          `;
        }
      } 
      // Section 3: Completed (proof uploaded or status is Resolved)
      else if (c.contractor_proof_url || c.contractor_status === 'Completed' || c.status === 'Resolved') {
        completedCount++;
        let proofLink = c.contractor_proof_url 
          ? `<a href="${API_URL}${c.contractor_proof_url}" target="_blank" style="color:#28a745;font-weight:bold;">View Proof</a>` 
          : '<span style="color:#888;">No Proof</span>';

        if (completedTable) {
          completedTable.innerHTML += `
            <tr>
              <td><strong>${c.case_id}</strong></td>
              <td>${c.subject || ''}</td>
              <td>${c.description || ''}</td>
              <td>${locHtml}</td>
              <td>${mediaHtml}</td>
              <td>${deadlineStr}</td>
              <td>${proofLink}</td>
            </tr>
          `;
        }
      }
    });

    const cCountEl = document.getElementById("complaintsCount");
    const aCountEl = document.getElementById("assignedCount");
    const compCountEl = document.getElementById("completedCount");

    if (cCountEl) cCountEl.innerText = pendingCount;
    if (aCountEl) aCountEl.innerText = assignedCount;
    if (compCountEl) compCountEl.innerText = completedCount;

  } catch (err) {
    console.error("Error fetching tree fall complaints:", err);
  }
}

function openModal(caseId) {
  selectedCaseId = caseId;
  if (modal) modal.style.display = "flex";
}

const yesBtn = document.getElementById("yesBtn");
if (yesBtn) {
  yesBtn.onclick = () => {
    if (selectedCaseId) {
      updateStatus(selectedCaseId, 'Accepted');
      if (modal) modal.style.display = "none";
      selectedCaseId = null;
    }
  };
}

const noBtn = document.getElementById("noBtn");
if (noBtn) {
  noBtn.onclick = () => {
    if (modal) modal.style.display = "none";
    selectedCaseId = null;
  };
}

async function updateStatus(caseId, status) {
  try {
    const res = await fetch(`${API_URL}/api/complaints/contractor-status/${caseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractor_status: status })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert(data.message || `Status updated to ${status}`);
      await fetchComplaints();
    } else {
      alert(data.message || "Failed to update status");
    }
  } catch (err) {
    console.error("Update contractor status error:", err);
    alert("Server connection error");
  }
}

async function uploadProof(caseId, fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("proof_media", file);

  try {
    const res = await fetch(`${API_URL}/api/complaints/proof/${caseId}`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert("Proof uploaded successfully!");
      await fetchComplaints();
    } else {
      alert(data.message || "Error uploading proof");
    }
  } catch (err) {
    console.error("Proof upload error:", err);
    alert("Failed to upload proof");
  }
}

function initCardSwitch() {
  document.querySelectorAll(".card").forEach((card) => {
    card.onclick = () => {
      document.querySelectorAll("section").forEach((s) => s.classList.remove("active"));
      const sectionId = card.dataset.section || card.getAttribute("data-section");
      if (sectionId && document.getElementById(sectionId)) {
        document.getElementById(sectionId).classList.add("active");
      }
    };
  });
}
