const MOCK_COURSES_OLD = [
  { id: 'o1', code: 'MAT1', name: 'Matemática 1', credits: 3, grade: 16, status: 'approved', plan: 'old' },
  { id: 'o2', code: 'MAT2', name: 'Matemática 2', credits: 3, grade: 14, status: 'approved', plan: 'old' },
  { id: 'o3', code: 'LEN1', name: 'Lenguaje y Redacción', credits: 4, grade: 15, status: 'approved', plan: 'old' },
  { id: 'o4', code: 'ECO1', name: 'Introducción a la Economía', credits: 4, grade: 12, status: 'approved', plan: 'old' },
  { id: 'o5', code: 'HIS1', name: 'Historia Universal', credits: 2, grade: 18, status: 'approved', plan: 'old', category: 'historical' },
  { id: 'o6', code: 'PSI1', name: 'Psicología General', credits: 3, grade: 11, status: 'approved', plan: 'old', category: 'historical' },
  { id: 'o7', code: 'CON1', name: 'Contabilidad Básica', credits: 4, grade: 13, status: 'approved', plan: 'old' },
];

const MOCK_COURSES_NEW = [
  { id: 'n1', code: 'MATF', name: 'Matemática Financiera', credits: 4, status: 'available', plan: 'new' },
  { id: 'n2', code: 'COM1', name: 'Comunicación Efectiva', credits: 4, status: 'available', plan: 'new' },
  { id: 'n3', code: 'ECON', name: 'Principios de Economía', credits: 4, status: 'available', plan: 'new' },
  { id: 'n4', code: 'CONA', name: 'Contabilidad de Gestión', credits: 4, status: 'available', plan: 'new' },
  { id: 'n5', code: 'ETI1', name: 'Ética y Responsabilidad', credits: 2, status: 'available', plan: 'new' },
  { id: 'n6', code: 'INV1', name: 'Metodología de la Investigación', credits: 4, status: 'available', plan: 'new' },
];

const PREDEFINED_EQUIVALENCIES = [
  { id: 'e1', sourceIds: ['o3'], targetId: 'n2', type: 'direct', automatic: true },
  { id: 'e2', sourceIds: ['o1', 'o2'], targetId: 'n1', type: 'and', automatic: true },
  { id: 'e3', sourceIds: ['o4'], targetId: 'n3', type: 'direct', automatic: true },
];

let equivalencies = [];

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar Lucide
  lucide.createIcons();

  const saved = localStorage.getItem("positive_attritions_draft");
  if (saved) {
    equivalencies = JSON.parse(saved);
    // Asegurar que las equivalencias automáticas siempre estén presentes
    PREDEFINED_EQUIVALENCIES.forEach(autoEq => {
      if (!equivalencies.some(e => e.id === autoEq.id)) {
        equivalencies.push(autoEq);
      }
    });
  } else {
    equivalencies = [...PREDEFINED_EQUIVALENCIES];
  }

  const listContainer = document.getElementById("equivalencies-list-container");
  const btnSubmit = document.getElementById("btn-submit-application");

  function removeEquivalency(id) {
    equivalencies = equivalencies.filter(e => e.id !== id);
    localStorage.setItem("positive_attritions_draft", JSON.stringify(equivalencies));
    renderSummary();
  }

  function renderSummary() {
    let automaticCredits = 0;
    let manualCredits = 0;

    listContainer.innerHTML = "";

    equivalencies.forEach(eq => {
      const target = MOCK_COURSES_NEW.find(c => c.id === eq.targetId);
      const sources = MOCK_COURSES_OLD.filter(c => eq.sourceIds.includes(c.id));

      if (target) {
        if (eq.automatic) {
          automaticCredits += target.credits;
        } else {
          manualCredits += target.credits;
        }
      }

      // Generar la tarjeta HTML
      const card = document.createElement("div");
      card.className = "equiv-item-card";
      
      const tagClass = eq.automatic ? "tag-auto" : "tag-manual";
      const tagLabel = eq.automatic ? "Automática" : "Manual / Observada";
      const arrowBgClass = eq.automatic ? "auto-bg" : "manual-bg";

      card.innerHTML = `
        <!-- Etiqueta flotante -->
        <span class="card-tag ${tagClass}">${tagLabel}</span>

        <!-- Sección de origen -->
        <div class="equiv-plan-side">
          <p class="side-title">Plan Viejo</p>
          <div class="side-courses-list">
            ${sources.map(s => `
              <div class="equiv-course-row">
                <span class="course-code-bold">${s.code}</span>
                <span class="course-name-trunc">${s.name}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Separador de flecha -->
        <div class="arrow-divider">
          <div class="arrow-circle ${arrowBgClass}">
            <i data-lucide="arrow-right"></i>
          </div>
        </div>

        <!-- Sección de destino -->
        <div class="equiv-plan-side">
          <p class="side-title">Plan Nuevo</p>
          <div class="side-courses-list">
            <div class="equiv-course-row target-row-box">
              <span class="course-code-bold">${target ? target.code : ''}</span>
              <span class="course-name-trunc">${target ? target.name : ''}</span>
            </div>
          </div>
        </div>

        <!-- Caja de justificación para equivalencias manuales -->
        ${!eq.automatic ? `
          <div class="justification-display-box">
            <i data-lucide="message-square"></i>
            <p>Justificación: ${eq.justification}</p>
          </div>
          <!-- Botón de eliminación -->
          <button class="btn-delete-summary" data-eq-id="${eq.id}">
            <i data-lucide="x"></i>
          </button>
        ` : ''}
      `;

      // Escuchador de eventos para el botón de eliminación dentro de la tarjeta
      if (!eq.automatic) {
        card.querySelector(".btn-delete-summary").addEventListener("click", () => {
          removeEquivalency(eq.id);
        });
      }

      listContainer.appendChild(card);
    });

    // Actualizar los números
    document.getElementById("auto-credits-num").textContent = automaticCredits;
    document.getElementById("manual-credits-num").textContent = manualCredits;
    document.getElementById("total-credits-num").textContent = automaticCredits + manualCredits;

    lucide.createIcons();
  }

  // Flujo de envío
  btnSubmit.addEventListener("click", () => {
    btnSubmit.disabled = true;
    btnSubmit.querySelector("span").textContent = "Enviando...";

    setTimeout(() => {
      // Limpiar el borrador y establecer el estado global de pendiente
      localStorage.removeItem("positive_attritions_draft");
      localStorage.setItem("positive_attritions_pending", "true");
      
      // Limpiar cualquier override de simulación administrativa para activar el estado pendiente en la vista de administración
      localStorage.removeItem("admin_status_app-1");

      alert("Solicitud enviada con éxito");
      window.location.href = "index.html";
    }, 1500);
  });

  renderSummary();
});
