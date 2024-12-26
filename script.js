document.getElementById("payButton").addEventListener("click", () => {
    const phoneNumber = prompt("Enter your phone number:");
    if (phoneNumber) {
        fetch("/api/payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ phoneNumber, amount: 100 }) // Replace 100 with your product price
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || "Check your phone to complete the payment.");
        })
        .catch(error => {
            console.error("Error initiating payment:", error);
            alert("Payment initiation failed. Try again.");
        });
    }
});
