document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Detect dynamic F5 / Reload using performance APIs to reset mockup
  const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";
  if (isReload) {
    localStorage.removeItem("positive_attritions_pending");
    localStorage.removeItem("positive_attritions_draft");
    localStorage.removeItem("admin_status_app-1");
  }

  const historyContentArea = document.getElementById("history-content-area");
  const actionContainer = document.getElementById("action-container");

  // Read application status from localStorage
  const isPending = localStorage.getItem("positive_attritions_pending") === "true";
  const adminStatus = localStorage.getItem("admin_status_app-1");

  if (isPending || adminStatus) {
    // Hide the 'Start Application' button from the welcome section if it's pending or resolved
    if (adminStatus !== "approved" && adminStatus !== "rejected") {
      actionContainer.innerHTML = "";
    }

    // Build the status and class based on variables
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

    // Render the active application
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
    
    // Re-trigger icon rendering for the dynamic elements
    lucide.createIcons();
  }
});
