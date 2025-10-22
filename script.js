// === CONFIG ===
const CONFIG = {
    MINIMUM_FUNC: 4,
    MINIMUM_ROL: 2,
    MAXIMUM_ROL: 3,
    VARIANT_REQUIREMENTS: {
        Backend: { min: 6, max: 7 },
        Fullstack: { min: 5, max: 6 },
        Frontend: { min: 4, max: 5 }
    },
    TOAST_DURATION: 5000,
};

// === ELEMENTS ===
const elements = {
    variant: document.getElementsByName('variant'),
    naam: document.getElementById('naam'),
    rollen: document.getElementById('rollen'),
    entiteiten: document.getElementById('entiteiten'),
    functionaliteiten: document.getElementById('functionaliteiten'),
    apiVoldoetNiet: document.getElementById('apiVoldoetNiet'),
    backendVoldoetNiet: document.getElementById('backendVoldoetNiet'),
    toelichting: document.getElementById('toelichting'),
    eindDatum: document.getElementById('eindDatum'),
    result: document.getElementById('result'),
    charCount: document.getElementById('charCount'),
    backendSections: document.getElementById('backendSections'),
    frontendSections: document.getElementById('frontendSections'),
    userCheckbox: document.getElementById('userCheckbox'),
    securityCheckbox: document.getElementById('securityCheckbox'),
    userImplicitCheckbox: document.getElementById('userImplicitCheckbox'),
    securityImplicitCheckbox: document.getElementById('securityImplicitCheckbox'),
    resultChangeable: document.getElementsByName('result_change'),
    securityExplicit: document.getElementById('securityCheckbox'),
    userExplicit: document.getElementById('userCheckbox'),

    toastContainer: (() => {
        const container = document.createElement('div');
        container.className = 'fixed top-4 right-4 z-50 pointer-events-none';
        document.body.appendChild(container);
        return container;
    })(),
};

// === HELPERS ===
const getSelectedVariant = () =>
    Array.from(elements.variant).find(radio => radio.checked)?.value || "Frontend";

const getManualResultChoice = () =>
    Array.from(elements.resultChangeable).find(radio => radio.checked)?.value || null;

const updateCharCount = () => {
    elements.charCount.textContent = elements.result.value.length;
};

const createToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = 'mb-3 pointer-events-auto';
    toast.innerHTML = `
        <div class="max-w-sm bg-white rounded-lg shadow-lg border border-gray-100 p-4 flex items-center space-x-3 transform transition-all duration-300 translate-x-full">
            <div class="flex-shrink-0">
                <div class="w-8 h-8 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
            </div>
            <p class="text-gray-700 font-medium">${message}</p>
        </div>`;
    elements.toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.firstElementChild.classList.remove('translate-x-full'));
    setTimeout(() => {
        toast.firstElementChild.classList.add('translate-x-full');
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
};

const copyToClipboard = () => {
    navigator.clipboard.writeText(elements.result.value)
        .then(() => createToast('Template copied to clipboard!'))
        .catch(() => createToast('Failed to copy template', 'error'));
};

const clearAll = (keepEndDate = false) => {
    elements.naam.value = "";
    elements.rollen.value = "";
    elements.entiteiten.value = "";
    elements.functionaliteiten.value = "";
    elements.apiVoldoetNiet.value = "";
    elements.backendVoldoetNiet.value = "";
    elements.toelichting.value = "";
    elements.result.value = "";
    elements.userCheckbox.checked = true;
    elements.securityCheckbox.checked = true;
    elements.userImplicitCheckbox.checked = false;
    elements.securityImplicitCheckbox.checked = false;
    elements.resultChangeable.forEach(r => (r.checked = false));
    if (!keepEndDate) elements.eindDatum.value = "";
    updateCharCount();
};

const toggleSections = (variant) => {
    elements.backendSections.classList.toggle("hidden", variant !== "Backend" && variant !== "Fullstack");
    elements.frontendSections.classList.toggle("hidden", variant !== "Frontend");
};

// === FRONTEND TEMPLATE ===
const generateFrontendTemplate = () => {
    const funcValue = elements.functionaliteiten.value.trim();
    const apiIssues = elements.apiVoldoetNiet.value.trim();
    const backendIssues = elements.backendVoldoetNiet.value.trim();
    const toelichting = elements.toelichting.value.trim();
    const eindDatum = elements.eindDatum.value.trim();

    if (!funcValue)
        return "Je hebt geen juiste functionaliteiten opgegeven. Lees de ideefase en de eindopdracht nog eens goed door.\n";

    const funcLines = funcValue.split("\n").filter(line => line.trim());
    const voldoet = funcLines.length >= CONFIG.MINIMUM_FUNC;

    let template = `Je bent al goed op weg met je idee!\nUit jouw idee kan ik de volgende functionaliteiten halen:\n- ${funcValue.replace(/\n/g, '\n- ')}\n\n`;
    template += `Hiermee voldoe je${voldoet ? '' : ' nog niet'} aan de eisen van de opdracht.\n`;

    if (!voldoet) {
        const remaining = CONFIG.MINIMUM_FUNC - funcLines.length;
        template += `Je moet nog ${remaining} ${remaining === 1 ? 'functionaliteit' : 'functionaliteiten'} toevoegen.\n`;
    }

    if (toelichting) template += `\n${toelichting}\n\n`;
    if (apiIssues) template += `\nJe api voldoet niet aan de eisen:\n- ${apiIssues.replace(/\n/g, '\n- ')}\n`;
    if (backendIssues) template += `\nJe backend voldoet niet aan de eisen:\n- ${backendIssues.replace(/\n/g, '\n- ')}\n`;

    const voldoetEisen = voldoet && !apiIssues && !backendIssues;
    template += voldoetEisen
        ? "\nJe hebt een GO!\n"
        : `\nJe hebt een NO GO!\nJe kan je aangepaste idee inleveren tot ${eindDatum}. Let op: Je moet een GO hebben om aan je eindopdracht te beginnen.\n`;

    return template;
};

// === BACKEND TEMPLATE ===
const generateBackendTemplate = () => {
    const rollenLines = elements.rollen.value.trim().split("\n").filter(line => line.trim());
    const entiteitenLines = elements.entiteiten.value.trim().split("\n").filter(line => line.trim());
    const toelichting = elements.toelichting.value.trim();
    const eindDatum = elements.eindDatum.value.trim();
    const variant = getSelectedVariant();
    const requirements = CONFIG.VARIANT_REQUIREMENTS[variant];

    // impliciete aanwezigheid
    // user
    const userExplicit = elements.userCheckbox.checked;      // Expliciet aanwezig
    const userImplicit = elements.userImplicitCheckbox?.checked || false;  // Impliciet aanwezig

// security
    const securityExplicit = elements.securityCheckbox.checked;
    const securityImplicit = elements.securityImplicitCheckbox?.checked || false;

    console.log(securityExplicit,securityImplicit )
// Bepaal wat als extra feedback moet verschijnen
    let additionalEntities = [];
    if (!(userExplicit || userImplicit)) additionalEntities.push('user (inloggegevens)');
    if (!(securityExplicit || securityImplicit)) additionalEntities.push('security');


// Tellen voor totaal aantal entiteiten (voor GO/NO GO)
    const totalEntities =
        entiteitenLines.length +
        (userExplicit ? 1 : 0) +
        (securityExplicit ? 1 : 0);


    let template = "";

    if (rollenLines.length) {
        template += `\nUit jouw idee kan ik de volgende gebruikersrollen halen:\n- ${rollenLines.join('\n- ')}\n\n`;
        template += `Hiermee voldoe je ${rollenLines.length >= CONFIG.MINIMUM_ROL && rollenLines.length <= CONFIG.MAXIMUM_ROL ? '' : 'niet '}aan de eis van minimaal ${CONFIG.MINIMUM_ROL} en maximaal ${CONFIG.MAXIMUM_ROL} rollen.\n\n`;
    }

    if (entiteitenLines.length) {
        template += `De volgende entiteiten (Klassen) herken ik:\n- ${entiteitenLines.join('\n- ')}\n\n`;
        if (additionalEntities.length > 0) {
            template += `Het is belangrijk dat je deze nog toevoegt:\n- ${additionalEntities.join('\n- ')}\n\n`;
        }
        template += `Hiermee kom je op ${totalEntities} entiteiten en voldoe je ${totalEntities >= requirements.min && totalEntities <= requirements.max ? '' : 'niet '}aan de eisen (minimaal ${requirements.min}, maximaal ${requirements.max}).\n`;
    }

    if (toelichting) template += `\n${toelichting}\n\n`;

    const voldoet =
        rollenLines.length >= CONFIG.MINIMUM_ROL &&
        rollenLines.length <= CONFIG.MAXIMUM_ROL &&
        totalEntities >= requirements.min &&
        totalEntities <= requirements.max;

    template += voldoet
        ? "Je hebt een GO!\n"
        : `Je hebt een NO GO!\nJe kan je aangepaste idee inleveren tot ${eindDatum}. Let op: Je moet een GO hebben om aan je eindopdracht te beginnen.\n`;

    return template;
};

// === TEMPLATE UPDATE ===
const updateTemplate = () => {
    const naam = elements.naam.value.trim();
    const variant = getSelectedVariant();
    const header = `Beste ${naam},\n\n`;

    // body genereren op basis van variant
    const body = variant === "Frontend"
        ? generateFrontendTemplate()
        : generateBackendTemplate();

    // volledige template inclusief naam
    elements.result.value = header + body;

    // automatische GO/NO GO selecteren in de radiobuttons
    const autoResult = body.includes("Je hebt een GO!") ? "GO" : "NOGO";
    elements.resultChangeable.forEach(radio => {
        radio.checked = radio.value === autoResult;
    });

    updateCharCount();
};


// === HANDMATIGE GO/NO GO ===
const updateManualResult = (manualChoice = null) => {
    const choice = manualChoice || getManualResultChoice();
    if (!choice) return;
    const eindDatum = elements.eindDatum.value.trim();
    let newText = "";
    if (choice === "GO") {
        newText = "\nJe hebt een GO!\n";
    } else {
        newText = `\nJe hebt een NO GO!\nJe kan je aangepaste idee inleveren tot ${eindDatum}. Let op: Je moet een GO hebben om aan je eindopdracht te beginnen.\n`;
    }
    elements.result.value = elements.result.value.replace(/Je hebt een (NO GO|GO)![\s\S]*$/g, "") + newText;
    updateCharCount();
};

// === EVENTS ===
document.querySelectorAll('input[name="variant"]').forEach(i => i.addEventListener('change', () => {
    toggleSections(getSelectedVariant());
    updateTemplate();
}));
[
    elements.naam, elements.rollen, elements.entiteiten, elements.functionaliteiten,
    elements.apiVoldoetNiet, elements.backendVoldoetNiet, elements.toelichting, elements.eindDatum
].forEach(el => el.addEventListener('input', updateTemplate));

elements.userCheckbox.addEventListener('change', updateTemplate);
elements.securityCheckbox.addEventListener('change', updateTemplate);
elements.userImplicitCheckbox?.addEventListener('change', updateTemplate);
elements.securityImplicitCheckbox?.addEventListener('change', updateTemplate);

elements.resultChangeable.forEach(r => r.addEventListener('change', () => updateManualResult()));

document.getElementById('copyButton').addEventListener('click', copyToClipboard);
document.getElementById('clearAll').addEventListener('click', () => clearAll(false));
document.getElementById('clearKeepEnddate').addEventListener('click', () => clearAll(true));

// === INIT ===
toggleSections(getSelectedVariant());
updateTemplate();
