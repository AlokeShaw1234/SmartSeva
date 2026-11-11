let allComplaints = [];
let allContractors = [];
let currentCategory = 'All';
let map;
let mapMarkers = [];

document.addEventListener("DOMContentLoaded", () => {

  // Initialize map centered roughly on Kolkata / regional coordinates

  map = L.map('map').setView([22.5726, 88.3639], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  fetchComplaints();
  fetchContractors();
});

async function fetchComplaints() {
  try {
    const res = await fetch("https://smartseva-5dia.onrender.com/api/complaints");
    const data = await res.json();
    allComplaints = Array.isArray(data) ? data : [];
    renderTable();
  } catch (err) {
    console.error("Error fetching complaints:", err);
  }
}

async function fetchContractors() {
  try {
    const res = await fetch("https://smartseva-5dia.onrender.com/api/contractors");
    const data = await res.json();
    allContractors = Array.isArray(data) ? data : [];
  } catch(err) {
    console.error("Error fetching contractors:", err);
  }
}

function renderTable() {
  const tbody = document.getElementById("complaintsTableBody");
  tbody.innerHTML = "";

  // Clear existing map markers
  mapMarkers.forEach(marker => map.removeLayer(marker));
  mapMarkers = [];

  const filtered = currentCategory === 'All' 
    ? allComplaints 
    : allComplaints.filter(c => {
        const cCat = (c.category || '').toUpperCase().trim();
        const target = currentCategory.toUpperCase().trim();
        return cCat === target || cCat.includes(target) || target.includes(cCat);
      });

  filtered.forEach(c => {
    const row = document.createElement("tr");

    // Location link or text
    let locHtml = c.location || "N/A";
    if (c.location && c.location.includes(',')) {
        locHtml = `<a href="https://maps.google.com?q=${encodeURIComponent(c.location)}" target="_blank" style="color:#007bff;font-weight:500;">View Map</a>`;
    }

    // Media preview
    let mediaUrl = c.media_url || c.image_path;
    let mediaHtml = mediaUrl
      ? `<a href="https://smartseva-5dia.onrender.com${mediaUrl}" target="_blank">
           <img src="https://smartseva-5dia.onrender.com${mediaUrl}" alt="Media" style="width:70px; height:50px; object-fit:cover; border-radius:4px; border:1px solid #ddd;">
         </a>`
      : '<span style="color:#888;">No Media</span>';
    
    // Contractor Proof
    let proofHtml = c.contractor_proof_url
      ? `<a href="https://smartseva-5dia.onrender.com${c.contractor_proof_url}" target="_blank" style="color:#28a745; font-weight:bold;">View Proof</a>`
      : '<span style="color:#888;">No Proof</span>';
    
    // Assign Button
    let assignBtn = c.contractor_id 
      ? `<button disabled style="background:#6c757d; color:#fff; border:none; padding:6px 10px; border-radius:4px; font-size:12px; cursor:default;">Assigned (${c.contractor_name || 'Contractor'})</button>` 
      : `<button class="status-assign" onclick="openAssignModal('${c.case_id}')">Assign</button>`;

    // Format Dates
    let createdDate = c.created_at ? new Date(c.created_at).toLocaleDateString() : '';
    let deadlineStr = c.deadline ? new Date(c.deadline).toLocaleDateString() : '<span style="color:#999;">Not Set</span>';

    row.innerHTML = `
      <td><strong>${c.case_id}</strong></td>
      <td><span style="background:#eef2f7; padding:3px 8px; border-radius:12px; font-size:12px; font-weight:600;">${c.category}</span></td>
      <td>${c.subject || ''}</td>
      <td>${c.description || ''}</td>
      <td>${locHtml}</td>
      <td>${c.mobile_no || ''}</td>
      <td>${mediaHtml}</td>
      <td>${createdDate}</td>
      <td>${deadlineStr}</td>
      <td>${assignBtn}</td>
      <td><span style="font-weight:600; color:${c.contractor_status === 'Accepted' ? '#28a745' : (c.contractor_status === 'Completed' ? '#17a2b8' : '#e67e22')}">${c.contractor_status || 'Pending'}</span></td>
      <td>
        <select onchange="updateMainStatus('${c.case_id}', this.value)" style="padding:4px 8px; border-radius:4px; border:1px solid #ccc; font-size:13px;">
          <option value="Submitted" ${c.status==='Submitted'?'selected':''}>Submitted</option>
          <option value="Assigned" ${c.status==='Assigned'?'selected':''}>Assigned</option>
          <option value="In Progress" ${c.status==='In Progress'?'selected':''}>In Progress</option>
          <option value="Resolved" ${c.status==='Resolved'?'selected':''}>Resolved</option>
        </select>
      </td>
      <td>${proofHtml}</td>
    `;
    tbody.appendChild(row);

    // PLOT MAP MARKER (Red: Pending/Submitted, Yellow: In Progress/Assigned, Green: Resolved)
    if (c.location && c.location.includes(',')) {
      const parts = c.location.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          let markerColor = '#dc3545'; // Red (Submitted / Pending)
          if (c.status === 'Resolved') markerColor = '#28a745'; // Green
          else if (c.status === 'In Progress' || c.status === 'Assigned') markerColor = '#ffc107'; // Yellow

          const customIcon = L.divIcon({
            className: 'custom-pin',
            html: `<div style="background-color: ${markerColor}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          const marker = L.marker([lat, lng], {icon: customIcon}).addTo(map);
          marker.bindPopup(`<b>${c.case_id}</b><br>${c.category}<br><b>Status:</b> ${c.status}`);
          mapMarkers.push(marker);
        }
      }
    }
  });
}

function filterCategory(cat) {
  currentCategory = cat;
  renderTable();
}

function openAssignModal(caseId) {
  const complaint = allComplaints.find(c => c.case_id === caseId);
  document.getElementById("assignCaseId").value = caseId;

  const infoEl = document.getElementById("assignCaseInfo");
  if (infoEl && complaint) {
    infoEl.innerText = `Case: ${complaint.case_id} | Category: ${complaint.category}`;
  }

  const select = document.getElementById("contractorSelect");
  if (select) {
    select.innerHTML = '<option value="">-- Select Contractor --</option>';

    if (allContractors.length > 0) {
      allContractors.forEach(contractor => {
        const match = complaint && (
          contractor.category.trim().toUpperCase() === complaint.category.trim().toUpperCase() ||
          contractor.category.toUpperCase().includes(complaint.category.toUpperCase()) ||
          complaint.category.toUpperCase().includes(contractor.category.toUpperCase())
        );
        select.innerHTML += `<option value="${contractor.id}" ${match ? 'selected' : ''}>${contractor.name} (${contractor.category})</option>`;
      });
    } else {
      select.innerHTML += '<option value="">No contractors available</option>';
    }
  }

  // Set default deadline to 3 days from now, min to today
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const defaultDeadline = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const deadlineInput = document.getElementById("assignDeadline");
  if (deadlineInput) {
    deadlineInput.min = minDate;
    if (!deadlineInput.value) deadlineInput.value = defaultDeadline;
  }

  document.getElementById("assignModal").style.display = "block";
}

async function submitAssign() {
  const caseId = document.getElementById("assignCaseId").value;
  const contractorId = document.getElementById("contractorSelect").value;
  const deadline = document.getElementById("assignDeadline").value;

  if (!contractorId) {
    alert("Please select a contractor.");
    return;
  }

  if (!deadline) {
    alert("Please set a deadline date.");
    return;
  }

  try {
    const res = await fetch(`https://smartseva-5dia.onrender.com/api/complaints/assign/${caseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractor_id: contractorId,
        deadline: deadline
      })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast("Assigned successfully to " + (data.contractor || "contractor"));
      document.getElementById("assignModal").style.display = "none";
      await fetchComplaints();
    } else {
      showToast(data.message || "Error assigning contractor");
    }
  } catch (err) {
    console.error("Error assigning:", err);
    showToast("Failed to connect to server");
  }
}

async function updateMainStatus(caseId, status) {
  try {
    const res = await fetch(`https://smartseva-5dia.onrender.com/api/complaints/${caseId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast("Status updated to " + status);
      await fetchComplaints();
    } else {
      showToast(data.message || "Error updating status");
    }
  } catch (err) {
    console.error("Error updating status:", err);
    showToast("Error updating status");
  }
}

function search() {
  let input = document.getElementById("searchInput").value.toUpperCase();
  let rows = document.querySelectorAll("#complaintsTableBody tr");

  rows.forEach((row) => {
    let text = row.cells[0].innerText;
    if (text.toUpperCase().includes(input)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function showToast(msg) {
  let toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerText = msg;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

function openTab(tab) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
  
  const target = document.getElementById(tab);
  if (target) target.classList.add("active");
  
  if (event && event.target) {
    event.target.classList.add("active");
  }
}
