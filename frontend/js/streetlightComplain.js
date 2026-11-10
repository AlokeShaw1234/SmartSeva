let generatedOtp = null;
let isOtpVerified = false;

// Get OTP
function getOtp() {
  let mobile = document.getElementById("mobile").value.trim();
  let msg = document.getElementById("msg");

  if (!/^[0-9]{10}$/.test(mobile)) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  generatedOtp = Math.floor(100000 + Math.random() * 900000);
  isOtpVerified = false;

  document.getElementById("otp").value = "";
  document.getElementById("otpGroup").style.display = "block";
  document.querySelector(".submit-btn").disabled = true;

  msg.innerHTML = "";
  alert("Demo OTP: " + generatedOtp);
}

// Verify OTP
function verifyOtp() {
  let enteredOtp = document.getElementById("otp").value.trim();
  let msg = document.getElementById("msg");

  if (generatedOtp === null) {
    msg.innerHTML = "Please generate an OTP first.";
    return;
  }

  if (enteredOtp === String(generatedOtp)) {
    isOtpVerified = true;
    msg.innerHTML = "OTP Verified ✅";
    document.querySelector(".submit-btn").disabled = false;
  } else {
    isOtpVerified = false;
    msg.innerHTML = "Wrong OTP ❌";
    document.querySelector(".submit-btn").disabled = true;
  }
}

// Reset OTP verification if mobile number changes
document.getElementById("mobile").addEventListener("input", function () {
  generatedOtp = null;
  isOtpVerified = false;

  document.getElementById("otp").value = "";
  document.getElementById("otpGroup").style.display = "none";
  document.querySelector(".submit-btn").disabled = true;
  document.getElementById("msg").innerHTML = "";
});

// Voice input
function startVoiceInput(id) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice input is not supported by this browser.");
    return;
  }

  let recognition = new SpeechRecognition();

  recognition.lang = document.getElementById("voiceLang").value;
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = function (event) {
    document.getElementById(id).value =
      event.results[0][0].transcript;
  };

  recognition.onerror = function () {
    alert("Voice recognition failed. Please try again.");
  };

  recognition.start();
}

// Get current location
function getLocation() {
  let locationInput = document.getElementById("location");

  if (!navigator.geolocation) {
    locationInput.value = "";
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (position) {
      locationInput.value =
        position.coords.latitude + "," + position.coords.longitude;
    },
    function () {
      locationInput.value = "";
      alert("Unable to get location. Please allow location access.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

getLocation();

// Preview uploaded image or video
document.getElementById("media").addEventListener("change", function (event) {
  let file = event.target.files[0];
  let preview = document.getElementById("preview");

  preview.innerHTML = "";

  if (!file) {
    return;
  }

  let fileUrl = URL.createObjectURL(file);

  if (file.type.startsWith("image/")) {
    let image = document.createElement("img");
    image.src = fileUrl;
    image.alt = "Complaint image preview";
    image.style.maxWidth = "100%";
    preview.appendChild(image);
  } else if (file.type.startsWith("video/")) {
    let video = document.createElement("video");
    video.src = fileUrl;
    video.controls = true;
    video.style.maxWidth = "100%";
    preview.appendChild(video);
  } else {
    URL.revokeObjectURL(fileUrl);
    alert("Please select an image or video file.");
    event.target.value = "";
  }
});

// Submit complaint
document.getElementById("pftForm").addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    let submitBtn = document.querySelector(".submit-btn");
    let mobile = document.getElementById("mobile").value.trim();
    let subject = document.getElementById("subject").value.trim();
    let description = document.getElementById("description").value.trim();
    let location = document.getElementById("location").value.trim();

    if (!subject || !description || !mobile || !location) {
      alert("Please fill in all required fields and ensure location is available.");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!isOtpVerified) {
      alert("Please verify your OTP before submitting.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting...";

    try {
      let formData = new FormData(this);

      // Use the route defined in your Express backend.
      const response = await fetch(
        "http://localhost:3000/submitComplaint",
        {
          method: "POST",
          body: formData
        }
      );

      let data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to submit complaint."
        );
      }

      alert(
        "Your pothole complaint has been registered successfully!\n" +
        "Tracking Case ID: " + (data.case_id || "Not returned by server")
      );

      window.location.href = "index.html";
    } catch (error) {
      console.error("Complaint submission error:", error);
      alert("Error: " + error.message);

      submitBtn.disabled = false;
      submitBtn.innerText = "Submit Complaint";
    }
  }
);
