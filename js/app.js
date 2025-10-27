const STORAGE_KEY = "data_json";

let state = { filtroApellido: "", modo: "crear", editId: null };

const $tbody = document.getElementById("tbodyConsultas");
const $status = document.getElementById("statusArea");
const $filtro = document.getElementById("filtroApellido");
const $btnNueva = document.getElementById("btnNueva");
const $btnLimpiarFiltro = document.getElementById("btnLimpiarFiltro");

// Modal Bootstrap
const modalConsulta = new bootstrap.Modal(
  document.getElementById("modalConsulta")
);
const $form = document.getElementById("formConsulta");
const $modalTitle = document.getElementById("modalTitle");
const $modalMsg = document.getElementById("modalMsg");

// Campos
const $campoId = document.getElementById("campoId");
const $campoNombre = document.getElementById("campoNombre");
const $campoApellidoPaterno = document.getElementById("campoApellidoPaterno");
const $campoApellidoMaterno = document.getElementById("campoApellidoMaterno");
const $campoFecha = document.getElementById("campoFecha");
const $campoTelefono = document.getElementById("campoTelefono");
const $campoEdad = document.getElementById("campoEdad");
const $campoSintomas = document.getElementById("campoSintomas");

function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { consultas: [] };
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function nextId(list) {
  return list.length ? Math.max(...list.map((c) => c.id)) + 1 : 1;
}

function renderTabla() {
  const { consultas } = loadData();
  const filtro = state.filtroApellido.trim().toLowerCase();
  const lista = filtro
    ? consultas.filter((c) => (c.apellidoPaterno || "").toLowerCase().includes(filtro))
    : consultas;

  $tbody.innerHTML = "";
  if (!lista.length) {
    $tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">Sin datos</td></tr>`;
    return;
  }

  lista.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.nombre ?? ""}</td>
      <td>${c.apellidoPaterno ?? ""}</td>
      <td>${c.apellidoMaterno ?? ""}</td>
      <td>${c.fecha ?? ""}</td>
      <td>${c.telefono ?? ""}</td>
      <td>${c.edad ?? ""}</td>
      <td>${c.sintomas ?? ""}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">Acciones</button>
          <ul class="dropdown-menu">
            <li><button class="dropdown-item" onclick="editar(${c.id})">✏️ Editar</button></li>
            <li><button class="dropdown-item text-danger" onclick="eliminar(${c.id})">🗑️ Eliminar</button></li>
          </ul>
        </div>
      </td>`;
    $tbody.appendChild(tr);
  });
}

function upsert(ev) {
  ev.preventDefault();
  const data = loadData();

  const payload = {
    nombre: $campoNombre.value.trim(),
    apellidoPaterno: $campoApellidoPaterno.value.trim(),
    apellidoMaterno: $campoApellidoMaterno.value.trim(),
    fecha: $campoFecha.value,
    telefono: $campoTelefono.value.trim(),
    edad: $campoEdad.value ? Number($campoEdad.value) : null,
    sintomas: $campoSintomas.value.trim(),
  };

  // Validación
  if (!payload.nombre || !payload.apellidoPaterno || !payload.fecha) {
    Swal.fire({
      icon: "warning",
      title: "Faltan datos",
      text: "Nombre, Apellido Paterno y Fecha son obligatorios.",
      confirmButtonText: "Entendido",
    });
    return;
  }

  let fueEdicion = false;

  if (state.modo === "crear") {
    payload.id = nextId(data.consultas);
    data.consultas.push(payload);
  } else {
    const idx = data.consultas.findIndex((c) => c.id === state.editId);
    if (idx !== -1) {
      data.consultas[idx] = { id: state.editId, ...payload };
      fueEdicion = true;
    }
  }

  saveData(data);
  renderTabla();
  modalConsulta.hide();

  setTimeout(() => {
    Swal.fire({
      icon: "success",
      title: fueEdicion ? "Cambios guardados" : "Guardado con éxito",
      text: fueEdicion
        ? `La consulta #${state.editId} se actualizó correctamente.`
        : "Tu registro se guardó correctamente.",
      timer: 1500,
      showConfirmButton: false,
    });
  }, 150);
}

function editar(id) {
  const data = loadData();
  const item = data.consultas.find((c) => c.id === id);
  if (!item) return;

  state.modo = "editar";
  state.editId = id;

  $modalTitle.textContent = `Editar consulta #${id}`;
  $campoId.value = id;
  $campoNombre.value = item.nombre ?? "";
  $campoApellidoPaterno.value = item.apellidoPaterno ?? "";
  $campoApellidoMaterno.value = item.apellidoMaterno ?? "";
  $campoFecha.value = item.fecha ?? "";
  $campoTelefono.value = item.telefono ?? "";
  $campoEdad.value = item.edad ?? "";
  $campoSintomas.value = item.sintomas ?? "";

  modalConsulta.show();
}

function eliminar(id) {
  const data = loadData();
  const item = data.consultas.find((c) => c.id === id);
  if (!item) return;

  const nombreCompleto = `${item.nombre ?? ""} ${item.apellidoPaterno ?? ""} ${item.apellidoMaterno ?? ""}`.trim();

  Swal.fire({
    title: `¿Eliminar registro ${nombreCompleto}?`,
    html: `<p>Esta acción no se puede deshacer.</p>`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    confirmButtonColor: "#d33",
  }).then((result) => {
    if (result.isConfirmed) {
      const data2 = loadData(); // re-lee por si hubo cambios
      data2.consultas = data2.consultas.filter((c) => c.id !== id);
      saveData(data2);
      renderTabla();

      Swal.fire({
        icon: "success",
        title: "Eliminado",
        html: `<p>El registro de <strong>${nombreCompleto}</strong> fue eliminado correctamente.</p>`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
}

/* -------------------------- Eventos (sin Consultar) -------------------------- */
$btnNueva?.addEventListener("click", () => {
  state.modo = "crear";
  state.editId = null;
  $form.reset();
  $modalTitle.textContent = "Nueva consulta";
  modalConsulta.show();
});

$btnLimpiarFiltro?.addEventListener("click", () => {
  $filtro.value = "";
  state.filtroApellido = "";
  renderTabla();
});

$filtro?.addEventListener("input", () => {
  state.filtroApellido = $filtro.value;
  renderTabla();
});

$form?.addEventListener("submit", upsert);

// Render inicial garantizado
window.addEventListener("DOMContentLoaded", renderTabla);

// Si usas los onclick inline del menú:
window.editar = editar;
window.eliminar = eliminar;
