document.addEventListener("DOMContentLoaded", () => {
    // Reads directly from the variable inside contents.js without using fetch
    if (typeof myTextData !== "undefined") {
        const contentMap = parseContentsFile(myTextData);
        populateWebpage(contentMap);
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
        const match = line.match(/^(?:\[?Block\s+(\d+))(?::\]?|\s*)/i);
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

function splitDateAndContent(rawText, prefix) {
    if (!rawText) return { [`${prefix}_date`]: "", [`${prefix}_content`]: "" };
    const lines = rawText.split("\n");
    const date = lines[0];
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
