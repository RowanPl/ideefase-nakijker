// Configuration
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

// DOM Elements
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

    toastContainer: (() => {
        const container = document.createElement('div');
        container.className = 'fixed top-4 right-4 z-50 pointer-events-none';
        document.body.appendChild(container);
        return container;
    })(),
};

// Helper Functions
const getSelectedVariant = () => {
    return Array.from(elements.variant).find(radio => radio.checked)?.value || "Frontend";
};

const updateCharCount = () => {
    const charCount = elements.result.value.length;
    elements.charCount.textContent = charCount;
};

const createToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = 'mb-3 pointer-events-auto';

    // Set inner HTML with Tailwind classes
    toast.innerHTML = `
        <div class="max-w-sm bg-white rounded-lg shadow-lg border border-gray-100 p-4 flex items-center space-x-3 transform transition-all duration-300 translate-x-full">
            <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
            </div>
            <p class="text-gray-700 font-medium">${message}</p>
        </div>
    `;

    // Add to container
    elements.toastContainer.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(() => {
        const toastContent = toast.firstElementChild;
        toastContent.classList.remove('translate-x-full');
    });

    // Remove after duration
    setTimeout(() => {
        const toastContent = toast.firstElementChild;
        toastContent.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                elements.toastContainer.removeChild(toast);
            }
        }, 300); // Wait for exit animation
    }, CONFIG.TOAST_DURATION);
};

// Update the copyToClipboard function
const copyToClipboard = () => {
    navigator.clipboard.writeText(elements.result.value)
        .then(() => {
            createToast('Template copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            createToast('Failed to copy template', 'error');
        });
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

    if (!keepEndDate) {
        elements.eindDatum.value = "";
    }

    updateCharCount();
};

const toggleSections = (variant) => {
    elements.backendSections.classList.toggle("hidden", variant !== "Backend" && variant !== "Fullstack");
    elements.frontendSections.classList.toggle("hidden", variant !== "Frontend");
};

// Template Generators
const generateFrontendTemplate = () => {
    const funcValue = elements.functionaliteiten.value.trim();
    const apiIssues = elements.apiVoldoetNiet.value.trim();
    const backendIssues = elements.backendVoldoetNiet.value.trim();
    const toelichting = elements.toelichting.value.trim();
    const eindDatum = elements.eindDatum.value.trim();

    let template = "";

    if (!funcValue) {
        return "Je hebt geen juiste functionaliteiten opgegeven. Lees de ideefase en de eindopdracht nog eens goed door.\n";
    }

    const funcLines = funcValue.split("\n").filter(line => line.trim());
    const voldoet = funcLines.length >= CONFIG.MINIMUM_FUNC;

    template += `Je bent al goed op weg met je idee!\nUit jouw idee kan ik de volgende functionaliteiten halen:\n- ${funcValue.replace(/\n/g, '\n- ')}\n\n`;
    template += `Hiermee voldoe je${voldoet ? '' : ' nog niet'} aan de eisen van de opdracht.\n`;

    if (!voldoet) {
        const remaining = CONFIG.MINIMUM_FUNC - funcLines.length;
        template += `Je moet nog ${remaining} ${remaining === 1 ? 'functionaliteit' : 'functionaliteiten'} toevoegen.\n`;
    }

    if (toelichting) {
        template += `\n${toelichting}\n\n`;
    }

    if (apiIssues) {
        template += `\nJe api voldoet niet aan de eisen van de opdracht. Hieronder waar je op moet letten:\n- ${apiIssues.replace(/\n/g, '\n- ')}\n`;
    }

    if (backendIssues) {
        template += `\nJe backend voldoet niet aan de eisen van de opdracht. Hieronder waar je op moet letten:\n- ${backendIssues.replace(/\n/g, '\n- ')}\n`;
    }

    if ((apiIssues || backendIssues) && eindDatum) {
        template += `\nJe hebt een NO GO!\nJe kan je aangepaste idee inleveren tot ${eindDatum}. Let op: Je moet een GO hebben om aan je eindopdracht te beginnen.\n`;
    }

    return template;
};

const generateBackendTemplate = () => {
    const rollenLines = elements.rollen.value.trim().split("\n").filter(line => line.trim());
    const entiteitenLines = elements.entiteiten.value.trim().split("\n").filter(line => line.trim());
    const toelichting = elements.toelichting.value.trim();
    const eindDatum = elements.eindDatum.value.trim();
    const variant = getSelectedVariant();
    const requirements = CONFIG.VARIANT_REQUIREMENTS[variant];

    let template = "";

    if (rollenLines.length) {
        template += `\nUit jouw idee kan ik de volgende gebruikersrollen halen:\n- ${rollenLines.join('\n- ')}\n\n`;
        template += `Hiermee voldoe je ${rollenLines.length >= CONFIG.MINIMUM_ROL && rollenLines.length <= CONFIG.MAXIMUM_ROL ? '' : 'niet '}aan de vraag minimaal ${CONFIG.MINIMUM_ROL} en maximaal ${CONFIG.MAXIMUM_ROL} gebruikersrollen voor je eindopdracht.\n\n`;
    }

    if (entiteitenLines.length) {
        template += `Ook kan ik de volgende entiteiten (Klassen) herkennen:\n\n- ${entiteitenLines.join('\n- ')}\n\n`;
        template += `Hiermee kom je op ${entiteitenLines.length} entiteiten. Het is belangrijk dat je de volgende entiteit daar nog aan toevoegt:\n- user (inloggegevens)\n- security\n\n`;
        template += `Hiermee kom je op ${entiteitenLines.length + 2} entiteiten en voldoe je ${entiteitenLines.length + 2 >= requirements.min && entiteitenLines.length + 2 <= requirements.max ? '' : 'niet '}aan de voorwaarde van minimaal ${requirements.min} en maximaal ${requirements.max} entiteiten.\n`;
    }

    if (toelichting) {
        template += `\n${toelichting}\n\n`;
    }

    const voldoet = rollenLines.length >= CONFIG.MINIMUM_ROL &&
        rollenLines.length <= CONFIG.MAXIMUM_ROL &&
        entiteitenLines.length + 2 >= requirements.min &&
        entiteitenLines.length + 2 <= requirements.max;

    template += voldoet ? "Je hebt een GO!\n" : `Je hebt een NO GO!\nJe kan je aangepaste idee inleveren tot ${eindDatum}. Let op: Je moet een GO hebben om aan je eindopdracht te beginnen.\n`;

    return template;
};

// Update Template
const updateTemplate = () => {
    const naam = elements.naam.value.trim();
    const variant = getSelectedVariant();
    const templateHeader = `Beste ${naam},\n\n`;
    const templateBody = variant === "Frontend" ? generateFrontendTemplate() : generateBackendTemplate();

    elements.result.value = templateHeader + templateBody;
    updateCharCount();
};

// Event Listeners
document.querySelectorAll('input[name="variant"]').forEach(input => {
    input.addEventListener('change', () => {
        toggleSections(getSelectedVariant());
        updateTemplate();
    });
});

elements.naam.addEventListener('input', updateTemplate);
elements.rollen.addEventListener('input', updateTemplate);
elements.entiteiten.addEventListener('input', updateTemplate);
elements.functionaliteiten.addEventListener('input', updateTemplate);
elements.apiVoldoetNiet.addEventListener('input', updateTemplate);
elements.backendVoldoetNiet.addEventListener('input', updateTemplate);
elements.toelichting.addEventListener('input', updateTemplate);
elements.eindDatum.addEventListener('input', updateTemplate);

document.getElementById('copyButton').addEventListener('click', copyToClipboard);
document.getElementById('clearAll').addEventListener('click', () => clearAll(false));
document.getElementById('clearKeepEnddate').addEventListener('click', () => clearAll(true));

const style = document.createElement('style');
style.textContent = `
    .toast-enter {
        transform: translateX(100%);
    }
    .toast-enter-active {
        transform: translateX(0);
        transition: transform 300ms ease-out;
    }
    .toast-exit {
        transform: translateX(0);
    }
    .toast-exit-active {
        transform: translateX(100%);
        transition: transform 300ms ease-out;
    }
`;
document.head.appendChild(style);
// Initialize
toggleSections(getSelectedVariant());
updateTemplate();
