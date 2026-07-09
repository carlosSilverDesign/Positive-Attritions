const INITIAL_APPLICATIONS = [
  { id: 'app-1', student: 'Juan Pérez García', code: '202010123', date: '17/06/2026', plan: 'Plan 2018-II → 2024-I', status: 'pending', observations: 2 },
  { id: 'app-2', student: 'María Rodríguez', code: '201920456', date: '16/06/2026', plan: 'Plan 2017-I → 2024-I', status: 'review', observations: 0 },
  { id: 'app-3', student: 'Carlos Sosa', code: '202110789', date: '15/06/2026', plan: 'Plan 2018-II → 2024-I', status: 'pending', observations: 1 },
  { id: 'app-4', student: 'Ana Belén', code: '201810111', date: '14/06/2026', plan: 'Plan 2015-II → 2024-I', status: 'approved', observations: 3 },
  { id: 'app-5', student: 'Diego Armando', code: '202210222', date: '13/06/2026', plan: 'Plan 2018-II → 2024-I', status: 'rejected', observations: 0 },
];

document.addEventListener("DOMContentLoaded", () => {
  // Init Lucide
  lucide.createIcons();

  const tableBody = document.getElementById("queue-table-body");
  const searchInput = document.getElementById("table-search");

  // Read current student states from localStorage
  const isPending = localStorage.getItem("positive_attritions_pending") === "true";
  const savedStatus = localStorage.getItem("admin_status_app-1");

  // Build the live applications array
  let applications = [...INITIAL_APPLICATIONS];
  
  // Update Juan Pérez application status based on localStorage
  applications = applications.map(app => {
    if (app.id === 'app-1') {
      if (savedStatus) {
        return { ...app, status: savedStatus };
      } else if (isPending) {
        return { ...app, status: 'pending' };
      } else {
        // Not submitted yet by student in index dashboard
        return { ...app, status: 'review' }; // Simulates draft/under review state
      }
    }
    return app;
  });

  // Render Table
  function renderTable(filterText = "") {
    tableBody.innerHTML = "";
    
    const filtered = applications.filter(app => {
      const term = filterText.toLowerCase();
      return (
        app.student.toLowerCase().includes(term) ||
        app.code.toLowerCase().includes(term) ||
        app.plan.toLowerCase().includes(term)
      );
    });

    document.getElementById("table-showing-text").textContent = `Mostrando ${filtered.length} de ${applications.length} solicitudes`;

    filtered.forEach(app => {
      const tr = document.createElement("tr");

      // Badge generation
      let badgeHtml = "";
      switch (app.status) {
        case 'pending':
          badgeHtml = `<span class="status-badge status-pending"><i data-lucide="clock"></i><span>Pendiente</span></span>`;
          break;
        case 'review':
          badgeHtml = `<span class="status-badge status-review"><i data-lucide="file-text"></i><span>En Revisión</span></span>`;
          break;
        case 'approved':
          badgeHtml = `<span class="status-badge status-approved"><i data-lucide="check-circle"></i><span>Aprobada</span></span>`;
          break;
        case 'rejected':
          badgeHtml = `<span class="status-badge status-rejected"><i data-lucide="alert-triangle"></i><span>Rechazada</span></span>`;
          break;
      }

      tr.innerHTML = `
        <td>
          <div class="student-cell">
            <div class="student-avatar">${app.student.charAt(0)}</div>
            <div>
              <p class="student-name">${app.student}</p>
              <p class="student-code">ID: ${app.code}</p>
            </div>
          </div>
        </td>
        <td class="cell-text-bold">${app.plan}</td>
        <td class="cell-text-muted">${app.date}</td>
        <td class="text-center">
          ${app.observations > 0 ? `
            <span class="badge-orange-alert">
              <i data-lucide="alert-triangle"></i>
              <span>${app.observations}</span>
            </span>
          ` : '<span class="cell-text-muted">0</span>'}
        </td>
        <td>${badgeHtml}</td>
        <td class="text-right">
          <a href="review.html?id=${app.id}" class="btn-table-action">
            <i data-lucide="eye"></i>
            <span>Revisar</span>
          </a>
          <button class="btn-icon-only">
            <i data-lucide="more-vertical"></i>
          </button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Re-render icons
    lucide.createIcons();
  }

  // Bind search event
  searchInput.addEventListener("input", (e) => {
    renderTable(e.target.value);
  });

  renderTable();
});
