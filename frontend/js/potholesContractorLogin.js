let generatedOTP = "";
let isVerified = false;

function sendOTP() {
  const mobile = document.getElementById("mobile").value.trim();

  if (mobile.length !== 10) {
    alert("Enter valid mobile number");
    return;
  }

  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  alert("Your OTP: " + generatedOTP);
  document.getElementById("otpBox").style.display = "block";
}

function verifyOTP() {
  const entered = document.getElementById("otpInput").value.trim();

  if (entered === generatedOTP) {
    alert("OTP Verified ✅");
    isVerified = true;
    document.getElementById("loginBtn").disabled = false;
  } else {
    alert("Invalid OTP ❌");
  }
}

async function goToPotholesContractorDashboard(event) {
  event.preventDefault();

  const id = document.getElementById("id") ? document.getElementById("id").value.trim() : "";
  const pass = document.getElementById("password").value;

  if (pass.length < 5) {
    alert("Password must be at least 5 characters long!");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/contractor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idOrEmail: id,
        password: pass,
        category: "POTHOLES"
      })
    });
    const data = await res.json();
    if (res.ok && data.success && data.contractor) {
      sessionStorage.setItem("contractorId", data.contractor.id);
      sessionStorage.setItem("contractorName", data.contractor.name);
      sessionStorage.setItem("contractorCategory", data.contractor.category);
    }
  } catch (err) {
    console.warn("Backend login note:", err);
    sessionStorage.setItem("contractorCategory", "POTHOLES");
  }

  window.location.href = "potholesContractorDashBoard.html";
}
