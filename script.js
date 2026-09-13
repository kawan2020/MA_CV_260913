document.addEventListener("DOMContentLoaded", () => {
    if (typeof myTextData !== "undefined") {
        const contentMap = parseContentsFile(myTextData);
        populateWebpage(contentMap);
        initCarousel(contentMap["block_9_1"]);
    } else {
        console.error("Could not find myTextData variable. Make sure contents.js is loaded.");
        document.querySelectorAll("[data-key]").forEach(el => {
            el.textContent = "Configuration source missing.";
        });
    }
});

function parseContentsFile(text) {
    const map = {};
    const lines = text.split(/\r?\n/);
    let currentBlock = "";
    let currentLines = [];

    lines.forEach(line => {
        // Matches decimal headings like 9_1 alongside integers like 9
        const match = line.match(/^Block\s+([\d_]+)/i);
        if (match) {
            if (currentBlock) {
                map[currentBlock] = currentLines.join("\n").trim();
            }
            currentBlock = "block_" + match[1];
            currentLines = [];
        } else {
            if (currentBlock) {
                currentLines.push(line);
            }
        }
    });

    if (currentBlock) {
        map[currentBlock] = currentLines.join("\n").trim();
    }
    return map;
}

function populateWebpage(data) {
    const fields = {
        "block1_name": data["block_1"] || "Maryanne Ko",
        "block2_content": data["block_2"] || "",
        "block3_content": data["block_3"] || "",
        
        ...splitDateAndContent(data["block_4"], "block4"),
        ...splitDateAndContent(data["block_5"], "block5"),
        ...splitDateAndContent(data["block_6"], "block6"),

        "block7_content": data["block_7"] || "",
        "block8_content": data["block_8"] || "",
        "block9_content": data["block_9"] || "",
        "block10_content": data["block_10"] || "",

        ...parseContactBlock(data["block_11"])
    };

    Object.keys(fields).forEach(key => {
        const target = document.querySelector(`[data-key="${key}"]`);
        if (target) {
            target.textContent = fields[key];
        }
    });
}

// Carousel Assembly and Controller Engine Loop
function initCarousel(rawText) {
    const track = document.getElementById("cert-carousel-track");
    const dotsContainer = document.getElementById("cert-carousel-dots");
    const prevBtn = document.getElementById("cert-prev-btn");
    const nextBtn = document.getElementById("cert-next-btn");

    if (!rawText || !track) return;

    // Clear out any old mockup content inside containers before building slides
    track.innerHTML = "";
    dotsContainer.innerHTML = "";

    // Parse image entries while strictly ignoring comment lines or empty rows
    const items = rawText.split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith("//"))
        .map(line => {
            const parts = line.split("|");
            return {
                img: parts[0] ? parts[0].trim() : "",
                desc: parts[1] ? parts[1].trim() : ""
            };
        }).filter(item => item.img.length > 0);

    if (items.length === 0) return;

    let currentIndex = 0;

    // Build the clean sliding layout structure
    items.forEach((item, index) => {
        const slide = document.createElement("div");
        slide.className = "carousel-slide";
        slide.innerHTML = `
            <img src="certificate/${item.img}" alt="Certificate ${index + 1}">
            <div class="slide-description">${item.desc}</div>
        `;
        track.appendChild(slide);

        const dot = document.createElement("div");
        dot.className = `dot ${index === 0 ? "active" : ""}`;
        dot.addEventListener("click", () => moveToSlide(index));
        dotsContainer.appendChild(dot);
    });

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        const dots = dotsContainer.querySelectorAll(".dot");
        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentIndex);
        });
    }

    function moveToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }

    nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel();
    });

    prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel();
    });
}

function splitDateAndContent(rawText, prefix) {
    if (!rawText) return { [`${prefix}_date`]: "", [`${prefix}_content`]: "" };
    const lines = rawText.split("\n");
    const date = lines[0] || "";
    const content = lines.slice(1).join("\n");
    return {
        [`${prefix}_date`]: date,
        [`${prefix}_content`]: content
    };
}

function parseContactBlock(rawText) {
    const result = {};
    if (!rawText) return result;
    const lines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    for (let i = 0; i < 4; i++) {
        result[`block11_icon${i+1}`] = lines[i] || "";
    }
    return result;
}
