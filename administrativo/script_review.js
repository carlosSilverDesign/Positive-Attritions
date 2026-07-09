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

// In a real scenario, this screen would parse location.search to find ?id=app-1
const urlParams = new URLSearchParams(window.location.search);
const appId = urlParams.get('id') || 'app-1';

// Initial state of equivalencies to show
let reviewEquivalencies = [];

document.addEventListener("DOMContentLoaded", () => {
  // Init Lucide
  lucide.createIcons();

  // Populate data
  document.getElementById("header-app-id").textContent = appId;
  
  // Set up resolving list. If there is a manual application draft from student in localStorage, load it.
  const savedStudentDraft = localStorage.getItem("positive_attritions_draft");
  const isStudentPending = localStorage.getItem("positive_attritions_pending") === "true";

  if (appId === 'app-1' && isStudentPending && savedStudentDraft) {
    // If student sent custom manual equivalencies, show them
    reviewEquivalencies = JSON.parse(savedStudentDraft);
  } else {
    // Fallback default setup mimicking React app's default manual review setup
    reviewEquivalencies = [
      ...PREDEFINED_EQUIVALENCIES,
      {
        id: 'manual-1',
        sourceIds: ['o1', 'o7'],
        targetId: 'n4', // maps to Contabilidad de Gestión or similar
        type: 'and',
        automatic: false,
        justification: "El alumno aprobó Contabilidad Básica y Mate 1, lo que fundamenta el razonamiento financiero necesario para Contabilidad de Gestión.",
        adminStatus: 'pending'
      }
    ];
  }

  const listContainer = document.getElementById("equivalencies-list");
  const commentsTextarea = document.getElementById("global-comments");

  // Aproved/Reject event listeners for manual ones
  function handleResolve(equivId, status) {
    reviewEquivalencies = reviewEquivalencies.map(e => {
      if (e.id === equivId) {
        return { ...e, adminStatus: status };
      }
      return e;
    });
    renderEquivalencies();
  }

  function renderEquivalencies() {
    listContainer.innerHTML = "";
    document.getElementById("equivalencies-count-badge").textContent = `${reviewEquivalencies.length} equivalencias`;

    reviewEquivalencies.forEach(eq => {
      const target = MOCK_COURSES_NEW.find(c => c.id === eq.targetId);
      const sources = MOCK_COURSES_OLD.filter(c => eq.sourceIds.includes(c.id));

      const box = document.createElement("div");
      box.className = "equiv-item-box";

      const tagClass = eq.automatic ? "tag-primary" : "tag-orange";
      const tagText = eq.automatic ? "Convalidación Directa" : "Observada por Alumno";

      let rightColumnHtml = "";
      if (eq.automatic) {
        rightColumnHtml = `
          <div class="status-preapproved-badge">
            <i data-lucide="check-circle"></i>
            <span>Pre-Aprobado</span>
          </div>
        `;
      } else {
        const isApproveActive = eq.adminStatus === 'approved' ? 'active' : '';
        const isRejectActive = eq.adminStatus === 'rejected' ? 'active' : '';

        rightColumnHtml = `
          <div class="btn-group-row">
            <button class="btn-action-resolve reject ${isRejectActive}" data-status="rejected">
              <i data-lucide="x-circle"></i>
              <span>Rechazar</span>
            </button>
            <button class="btn-action-resolve approve ${isApproveActive}" data-status="approved">
              <i data-lucide="check-circle-2"></i>
              <span>Aprobar</span>
            </button>
          </div>
          <textarea placeholder="Comentario de resolución..." class="comment-textarea" data-comment-id="${eq.id}">${eq.adminComment || ''}</textarea>
        `;
      }

      box.innerHTML = `
        <div class="equiv-row-layout">
          <div class="equiv-info-column">
            
            <div class="tag-badge-row">
              <span class="tag-label ${tagClass}">${tagText}</span>
              ${eq.automatic ? `
                <span class="status-system-label">
                  <i data-lucide="check-circle"></i>
                  <span>Validado por Sistema</span>
                </span>
              ` : ''}
            </div>

            <div class="mapping-visual-card">
              <div class="source-courses-side">
                ${sources.map(s => `
                  <div class="visual-course-row">
                    <span>${s.code} - ${s.name}</span>
                    <span class="visual-course-credits">${s.credits} Cr.</span>
                  </div>
                `).join("")}
              </div>
              <div class="arrow-icon-side">
                <i data-lucide="arrow-right"></i>
              </div>
              <div class="target-course-side">
                <p class="target-course-code">${target ? target.code : ''} - ${target ? target.name : ''}</p>
                <p class="target-course-credits">${target ? target.credits : 0} CRÉDITOS</p>
              </div>
            </div>

            ${!eq.automatic ? `
              <div class="student-message-box">
                <i data-lucide="message-square"></i>
                <div class="student-message-text">
                  <strong>Motivo del alumno:</strong>
                  <p>"${eq.justification}"</p>
                </div>
              </div>
            ` : ''}

          </div>

          <div class="resolving-actions-column" data-eq-id="${eq.id}">
            ${rightColumnHtml}
          </div>
        </div>
      `;

      // Bind resolve action click events
      if (!eq.automatic) {
        box.querySelector(".btn-action-resolve.reject").addEventListener("click", () => {
          handleResolve(eq.id, 'rejected');
        });
        box.querySelector(".btn-action-resolve.approve").addEventListener("click", () => {
          handleResolve(eq.id, 'approved');
        });
        box.querySelector(".comment-textarea").addEventListener("input", (e) => {
          eq.adminComment = e.target.value;
        });
      }

      listContainer.appendChild(box);
    });

    // Re-render Lucide icons
    lucide.createIcons();
  }

  // Submit resolution handler
  function submitResolution(status) {
    if (status === 'rejected' && !commentsTextarea.value.trim()) {
      alert("Debes incluir un comentario global para el rechazo");
      return;
    }

    const buttonName = status === 'approved' ? 'Aprobando...' : 'Rechazando...';
    
    // Save status
    localStorage.setItem(`admin_status_${appId}`, status);
    
    // If it's resolved, remove the global pending flag from student view
    localStorage.removeItem("positive_attritions_pending");

    alert(`Solicitud ${status === 'approved' ? 'Aprobada' : 'Rechazada'} con éxito`);
    window.location.href = "index.html";
  }

  // Header and Sidebar Action Button bindings
  document.getElementById("btn-reject-application").addEventListener("click", () => {
    submitResolution('rejected');
  });

  document.getElementById("btn-approve-application").addEventListener("click", () => {
    submitResolution('approved');
  });

  document.getElementById("btn-approve-sidebar").addEventListener("click", () => {
    submitResolution('approved');
  });

  renderEquivalencies();
});
