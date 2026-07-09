// Datos simulados que imitan el proyecto original en React
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

// Variables de estado
let equivalencies = [];
let selectedSourceIds = [];
let selectedTargetId = null;
let hoveredEquivalencyId = null;

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar Lucide
  lucide.createIcons();

  // Cargar desde localStorage o usar valores predeterminados
  const saved = localStorage.getItem("positive_attritions_draft");
  if (saved) {
    equivalencies = JSON.parse(saved);
    // Asegurar que las equivalencias automáticas siempre estén presentes en el borrador
    PREDEFINED_EQUIVALENCIES.forEach(autoEq => {
      if (!equivalencies.some(e => e.id === autoEq.id)) {
        equivalencies.push(autoEq);
      }
    });
  } else {
    equivalencies = [...PREDEFINED_EQUIVALENCIES];
    localStorage.setItem("positive_attritions_draft", JSON.stringify(equivalencies));
  }

  // Elementos del DOM
  const oldContainer = document.getElementById("old-courses-container");
  const newContainer = document.getElementById("new-courses-container");
  const orphanedContainer = document.getElementById("orphaned-list-container");
  const orphanedSection = document.getElementById("orphaned-section");

  const btnLink = document.getElementById("btn-link-courses");
  const btnLinkMobile = document.getElementById("btn-link-courses-mobile");
  const linkRatioIndicator = document.getElementById("link-ratio-indicator");
  const mobileRatioTitle = document.getElementById("mobile-ratio-title");
  const mobileRatioDesc = document.getElementById("mobile-ratio-desc");

  const justificationModal = document.getElementById("justification-modal");
  const txtJustification = document.getElementById("justification-textarea");
  const btnConfirmModal = document.getElementById("btn-confirm-modal");
  const btnCancelModal = document.getElementById("btn-cancel-modal");
  const btnCloseModal = document.getElementById("btn-close-modal");

  // Helper para guardar cambios
  function saveDraft() {
    localStorage.setItem("positive_attritions_draft", JSON.stringify(equivalencies));
    updateCreditsBanner();
  }

  // Actualizar el banner de créditos
  function updateCreditsBanner() {
    let automaticCredits = 0;
    let manualCredits = 0;

    equivalencies.forEach(eq => {
      const target = MOCK_COURSES_NEW.find(c => c.id === eq.targetId);
      if (target) {
        if (eq.automatic) {
          automaticCredits += target.credits;
        } else {
          manualCredits += target.credits;
        }
      }
    });

    document.getElementById("auto-credits-val").textContent = `${automaticCredits} Cr.`;
    
    const manualPill = document.getElementById("manual-credits-pill");
    if (manualCredits > 0) {
      manualPill.style.display = "flex";
      document.getElementById("manual-credits-val").textContent = `+${manualCredits} Cr.`;
    } else {
      manualPill.style.display = "none";
    }

    document.getElementById("total-credits-val").textContent = `${automaticCredits + manualCredits} Cr.`;
  }

  // Verificar si un curso ya está mapeado
  function isCourseMapped(id, side) {
    if (side === 'old') {
      return equivalencies.some(e => e.sourceIds.includes(id));
    } else {
      return equivalencies.some(e => e.targetId === id);
    }
  }

  // Renderizar la lista de cursos
  function renderCourses() {
    // 1. Cursos antiguos (Plan 2018)
    oldContainer.innerHTML = "";
    MOCK_COURSES_OLD.forEach(course => {
      const isSelected = selectedSourceIds.includes(course.id);
      const isMapped = isCourseMapped(course.id, 'old');
      
      // Determinar el resaltado
      let isHighlighted = false;
      if (hoveredEquivalencyId) {
        const eq = equivalencies.find(e => e.id === hoveredEquivalencyId);
        if (eq && eq.sourceIds.includes(course.id)) {
          isHighlighted = true;
        }
      }

      const card = document.createElement("div");
      card.className = `course-card ${isSelected ? 'selected' : ''} ${isMapped ? 'mapped old-mapped' : ''} ${isHighlighted ? 'highlighted' : ''}`;
      card.dataset.id = course.id;

      card.innerHTML = `
        <div class="card-top">
          <div class="card-info">
            <div class="card-badges">
              <span class="badge-code old-code">${course.code}</span>
              ${course.grade ? `<span class="badge-grade">Nota: ${course.grade}</span>` : ''}
            </div>
            <h4 class="card-title">${course.name}</h4>
            <p class="card-credits">${course.credits} créditos</p>
          </div>
          <div class="card-check"></div>
        </div>
      `;

      // Escuchas de eventos
      card.addEventListener("click", () => handleOldSelect(course.id));
      card.addEventListener("mouseenter", () => handleHoverEquivalency(course.id, 'old'));
      card.addEventListener("mouseleave", () => handleLeaveEquivalency());

      oldContainer.appendChild(card);
    });

    // 2. Cursos nuevos (Plan 2024)
    newContainer.innerHTML = "";
    MOCK_COURSES_NEW.forEach(course => {
      const isSelected = selectedTargetId === course.id;
      const isMapped = isCourseMapped(course.id, 'new');

      let isHighlighted = false;
      if (hoveredEquivalencyId) {
        const eq = equivalencies.find(e => e.id === hoveredEquivalencyId);
        if (eq && eq.targetId === course.id) {
          isHighlighted = true;
        }
      }

      // Buscar cursos de origen vinculados a este destino
      const eq = equivalencies.find(e => e.targetId === course.id);
      let mappingsHtml = "";
      if (isMapped && eq) {
        const sources = MOCK_COURSES_OLD.filter(c => eq.sourceIds.includes(c.id));
        mappingsHtml = `
          <div class="card-mappings">
            <p class="mappings-title">Convalidado por:</p>
            ${sources.map(s => `
              <div class="mapped-item">
                <span>${s.name}</span>
                <span class="mapped-item-check">✓</span>
              </div>
            `).join("")}
            ${!eq.automatic ? `<button class="btn-remove-mapping" data-eq-id="${eq.id}">Remover vínculo</button>` : ''}
          </div>
        `;
      }

      const card = document.createElement("div");
      card.className = `course-card ${isSelected ? 'selected' : ''} ${isMapped ? 'mapped new-mapped' : ''} ${isHighlighted ? 'highlighted' : ''}`;
      card.dataset.id = course.id;

      card.innerHTML = `
        <div class="card-top">
          <div class="card-info">
            <div class="card-badges">
              <span class="badge-code new-code">${course.code}</span>
            </div>
            <h4 class="card-title">${course.name}</h4>
            <p class="card-credits">${course.credits} créditos</p>
          </div>
          <div class="card-check"></div>
        </div>
        ${mappingsHtml}
      `;

      card.addEventListener("click", (e) => {
        // Evitar que se dispare si hacen clic en "Remover vínculo"
        if (e.target.classList.contains("btn-remove-mapping")) {
          const eqId = e.target.dataset.eqId;
          removeEquivalency(eqId);
          return;
        }
        handleNewSelect(course.id);
      });
      card.addEventListener("mouseenter", () => handleHoverEquivalency(course.id, 'new'));
      card.addEventListener("mouseleave", () => handleLeaveEquivalency());

      newContainer.appendChild(card);
    });

    // 3. Cursos huérfanos
    const orphaned = MOCK_COURSES_OLD.filter(c => !isCourseMapped(c.id, 'old'));
    if (orphaned.length > 0) {
      orphanedSection.style.display = "block";
      orphanedContainer.innerHTML = "";
      orphaned.forEach(course => {
        const item = document.createElement("div");
        item.className = "orphaned-card";
        item.innerHTML = `
          <span>${course.code} - ${course.name}</span>
          <span><strong>${course.credits} Cr.</strong></span>
        `;
        orphanedContainer.appendChild(item);
      });
    } else {
      orphanedSection.style.display = "none";
    }

    // Actualizar iconos
    lucide.createIcons();
    updateActionButtons();
  }

  // Vinculación de hover y estados visuales
  function handleHoverEquivalency(id, side) {
    let eq;
    if (side === 'old') {
      eq = equivalencies.find(e => e.sourceIds.includes(id));
    } else {
      eq = equivalencies.find(e => e.targetId === id);
    }
    if (eq) {
      hoveredEquivalencyId = eq.id;
      // Volver a renderizar para mostrar los estados de hover
      // Se agregan clases manualmente en lugar de re-renderizar todo por rendimiento
      document.querySelectorAll(".course-card").forEach(card => {
        const cardId = card.dataset.id;
        if (card.classList.contains("old-mapped")) {
          if (eq.sourceIds.includes(cardId)) card.classList.add("highlighted");
        } else if (card.classList.contains("new-mapped")) {
          if (eq.targetId === cardId) card.classList.add("highlighted");
        }
      });
    }
  }

  function handleLeaveEquivalency() {
    hoveredEquivalencyId = null;
    document.querySelectorAll(".course-card").forEach(card => {
      card.classList.remove("highlighted");
    });
  }

  // Manejadores de selección
  function handleOldSelect(id) {
    if (isCourseMapped(id, 'old')) return; // Ya está vinculado

    if (selectedSourceIds.includes(id)) {
      selectedSourceIds = selectedSourceIds.filter(i => i !== id);
    } else {
      selectedSourceIds.push(id);
    }
    renderCourses();
  }

  function handleNewSelect(id) {
    if (isCourseMapped(id, 'new')) return; // Ya está vinculado

    if (selectedTargetId === id) {
      selectedTargetId = null;
    } else {
      selectedTargetId = id;
    }
    renderCourses();
  }

  // Gestión del estado de los botones de acción
  function updateActionButtons() {
    const active = selectedSourceIds.length > 0 && selectedTargetId !== null;

    if (active) {
      btnLink.classList.remove("disabled");
      btnLink.removeAttribute("disabled");
      btnLinkMobile.classList.remove("disabled");
      btnLinkMobile.removeAttribute("disabled");

      linkRatioIndicator.textContent = "¡Listo! Pulsa para agregar.";
      mobileRatioTitle.textContent = "¡Listo para vincular!";
      mobileRatioDesc.textContent = `${selectedSourceIds.length} origen → 1 destino`;
    } else {
      btnLink.classList.add("disabled");
      btnLink.setAttribute("disabled", "true");
      btnLinkMobile.classList.add("disabled");
      btnLinkMobile.setAttribute("disabled", "true");

      linkRatioIndicator.textContent = "Selecciona un curso de cada plan";
      mobileRatioTitle.textContent = "Selecciona cursos para vincular";
      mobileRatioDesc.textContent = `${selectedSourceIds.length} origen → ${selectedTargetId ? '1' : '0'} destino`;
    }
  }

  // Crear una equivalencia manual
  function removeEquivalency(id) {
    const eq = equivalencies.find(e => e.id === id);
    if (eq && eq.automatic) {
      alert("No puedes eliminar convalidaciones automáticas");
      return;
    }
    equivalencies = equivalencies.filter(e => e.id !== id);
    saveDraft();
    renderCourses();
  }

  function handleOpenLinkModal() {
    if (selectedSourceIds.length === 0 || !selectedTargetId) return;

    // Verificar si ya está mapeado (validación adicional)
    if (equivalencies.some(e => e.targetId === selectedTargetId)) {
      alert("Este curso ya tiene una convalidación asignada");
      return;
    }

    txtJustification.value = "";
    justificationModal.showModal();
  }

  function handleConfirmLink() {
    const text = txtJustification.value.trim();
    if (!text) {
      alert("Por favor ingresa una justificación");
      return;
    }

    const newEquiv = {
      id: `manual-${Date.now()}`,
      sourceIds: [...selectedSourceIds],
      targetId: selectedTargetId,
      type: selectedSourceIds.length > 1 ? 'and' : 'direct',
      automatic: false,
      justification: text,
      adminStatus: 'pending'
    };

    equivalencies.push(newEquiv);
    selectedSourceIds = [];
    selectedTargetId = null;

    saveDraft();
    justificationModal.close();
    renderCourses();
  }

  // Acciones de los botones de enlace
  btnLink.addEventListener("click", handleOpenLinkModal);
  btnLinkMobile.addEventListener("click", handleOpenLinkModal);

  // Acciones del modal
  btnConfirmModal.addEventListener("click", handleConfirmLink);
  btnCancelModal.addEventListener("click", () => justificationModal.close());
  btnCloseModal.addEventListener("click", () => justificationModal.close());

  // Inicializar la vista
  renderCourses();
  updateCreditsBanner();
});
