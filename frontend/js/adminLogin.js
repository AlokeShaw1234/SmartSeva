let generatedOTP = "";
let captchaText = "";

//         for OTP generation

document.getElementById("otpBtn").onclick = function () {
  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  alert("OTP: " + generatedOTP);
};

//         for CAPTCHA generation

function generateCaptcha() {
  const canvas = document.getElementById("captchaCanvas");
  const ctx = canvas.getContext("2d");

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  captchaText = "";

  for (let i = 0; i < 5; i++) {
    captchaText += chars[Math.floor(Math.random() * chars.length)];
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f2f2f2";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "20px Arial";
  ctx.fillStyle = "#333";

  for (let i = 0; i < captchaText.length; i++) {
    const x = 10 + i * 20;
    const y = 25 + Math.random() * 5;
    const angle = (Math.random() - 0.5) * 0.5;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(captchaText[i], 0, 0);
    ctx.restore();
  }

  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = "#999";
    ctx.beginPath();
    ctx.moveTo(Math.random() * 120, Math.random() * 40);
    ctx.lineTo(Math.random() * 120, Math.random() * 40);
    ctx.stroke();
  }
}

//             for checking VALIDATION of the form
document.getElementById("loginForm").onsubmit = function (e) {
  e.preventDefault();

  let firstName = document.getElementById("firstName").value.trim();
  let lastName = document.getElementById("lastName").value.trim();
  let mobile = document.getElementById("mobile").value.trim();
  let userOTP = document.getElementById("otpInput").value.trim();
  let userCaptcha = document.getElementById("captchaInput").value.trim();

  // =========================================================================
  // HARDCODED ADMIN CREDENTIALS CHECK
  // Only allow access if First Name = "Aloke", Last Name = "Shaw", and Mobile = "6290875910"
  // =========================================================================
  const ALLOWED_ADMIN_FIRST_NAME = "Aloke";
  const ALLOWED_ADMIN_LAST_NAME = "Shaw";
  const ALLOWED_ADMIN_MOBILE = "6290875910";

  if (
    firstName.toLowerCase() !== ALLOWED_ADMIN_FIRST_NAME.toLowerCase() ||
    lastName.toLowerCase() !== ALLOWED_ADMIN_LAST_NAME.toLowerCase() ||
    mobile !== ALLOWED_ADMIN_MOBILE
  ) {
    alert("Unauthorized Admin! Only authorized admin can log in.");
    return;
  }

  if (userOTP !== generatedOTP) {
    alert("Invalid OTP");
    return;
  }

  if (userCaptcha !== captchaText) {
    alert("Invalid Captcha");
    generateCaptcha();
    return;
  }

  document.getElementById("successMsg").innerText = "✅ Login Successful!";
  window.location.href = "adminDashboard.html";
};

generateCaptcha();
