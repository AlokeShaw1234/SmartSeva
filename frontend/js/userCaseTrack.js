const API_URL = "https://smartseva-5dia.onrender.com/api";

document.getElementById("trackForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const caseId = document.getElementById("trackCaseId").value.trim();
  const statusDiv = document.getElementById("caseStatus");

  if (!caseId) {
    statusDiv.innerHTML = "❌ Please enter a Case ID";
    statusDiv.style.display = "block";
    return;
  }

  statusDiv.innerText = "Tracking complaint...";
  statusDiv.style.display = "block";

  try {
    const res = await fetch(`${API_URL}/submitComplaint/case/${encodeURIComponent(caseId)}`);
    
    if (res.ok) {
      const caseData = await res.json();
      
      let statusHtml = `
        <div style="text-align: left; line-height: 1.8;">
          <h3 style="margin-top: 0; color: #007bff;">Case: ${caseData.case_id}</h3>
          <p><strong>Category:</strong> ${caseData.category}</p>
          <p><strong>Subject:</strong> ${caseData.subject}</p>
          <p><strong>Description:</strong> ${caseData.description || 'N/A'}</p>
          <p><strong>Status:</strong> <span style="font-weight: bold; color: ${caseData.status === 'Resolved' ? '#28a745' : (caseData.status === 'In Progress' ? '#ffc107' : '#007bff')}">${caseData.status}</span></p>
          <p><strong>Date Filed:</strong> ${caseData.created_at ? new Date(caseData.created_at).toLocaleDateString() : 'N/A'}</p>
      `;

      if (caseData.deadline) {
        statusHtml += `<p><strong>Target Deadline:</strong> ${new Date(caseData.deadline).toLocaleDateString()}</p>`;
      }

      if (caseData.contractor_name) {
        statusHtml += `<p><strong>Assigned Contractor:</strong> ${caseData.contractor_name}</p>`;
      }

      if (caseData.contractor_status === 'Accepted') {
        statusHtml += `<p><strong>Work Status:</strong> <span style="color: #28a745; font-weight: bold;">Contractor Accepted & Working on it</span></p>`;
      } else if (caseData.contractor_status === 'Completed') {
        statusHtml += `<p><strong>Work Status:</strong> <span style="color: #17a2b8; font-weight: bold;">Work Completed by Contractor</span></p>`;
      } else if (caseData.contractor_status === 'Pending' && caseData.status === 'Assigned') {
        statusHtml += `<p><strong>Work Status:</strong> <span style="color: #e67e22; font-weight: bold;">Assigned to Contractor (Pending Acceptance)</span></p>`;
      }

      if (caseData.contractor_proof_url) {
        statusHtml += `<p><strong>Proof of Completed Work:</strong> <a href="http://localhost:3000${caseData.contractor_proof_url}" target="_blank" style="color: #28a745; font-weight: bold; text-decoration: underline;">View Completion Proof</a></p>`;
      }

      statusHtml += `</div>`;
      statusDiv.innerHTML = statusHtml;
    } else {
      const errData = await res.json().catch(() => ({}));
      statusDiv.innerHTML = `❌ ${errData.message || 'Case not found! Please check your Case ID.'}`;
    }
  } catch (err) {
    console.error("Track complaint error:", err);
    statusDiv.innerHTML = "❌ Unable to connect to server. Please check your backend.";
  }
});
