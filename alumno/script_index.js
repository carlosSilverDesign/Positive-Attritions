document.addEventListener("DOMContentLoaded", () => {
  // Inicializar los iconos de Lucide
  lucide.createIcons();

  // Detectar recarga dinámica con F5 usando performance APIs para reiniciar el mockup
  const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";
  if (isReload) {
    localStorage.removeItem("positive_attritions_pending");
    localStorage.removeItem("positive_attritions_draft");
    localStorage.removeItem("admin_status_app-1");
  }

  const historyContentArea = document.getElementById("history-content-area");
  const actionContainer = document.getElementById("action-container");

  // Leer el estado de la solicitud desde localStorage
  const isPending = localStorage.getItem("positive_attritions_pending") === "true";
  const adminStatus = localStorage.getItem("admin_status_app-1");

  if (isPending || adminStatus) {
    // Ocultar el botón de "Iniciar solicitud" de la sección de bienvenida si está pendiente o resuelta
    if (adminStatus !== "approved" && adminStatus !== "rejected") {
      actionContainer.innerHTML = "";
    }

    // Construir el estado y la clase según las variables
    let badgeClass = "badge-pending";
    let statusLabel = "Pendiente de Revisión";
    let adminText = "Coordinador: Lic. Ricardo Montes";

    if (adminStatus === "approved") {
      badgeClass = "badge-approved";
      statusLabel = "Aprobada";
      adminText = "Aprobado por: Lic. Ricardo Montes";
    } else if (adminStatus === "rejected") {
      badgeClass = "badge-rejected";
      statusLabel = "Rechazada";
      adminText = "Rechazado por: Lic. Ricardo Montes";
    }

    // Renderizar la solicitud activa
    historyContentArea.innerHTML = `
      <div class="pending-card">
        <div class="pending-left">
          <div class="pending-icon-container">
            <i data-lucide="clock"></i>
          </div>
          <div>
            <h3 class="pending-title">Adecuación Curricular - Plan 2024-I</h3>
            <p class="pending-desc">Enviado el 02 de Julio, 2026</p>
          </div>
        </div>
        <div class="pending-right">
          <span class="${badgeClass}">${statusLabel}</span>
          <p class="reviewer-text">${adminText}</p>
        </div>
      </div>
    `;
    
    // Volver a renderizar los iconos de los elementos dinámicos
    lucide.createIcons();
  }
});
