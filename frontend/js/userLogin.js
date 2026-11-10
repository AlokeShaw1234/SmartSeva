// let generatedOTP = "";
// let isOTPVerified = false;

// function sendOTP() {
//     const mobile = document.getElementById("mobile").value.trim();

//     if (!/^[0-9]{10}$/.test(mobile)) {
//         alert("Enter a valid 10-digit mobile number!");
//         return;
//     }

//     generatedOTP = String(Math.floor(1000 + Math.random() * 9000));
//     isOTPVerified = false;

//     document.getElementById("otpSection").style.display = "block";

//     document.getElementById("otpInput").value = "";

//     alert("Demo OTP: " + generatedOTP);
// }

// function verifyOTP() {
//     const enteredOTP = document.getElementById("otpInput").value.trim();
//     const message = document.getElementById("message");

//     if (!generatedOTP) {
//         message.innerHTML = "<p class='error'>Please send OTP first.</p>";
//         return;
//     }

//     if (enteredOTP === generatedOTP) {
//         isOTPVerified = true;
//         message.innerHTML = "<p class='success'>OTP Verified Successfully ✅</p>";
//     } else {
//         isOTPVerified = false;
//         message.innerHTML = "<p class='error'>Invalid OTP ❌</p>";
//     }
// }

// document.getElementById("form").addEventListener("submit", async function (e) {
//     e.preventDefault();

//     const password = document.getElementById("password").value;
//     const message = document.getElementById("message");
//     const loginButton = document.getElementById("loginButton");

//     if (password.length < 5) {
//         alert("Password must be at least 5 characters long!");
//         return;
//     }

//     if (!isOTPVerified) {
//         message.innerHTML = "<p class='error'>Please verify your OTP first.</p>";
//         return;
//     }

//     // Your current HTML has no email input.
//     // The backend login API requires email and password.
//     const emailInput = document.getElementById("email");

//     if (!emailInput || !emailInput.value.trim()) {
//         message.innerHTML = "<p class='error'>Please add and enter your registered email address.</p>";
//         return;
//     }

//     const email = emailInput.value.trim();

//     loginButton.disabled = true;
//     loginButton.textContent = "Logging in...";

//     try {
//         const response = await fetch("http://localhost:3000/register", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 email: email,
//                 password: password
//             })
//         });

//         const data = await response.json();

//         if (!response.ok) {
//             message.innerHTML = `<p class="error">${data.message || "Invalid email or password"}</p>`;
//             return;
//         }

//         message.innerHTML = "<p class='success'>Login successful! ✅</p>";

//         sessionStorage.setItem("user", JSON.stringify(data.user));

//         setTimeout(function () {
//             window.location.href = "index.html";
//         }, 1000);

//     } catch (error) {
//         console.error("Login error:", error);
//         message.innerHTML = "<p class='error'>Unable to connect to the server.</p>";
//     } finally {
//         loginButton.disabled = false;
//         loginButton.textContent = "Login";
//     }
// });


document.getElementById("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const password = document.getElementById("password").value;

    const message = document.getElementById("message");
    const submitButton = document.getElementById("submitButton");

    message.textContent = "";
    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    try {
        const response = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstName,
                lastName,
                mobile,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Failed to save data";
            return;
        }

        message.textContent = data.message;
        document.getElementById("form").reset();

    } catch (error) {
        console.error("Request error:", error);
        message.textContent = "Unable to connect to the server";
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
    }
});

