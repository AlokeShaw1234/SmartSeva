
let generatedOtp = null;
let isOtpVerified = false;

// ===============================
// 1. GET OTP
// ===============================
function getOtp() {
    const mobile = document.getElementById("mobile").value.trim();

    if (!/^[0-9]{10}$/.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
    }

    generatedOtp = Math.floor(100000 + Math.random() * 900000);
    isOtpVerified = false;

    alert("Demo OTP: " + generatedOtp);

    document.getElementById("otpGroup").style.display = "block";
    document.querySelector(".submit-btn").disabled = true;

    document.getElementById("msg").innerHTML = "";
}

// ===============================
// 2. VERIFY OTP
// ===============================
function verifyOtp() {
    const otp = document.getElementById("otp").value.trim();
    const message = document.getElementById("msg");
    const submitBtn = document.querySelector(".submit-btn");

    if (generatedOtp === null) {
        message.textContent = "Please generate OTP first.";
        return;
    }

    if (otp === String(generatedOtp)) {
        isOtpVerified = true;
        message.textContent = "OTP Verified ✅";
        submitBtn.disabled = false;
    } else {
        isOtpVerified = false;
        message.textContent = "Wrong OTP ❌";
        submitBtn.disabled = true;
    }
}

// ===============================
// 3. VOICE INPUT
// ===============================
function startVoiceInput(id) {
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice input is not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = document.getElementById("voiceLang").value;
    recognition.interimResults = false;

    recognition.onresult = function (event) {
        document.getElementById(id).value =
            event.results[0][0].transcript;
    };

    recognition.onerror = function (event) {
        console.error("Voice input error:", event.error);
        alert("Voice input failed. Please try again.");
    };

    recognition.start();
}

// ===============================
// 4. GET GPS LOCATION
// ===============================
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            document.getElementById("location").value =
                position.coords.latitude +
                "," +
                position.coords.longitude;
        },
        function (error) {
            console.error("Location error:", error.message);
            document.getElementById("location").value = "";
        }
    );
}

// ===============================
// 5. IMAGE / VIDEO PREVIEW
// ===============================
document.getElementById("media").addEventListener("change", function (event) {
    const file = event.target.files[0];
    const preview = document.getElementById("preview");

    preview.innerHTML = "";

    if (!file) {
        return;
    }

    const fileUrl = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
        const image = document.createElement("img");
        image.src = fileUrl;
        image.alt = "Complaint image preview";
        image.style.maxWidth = "250px";
        image.style.height = "auto";
        preview.appendChild(image);
    } else if (file.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.src = fileUrl;
        video.controls = true;
        video.style.maxWidth = "250px";
        preview.appendChild(video);
    } else {
        URL.revokeObjectURL(fileUrl);
        alert("Please select an image or video file.");
        event.target.value = "";
    }
});

// ===============================
// 6. SUBMIT COMPLAINT
// ===============================
document.getElementById("pftForm").addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const form = this;
        const submitBtn = document.querySelector(".submit-btn");

        if (!isOtpVerified) {
            alert("Please verify your mobile number using OTP.");
            return;
        }

        const mobile = document.getElementById("mobile").value.trim();

        if (!/^[0-9]{10}$/.test(mobile)) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        const formData = new FormData(form);

        // Ensure the backend receives the expected field names.
        formData.set("mobile", mobile);

        const categoryInput = document.getElementById("category");

        if (categoryInput) {
            formData.set("category", categoryInput.value);
        }

        // The backend expects the uploaded file field to be named "media".
        const mediaInput = document.getElementById("media");

        if (mediaInput && mediaInput.files.length > 0) {
            formData.set("media", mediaInput.files[0]);
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting...";

        try {
            // Change 3000 if your backend uses a different port.
            const response = await fetch(
                "http://localhost:3000/submitComplaint",
                {
                    method: "POST",
                    body: formData
                }
            );

            const responseText = await response.text();

            console.log("HTTP Status:", response.status);
            console.log("Backend Response:", responseText);

            let data;

            try {
                data = JSON.parse(responseText);
            } catch (error) {
                throw new Error(
                    "Invalid response from server. Check the backend terminal."
                );
            }

            if (!response.ok || data.success === false) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to submit complaint."
                );
            }

            alert(
                "Complaint registered successfully!\n" +
                "Case ID: " +
                (data.case_id || "Please check the backend response.")
            );

            window.location.href = "index.html";

        } catch (error) {
            console.error("Submit Complaint Error:", error);

            alert("Failed to submit complaint: " + error.message);

            submitBtn.disabled = false;
            submitBtn.innerText = "Submit Complaint";
        }
    }
);
