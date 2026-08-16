const PRAYER_MANIFEST_PATH = "prayers/index.json";

const navigation = document.getElementById("navigation");
const prayerList = document.getElementById("prayerList");
const prayerViewer = document.getElementById("prayerViewer");

window.addEventListener("DOMContentLoaded", async () => {
    navigation.classList.add("show");
    addNavigationHandlers();
    await renderPrayerBrowser();
});

function addNavigationHandlers() {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
        item.addEventListener("click", (event) => {
            const href = item.getAttribute("href");
            if (!href || !href.startsWith("#")) return;
            event.preventDefault();
            const target = document.getElementById(href.slice(1));
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

async function renderPrayerBrowser() {
    try {
        const manifest = await loadPrayerManifest();
        const prayers = await Promise.all(manifest.prayers.map(loadPrayerFile));

        if (!prayers.length) {
            setPrayerError("No prayers are listed yet.");
            return;
        }

        renderPrayerList(prayers);
        renderSelectedPrayer(prayers, 0);
    } catch {
        setPrayerError("Unable to load prayers right now.");
    }
}

async function loadPrayerManifest() {
    const response = await fetch(PRAYER_MANIFEST_PATH);
    if (!response.ok) {
        throw new Error(`Failed to load ${PRAYER_MANIFEST_PATH}`);
    }

    const manifest = await response.json();
    if (!manifest?.prayers || !Array.isArray(manifest.prayers)) {
        throw new Error("Invalid prayer manifest format.");
    }

    return manifest;
}

async function loadPrayerFile(prayer) {
    const response = await fetch(prayer.path);
    if (!response.ok) {
        throw new Error(`Failed to load ${prayer.path}`);
    }

    const markdown = await response.text();
    const lines = markdown.split("\n");
    const contentLines = lines[0].trim().startsWith("#") ? lines.slice(1) : lines;
    const text = contentLines.join("\n").trim();
    return { ...prayer, text };
}

function renderPrayerList(prayers) {
    prayerList.innerHTML = prayers
        .map((prayer, index) => {
            return `
                <button class="prayer-list-item" data-prayer-index="${index}" type="button">
                    <span class="prayer-list-title">${escapeHtml(prayer.title)}</span>
                    ${prayer.category ? `<span class="prayer-list-tag">${escapeHtml(prayer.category)}</span>` : ""}
                </button>
            `;
        })
        .join("");

    const buttons = prayerList.querySelectorAll(".prayer-list-item");
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const index = Number(button.dataset.prayerIndex);
            renderSelectedPrayer(prayers, index);
        });
    });
}

function renderSelectedPrayer(prayers, index) {
    const prayer = prayers[index];
    const paragraphs = prayer.text
        .split(/\n\s*\n/)
        .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
        .join("");

    prayerViewer.innerHTML = `
        <header class="prayer-viewer-header">
            <h3>${escapeHtml(prayer.title)}</h3>
            <button class="copy-button" type="button">Copy prayer</button>
        </header>
        <div class="prayer-body">${paragraphs}</div>
    `;

    prayerList.querySelectorAll(".prayer-list-item").forEach((button, buttonIndex) => {
        button.classList.toggle("active", buttonIndex === index);
    });

    const copyButton = prayerViewer.querySelector(".copy-button");
    copyButton.addEventListener("click", async () => {
        const textToCopy = `${prayer.title}\n\n${prayer.text}`;
        const copied = await copyText(textToCopy);
        copyButton.classList.toggle("copied", copied);
        copyButton.textContent = copied ? "Copied!" : "Copy failed";
        setTimeout(() => {
            copyButton.classList.remove("copied");
            copyButton.textContent = "Copy prayer";
        }, 1400);
    });
}

function setPrayerError(message) {
    prayerList.innerHTML = "";
    prayerViewer.innerHTML = `<p class="status">${escapeHtml(message)}</p>`;
}

async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fall through to legacy copy support.
        }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);

    const selection = document.getSelection();
    const selectedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
        copied = document.execCommand("copy");
    } catch {
        copied = false;
    }

    document.body.removeChild(textarea);

    if (selectedRange && selection) {
        selection.removeAllRanges();
        selection.addRange(selectedRange);
    }

    return copied;
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
