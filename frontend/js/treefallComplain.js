let generatedOtp = null;
let isOtpVerified = false;

// ------------------------------
// GET OTP
// ------------------------------
function getOtp() {
    const mobile = document.getElementById("mobile").value.trim();
    const msg = document.getElementById("msg");

    if (!/^[0-9]{10}$/.test(mobile)) {
        alert("Enter a valid 10-digit mobile number.");
        return;
    }

    generatedOtp = Math.floor(100000 + Math.random() * 900000);
    isOtpVerified = false;

    document.getElementById("otpGroup").style.display = "block";
    document.getElementById("otp").value = "";

    document.querySelector(".submit-btn").disabled = true;

    msg.innerHTML = "";

    // Demo OTP only; no SMS is sent.
    alert("Your demo OTP is: " + generatedOtp);
}

// ------------------------------
// VERIFY OTP
// ------------------------------
function verifyOtp() {
    const enteredOtp = document.getElementById("otp").value.trim();
    const msg = document.getElementById("msg");

    if (generatedOtp === null) {
        alert("Please generate an OTP first.");
        return;
    }

    if (enteredOtp === String(generatedOtp)) {
        isOtpVerified = true;

        msg.textContent = "OTP Verified ✅";
        document.querySelector(".submit-btn").disabled = false;
    } else {
        isOtpVerified = false;

        msg.textContent = "Wrong OTP ❌";
        document.querySelector(".submit-btn").disabled = true;
    }
}

// ------------------------------
// RESET OTP WHEN MOBILE CHANGES
// ------------------------------
document.getElementById("mobile").addEventListener("input", function () {
    generatedOtp = null;
    isOtpVerified = false;

    document.getElementById("otp").value = "";
    document.getElementById("otpGroup").style.display = "none";
    document.getElementById("msg").textContent = "";

    document.querySelector(".submit-btn").disabled = true;
});

// ------------------------------
// VOICE INPUT
// ------------------------------
function startVoiceInput(id) {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice recognition is not supported in this browser.");
        return;
    }

    const rec = new SpeechRecognition();

    rec.lang = document.getElementById("voiceLang").value;
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = function (event) {
        document.getElementById(id).value =
            event.results[0][0].transcript;
    };

    rec.onerror = function (event) {
        console.error("Voice recognition error:", event.error);
        alert("Voice recognition failed. Please try again.");
    };

    rec.start();
}

// ------------------------------
// GET LOCATION
// ------------------------------
function getLocation() {
    const locationInput = document.getElementById("location");

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    locationInput.value = "";
    locationInput.placeholder = "Fetching location...";

    navigator.geolocation.getCurrentPosition(
        function (position) {
            locationInput.value =
                position.coords.latitude + "," +
                position.coords.longitude;
        },

        function (error) {
            locationInput.value = "";

            if (error.code === 1) {
                alert("Location permission denied. Please allow location access.");
            } else if (error.code === 2) {
                alert("Your location is unavailable.");
            } else {
                alert("Location request timed out. Please try again.");
            }

            console.error("Geolocation error:", error.message);
        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

// Fetch location when the page loads.
getLocation();

// ------------------------------
// IMAGE / VIDEO PREVIEW
// ------------------------------
document.getElementById("media").addEventListener("change", function (event) {
    const file = event.target.files[0];
    const preview = document.getElementById("preview");

    preview.innerHTML = "";

    if (!file) {
        return;
    }

    const fileUrl = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
        const img = document.createElement("img");

        img.src = fileUrl;
        img.alt = "Complaint image preview";
        img.style.maxWidth = "100%";
        img.style.maxHeight = "250px";

        preview.appendChild(img);
    } else if (file.type.startsWith("video/")) {
        const video = document.createElement("video");

        video.src = fileUrl;
        video.controls = true;
        video.style.maxWidth = "100%";
        video.style.maxHeight = "250px";

        preview.appendChild(video);
    } else {
        URL.revokeObjectURL(fileUrl);
        alert("Please select a valid image or video.");
        event.target.value = "";
    }
});

// ------------------------------
// SUBMIT COMPLAINT
// ------------------------------
document.getElementById("pftForm").addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const submitBtn = document.querySelector(".submit-btn");

        const category = document.getElementById("category").value.trim();
        const subject = document.getElementById("subject").value.trim();
        const description = document.getElementById("description").value.trim();
        const mobile = document.getElementById("mobile").value.trim();
        const location = document.getElementById("location").value.trim();

        // Validate required fields.
        if (!category || !subject || !description || !mobile || !location) {
            alert("Please complete all required fields and fetch your location.");
            return;
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            alert("Enter a valid 10-digit mobile number.");
            return;
        }

        if (!isOtpVerified) {
            alert("Please verify your mobile number using OTP first.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        try {
            const formData = new FormData(this);

            // Send complaint to the backend route.
            const response = await fetch(
                "http://localhost:3000/submitComplaint",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to submit complaint."
                );
            }

            alert(
                "✅ Your complaint has been successfully registered!\n" +
                "Tracking Case ID: " + data.case_id
            );

            window.location.href = "index.html";

        } catch (error) {
            console.error("Complaint submission error:", error);

            alert("❌ " + error.message);

            submitBtn.disabled = false;
            submitBtn.innerText = "Submit Complaint";
        }
    }
);