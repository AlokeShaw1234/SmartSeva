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
        const response = await fetch("https://smartseva-5dia.onrender.com/users", {
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

