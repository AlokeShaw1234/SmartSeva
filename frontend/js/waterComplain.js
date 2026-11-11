
let generatedOtp;


// ==================== OTP ====================

function getOtp() {
  let m = document.getElementById("mobile").value.trim();

  if (!/^[0-9]{10}$/.test(m)) {
    alert("Enter valid 10-digit number");
    return;
  }

  generatedOtp = Math.floor(100000 + Math.random() * 900000);

  // Development purpose only
  alert("OTP: " + generatedOtp);

  document.getElementById("otpGroup").style.display = "block";
}


function verifyOtp() {
  let o = document.getElementById("otp").value.trim();
  let msg = document.getElementById("msg");

  if (o == generatedOtp) {
    msg.innerHTML = "OTP Verified ✅";

    document.querySelector(".submit-btn").disabled = false;
  } else {
    msg.innerHTML = "Wrong OTP ❌";

    document.querySelector(".submit-btn").disabled = true;
  }
}


// ==================== VOICE INPUT ====================

function startVoiceInput(id) {

  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice input is not supported in this browser");
    return;
  }

  let rec = new webkitSpeechRecognition();

  rec.lang = document.getElementById("voiceLang").value;

  rec.start();

  rec.onresult = (e) => {
    document.getElementById(id).value =
      e.results[0][0].transcript;
  };
}


// ==================== LOCATION ====================

navigator.geolocation.getCurrentPosition(

  (pos) => {

    document.getElementById("location").value =
      pos.coords.latitude + "," +
      pos.coords.longitude;

  },

  () => {

    document.getElementById("location").value =
      "Location denied";

  }

);


// ==================== MEDIA PREVIEW ====================

document.getElementById("media").addEventListener("change", (e) => {

  let f = e.target.files[0];

  let p = document.getElementById("preview");

  p.innerHTML = "";

  if (!f) {
    return;
  }


  // IMAGE PREVIEW

  if (f.type.startsWith("image")) {

    let img = document.createElement("img");

    img.src = URL.createObjectURL(f);

    p.appendChild(img);

  }


  // VIDEO PREVIEW

  else if (f.type.startsWith("video")) {

    let v = document.createElement("video");

    v.src = URL.createObjectURL(f);

    v.controls = true;

    p.appendChild(v);

  }

});


// ==================== SUBMIT COMPLAINT ====================

document.getElementById("pftForm").addEventListener(
  "submit",
  async function (e) {

    e.preventDefault();


    const submitBtn =
      document.querySelector(".submit-btn");


    submitBtn.disabled = true;

    submitBtn.innerText = "Submitting...";


    try {

      const formData = new FormData(this);


      // Make sure category is included

      if (!formData.get("category")) {

        const catInput =
          document.getElementById("category");

        if (catInput) {

          formData.append(
            "category",
            catInput.value
          );

        }

      }


      // Send complaint to backend

      const response = await fetch(
        "https://smartseva-5dia.onrender.com/submitComplaint",
        {
          method: "POST",
          body: formData
        }
      );


      const data = await response.json();


      // SUCCESS

      if (response.ok) {

        alert(
          "✅ Your complaint has been successfully registered!\n\n" +
          "Tracking Case ID: " +
          data.case_id
        );


        window.location.href = "index.html";

      }


      // SERVER ERROR

      else {

        alert(
          "❌ Error: " +
          (
            data.message ||
            data.error ||
            "Failed to submit complaint"
          )
        );


        submitBtn.disabled = false;

        submitBtn.innerText =
          "Submit Complaint";

      }

    }


    // CONNECTION ERROR

    catch (err) {

      console.error(err);

      alert(
        "❌ Error connecting to server"
      );


      submitBtn.disabled = false;

      submitBtn.innerText =
        "Submit Complaint";

    }

  }
);

