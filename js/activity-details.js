document.addEventListener("DOMContentLoaded", async () => {
    // 1. Read ID from URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        console.error("No Activity ID provided in URL.");
        return;
    }

    try {
        // 2. Fetch Activity Data
        const response = await fetch(`https://must.runasp.net/api/Activities/${id}`);
        if (!response.ok) throw new Error("Activity not found or server error");
        
        const activity = await response.json();
        console.log("Fetched Activity Details:", activity);

        // 3. Render Details
        // Target elements must exist in your activity-details.html, e.g., <h1 id="detailTitle"></h1>
        const titleEl = document.getElementById("detailTitle");
        const descEl = document.getElementById("detailDesc");
        const imgEl = document.getElementById("detailImg");
        const durationEl = document.getElementById("detailDuration");
        const playersEl = document.getElementById("detailPlayers");
        const categoryEl = document.getElementById("detailCategory");

        if (titleEl) titleEl.innerText = activity.title || "No Title";
        if (descEl) descEl.innerText = activity.description || "No Description available.";
        
        // Duration Mapping
        if (durationEl) {
            durationEl.innerText = activity.duration ? `Duration: ${activity.duration}` : "";
        }
        
        // Players Mapping
        if (playersEl) {
            playersEl.innerText = activity.playersCount !== undefined ? `Players: ${activity.playersCount}` : "";
        }
        
        // Optional Category Mapping
        if (categoryEl) {
            categoryEl.innerText = activity.categoryName ? `Category: ${activity.categoryName}` : "";
        }

        // 4. Image Fix (prepend base URL if relative)
        if (imgEl) {
            let imgUrl = activity.imageUrl || activity.image || 'img/OIP.webp';
            if (imgUrl && imgUrl.startsWith("/")) {
                imgUrl = "https://must.runasp.net" + imgUrl;
            }
            imgEl.src = imgUrl;
            imgEl.alt = activity.title || "Activity Image";
            imgEl.onerror = () => { imgEl.src = 'img/OIP.webp'; };
        }

        // 5. Registration Logic
        const registerBtn = document.getElementById("registerBtn");
        if (registerBtn) {
            registerBtn.addEventListener("click", async () => {
                const token = localStorage.getItem("must_token");
                if (!token) {
                    alert("Please login first to register for this activity.");
                    window.location.href = "login.html";
                    return;
                }

                try {
                    registerBtn.disabled = true;
                    registerBtn.innerText = "Registering...";

                    const regResponse = await fetch("https://must.runasp.net/api/Participants/RegisterActivity", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ activityId: parseInt(id) })
                    });

                    if (!regResponse.ok) {
                        const errData = await regResponse.json().catch(() => ({}));
                        throw new Error(errData.message || "Registration failed. You may already be registered or invalid request.");
                    }

                    alert("Successfully registered for this activity! ✅");
                    registerBtn.innerText = "Registered";
                } catch (err) {
                    console.error("Registration error:", err);
                    alert(err.message);
                    registerBtn.disabled = false;
                    registerBtn.innerText = "Register";
                }
            });
        }

    } catch (error) {
        console.error("Error fetching activity details:", error);
    }
});
