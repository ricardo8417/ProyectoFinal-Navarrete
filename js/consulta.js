// consulta.js
// Lee ../data/consulta.json y lo muestra en un modal con tabla al dar click en "Consultar"

const JSON_URL_CONSULTA = "../data/consulta.json";

// Referencias al botón y al modal de datos
const $btnConsultar = document.getElementById("btnConsultar");

// Crea (o toma) el modal de datos
let modalDatos;

// Si ya existe en el HTML un modal con id="modalDatos", lo usamos.
// Si no existe, lo inyectamos dinámicamente.
(function ensureModalDatos() {
  let modalEl = document.getElementById("modalDatos");
  if (!modalEl) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="modal fade" id="modalDatos" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Consultas desde consulta.json</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <div class="table-responsive">
                <table class="table table-sm table-striped align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Apellido P.</th>
                      <th>Apellido M.</th>
                      <th>Fecha</th>
                      <th>Teléfono</th>
                      <th>Edad</th>
                      <th>Síntomas</th>
                    </tr>
                  </thead>
                  <tbody id="tbodyJson"></tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrapper.firstElementChild);
    modalEl = document.getElementById("modalDatos");
  }
  modalDatos = new bootstrap.Modal(modalEl);
})();

const $tbodyJson = document.getElementById("tbodyJson");

// Función para consultar el JSON y renderizar en el modal
async function consultarDesdeJson() {
  try {
    const res = await fetch(JSON_URL_CONSULTA, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const lista = Array.isArray(json.consultas) ? json.consultas : [];

    // Pintar filas
    $tbodyJson.innerHTML = "";
    if (!lista.length) {
      $tbodyJson.innerHTML = `
        <tr>
          <td colspan="8" class="text-center text-muted">Sin datos en consulta.json</td>
        </tr>`;
    } else {
      $tbodyJson.innerHTML = lista
        .map(
          (c) => `
        <tr>
          <td>${c.id ?? ""}</td>
          <td>${c.nombre ?? ""}</td>
          <td>${c.apellidoPaterno ?? ""}</td>
          <td>${c.apellidoMaterno ?? ""}</td>
          <td>${c.fecha ?? ""}</td>
          <td>${c.telefono ?? ""}</td>
          <td>${c.edad ?? ""}</td>
          <td>${c.sintomas ?? ""}</td>
        </tr>`
        )
        .join("");
    }

    // Mostrar modal
    modalDatos.show();
  } catch (err) {
    // Si usas SweetAlert2:
    if (window.Swal) {
      Swal.fire({
        icon: "error",
        title: "No se pudo leer consulta.json",
        text:
          err?.message ||
          "Verifica la ruta y que sirves el proyecto por http(s).",
      });
    } else {
      alert("Error al leer consulta.json: " + (err?.message || ""));
    }
  }
}

// Asociar el click del botón a la consulta
if ($btnConsultar) {
  $btnConsultar.addEventListener("click", consultarDesdeJson);
}
