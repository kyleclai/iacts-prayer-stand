const TEXT_TO_TYPE = "Welcome to the IACTS Prayer Stand";
const TYPING_SPEED = 70;
const TYPING_DELAY = 350;

const PRAYER_FILES = [
    { title: "Contrition Prayer", path: "prayers/contrition-prayer.md" },
    { title: "Prayer of Supplication", path: "prayers/supplication-prayer.md" }
];

const navigation = document.getElementById("navigation");
const typingText = document.getElementById("typingText");
const prayerCards = document.getElementById("prayerCards");

window.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    typingText.textContent = "";
    navigation.classList.remove("show");
    document.body.style.overflowY = "hidden";
    addNavigationHandlers();
});

window.addEventListener("load", async () => {
    setTimeout(startTypingAnimation, TYPING_DELAY);
    await renderPrayers();
});

function startTypingAnimation() {
    let i = 0;

    function typeWriter() {
        if (i < TEXT_TO_TYPE.length) {
            typingText.textContent += TEXT_TO_TYPE.charAt(i);
            i += 1;
            setTimeout(typeWriter, TYPING_SPEED);
            return;
        }

        navigation.classList.add("show");
        document.body.style.overflowY = "auto";
    }

    typeWriter();
}

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

async function renderPrayers() {
    try {
        const prayers = await Promise.all(PRAYER_FILES.map(loadPrayerFile));
        prayerCards.innerHTML = prayers.map(createPrayerCard).join("");
        attachCopyHandlers(prayers);
    } catch (error) {
        prayerCards.innerHTML = `<p class="status">Unable to load prayers right now.</p>`;
    }
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

function createPrayerCard(prayer, index) {
    const paragraphs = prayer.text
        .split(/\n\s*\n/)
        .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
        .join("");

    return `
        <article class="prayer-card">
            <h3>${escapeHtml(prayer.title)}</h3>
            <div class="prayer-body">${paragraphs}</div>
            <button class="copy-button" data-prayer-index="${index}" type="button">Copy prayer</button>
        </article>
    `;
}

function attachCopyHandlers(prayers) {
    document.querySelectorAll(".copy-button").forEach((button) => {
        button.addEventListener("click", async () => {
            const index = Number(button.dataset.prayerIndex);
            const prayer = prayers[index];
            const textToCopy = `${prayer.title}\n\n${prayer.text}`;

            const copied = await copyText(textToCopy);
            if (!copied) return;

            button.classList.add("copied");
            button.textContent = "Copied!";
            setTimeout(() => {
                button.classList.remove("copied");
                button.textContent = "Copy prayer";
            }, 1400);
        });
    });
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = document.execCommand("copy");
        document.body.removeChild(textarea);
        return success;
    }
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}
