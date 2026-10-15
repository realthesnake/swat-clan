const URL_DB = 'https://script.google.com/macros/s/AKfycbz_yFVinsl7CFviaed7BOehym5ZV5C6rh7gBhlCF2GpqoKzpAaxrxnrIMGDhNv5fpwo/exec';

const WEBHOOK_POR_DEFECTO = 'https://discord.com/api/webhooks/1559796964877406279/FpnjOqcJsvbbWaVdaUR22eNUtd_0tblVRGxKPJThPMyrdrGTTjtBg-McAwirKzuXUDjC';

const IMAGEN_EMBED = 'https://media.discordapp.net/attachments/1335702701681545459/1559975810180456448/53622321-ed92-49e8-bef6-a5cc2ddabe2a_1.png?ex=6ad1b0f0&is=6ad05f70&hm=ec27e303be61a09eb2adf6301cb493003fdfee266e6a380cb4680338d1d4a62c&=&format=webp&quality=lossless&width=608&height=608';

const MULTIPLO_RECOMPENSA = 5;

const CLAVE_TOKEN = 'swat_token_acceso';

const consultar = (id) => document.getElementById(id);

const pantallaCarga = consultar('pantallaCarga');
const pantallaLogin = consultar('pantallaLogin');
const cargaProgreso = consultar('cargaProgreso');
const cargaTexto = consultar('cargaTexto');
const tokenAcceso = consultar('tokenAcceso');
const botonAcceder = consultar('botonAcceder');
const loginError = consultar('loginError');
const contenidoPrincipal = consultar('contenidoPrincipal');
const barraConexion = consultar('barraConexion');
const pestanasPrincipales = consultar('pestanasPrincipales');
const contenedorPrincipal = consultar('contenedorPrincipal');

const infoDia = consultar('infoDia');
const textoFechaHoy = consultar('textoFechaHoy');
const depositoInput = consultar('depositoCrudo');
const produccionInput = consultar('produccionEstimada');
const visualRendimiento = consultar('visualRendimiento');
const visualPerdida = consultar('visualPerdida');
const porcentajeRecolectorInput = consultar('porcentajeRecolector');
const porcentajeCamioneroInput = consultar('porcentajeCamionero');
const cuerpoTabla = consultar('cuerpoTabla');
const totalCrudo = consultar('totalCrudo');
const totalNeto = consultar('totalNeto');
const totalGasolina = consultar('totalGasolina');
const pendienteDia = consultar('pendienteDia');
const entregadoDia = consultar('entregadoDia');
const contadorFilas = consultar('contadorFilas');

const estadoDeposito = consultar('estadoDeposito');
const estadoRefinado = consultar('estadoRefinado');
const estadoBase = consultar('estadoBase');

const cuerpoHistorial = consultar('cuerpoHistorial');
const historialVacio = consultar('historialVacio');
const filtroDesde = consultar('filtroDesde');
const filtroHasta = consultar('filtroHasta');
const filtroMiembro = consultar('filtroMiembro');
const filtroEstado = consultar('filtroEstado');
const barraPendientes = consultar('barraPendientes');
const infoPendientes = consultar('infoPendientes');

const cuerpoMiembros = consultar('cuerpoMiembros');
const nuevoMiembro = consultar('nuevoMiembro');
const nuevoMiembroRango = consultar('nuevoMiembroRango');
const contadorMiembros = consultar('contadorMiembros');
const barraMiembros = consultar('barraMiembros');
const infoMiembros = consultar('infoMiembros');

const modalOverlay = consultar('modalOverlay');
const vistaPreviaReporte = consultar('vistaPreviaReporte');
const entradaWebhook = consultar('entradaWebhook');
const entradaCsv = consultar('entradaCsv');
const notificacion = consultar('notificacion');

const estadoConexion = consultar('estadoConexion');
const detallesConexion = consultar('detallesConexion');

const modalConfirm = consultar('modalConfirm');
const tituloConfirm = consultar('tituloConfirm');
const mensajeConfirm = consultar('mensajeConfirm');
const subConfirm = consultar('subConfirm');
const entradaConfirm = consultar('entradaConfirm');
const botonAceptarConfirm = consultar('botonAceptarConfirm');
const botonCancelarConfirm = consultar('botonCancelarConfirm');
const botonCerrarConfirm = consultar('botonCerrarConfirm');

let datos = {
  filas: [],
  parametrosPorDia: {},
  estadoPorDia: {},
  porcentajes: { Recolector: 0, Camionero: 0 },
  porcentajesPorDia: {},
  webhook: WEBHOOK_POR_DEFECTO
};

let miembros = [];
let miembrosCopiaOriginal = [];
let cambiosPendientes = [];
let filasPendientesSheets = {};
let fechasFilasPendientes = new Set();
let fechasEstadoPendientes = new Set();
let estadoPendienteSheets = false;
let miembrosPendientesSheets = false;
let cambioSeq = 0;

let conexionEstado = 'iniciando';
let ultimaSync = null;
let sincronizando = false;
let confirmCallback = null;
let filtrosAplicados = { desde: '', hasta: '', miembro: '', estado: '' };
let cargando = false;
let tokenValido = false;

const botonesModal = ['botonRefrescarReporte', 'botonCopiarReporte', 'botonDescargarCsv', 'botonImportarCsv', 'botonEnviarDiscord', 'botonCerrarModal'];

function fechaHoy() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + dia;
}

function fechaHoyMostrar() {
  const d = new Date();
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return dia + '/' + mes + '/' + d.getFullYear();
}

function normalizarFecha(v) {
  if (v === null || v === undefined || v === '') return '';
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return '';
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  const s = String(v).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[1] + '-' + m[2] + '-' + m[3];
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const mo = String(parsed.getMonth() + 1).padStart(2, '0');
    const da = String(parsed.getDate()).padStart(2, '0');
    return y + '-' + mo + '-' + da;
  }
  return '';
}

function normalizarHora(v) {
  if (v === null || v === undefined || v === '') return '';
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return '';
    return String(v.getHours()).padStart(2, '0') + ':' + String(v.getMinutes()).padStart(2, '0');
  }
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  if (m) return String(m[1]).padStart(2, '0') + ':' + m[2];
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return String(parsed.getHours()).padStart(2, '0') + ':' + String(parsed.getMinutes()).padStart(2, '0');
  }
  return '';
}

function horaActual() {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function generarIdUnico() {
  return Date.now() * 100 + Math.floor(Math.random() * 100);
}

function numero(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function formatearNumero(v) {
  const n = numero(v);
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

function formatearLitros(v) {
  return formatearNumero(v) + ' L';
}

function formatearDecimal(v) {
  return Number(v).toFixed(2);
}

function redondearAbajo5(v) {
  const n = numero(v);
  if (n <= 0) return 0;
  return Math.floor(n / MULTIPLO_RECOMPENSA) * MULTIPLO_RECOMPENSA;
}

function escaparHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

function obtenerTokenGuardado() {
  return localStorage.getItem(CLAVE_TOKEN) || '';
}

function guardarToken(t) {
  localStorage.setItem(CLAVE_TOKEN, t);
}

function limpiarToken() {
  localStorage.removeItem(CLAVE_TOKEN);
}

function establecerCargando(v) {
  cargando = v;
  botonesModal.forEach((id) => {
    const el = consultar(id);
    if (el) el.disabled = v;
  });
}

function guardarPendientes(interno) {
  if (!interno) cambioSeq++;
  try {
    const obj = {
      filasPendientesSheets: filasPendientesSheets,
      fechasFilasPendientes: Array.from(fechasFilasPendientes),
      fechasEstadoPendientes: Array.from(fechasEstadoPendientes),
      estadoPendienteSheets: estadoPendienteSheets,
      miembrosPendientesSheets: miembrosPendientesSheets
    };
    localStorage.setItem('swat_pendientes', JSON.stringify(obj));
  } catch (e) { console.warn(e); }
}

function cargarPendientes() {
  const g = localStorage.getItem('swat_pendientes');
  if (!g) return;
  try {
    const o = JSON.parse(g);
    filasPendientesSheets = o.filasPendientesSheets || {};
    fechasFilasPendientes = new Set(o.fechasFilasPendientes || []);
    fechasEstadoPendientes = new Set(o.fechasEstadoPendientes || []);
    estadoPendienteSheets = !!o.estadoPendienteSheets;
    miembrosPendientesSheets = !!o.miembrosPendientesSheets;
  } catch (e) { console.warn(e); }
}

function obtenerParametrosDia(fecha, crear) {
  if (!datos.parametrosPorDia[fecha]) {
    if (!crear) return { deposito: 0, produccion: 0, _tocado: false };
    datos.parametrosPorDia[fecha] = { deposito: 0, produccion: 0, _tocado: false };
  }
  return datos.parametrosPorDia[fecha];
}

function obtenerEstadoDia(fecha) {
  if (!datos.estadoPorDia[fecha]) {
    datos.estadoPorDia[fecha] = { deposito: 0, refinado: 0, base: 0, hora: horaActual(), _tocado: false };
  }
  return datos.estadoPorDia[fecha];
}

function obtenerPorcentajesDia(fecha, crear) {
  if (!datos.porcentajesPorDia[fecha]) {
    if (!crear) return { Recolector: 0, Camionero: 0, _tocado: false };
    const esActual = fecha === fechaHoy();
    datos.porcentajesPorDia[fecha] = {
      Recolector: esActual ? numero(porcentajeRecolectorInput.value) : 0,
      Camionero: esActual ? numero(porcentajeCamioneroInput.value) : 0,
      _tocado: false
    };
  }
  return datos.porcentajesPorDia[fecha];
}

function calcularRendimientoDeDia(fecha) {
  const p = datos.parametrosPorDia[fecha];
  if (p && p.deposito > 0 && p.produccion > 0) {
    return Math.min((p.produccion / p.deposito) * 100, 100);
  }
  let sumB = 0, sumN = 0;
  filasDelDia(fecha).forEach((f) => {
    if (f._netoSheet !== undefined && f._netoSheet !== null && f._netoSheet !== '') {
      sumB += numero(f.bruto);
      sumN += numero(f._netoSheet);
    }
  });
  return sumB > 0 ? Math.min((sumN / sumB) * 100, 100) : 0;
}

function obtenerPorcentajeRango(rango, fecha) {
  const pd = datos.porcentajesPorDia[fecha];
  if (pd && (numero(pd.Recolector) > 0 || numero(pd.Camionero) > 0)) {
    return numero(rango === 'Recolector' ? pd.Recolector : pd.Camionero);
  }
  const f = filasDelDia(fecha).find((x) => x.rango === rango &&
    x._porcentajeSheet !== undefined && x._porcentajeSheet !== null && x._porcentajeSheet !== '');
  if (f) return numero(f._porcentajeSheet);
  return numero(rango === 'Recolector' ? datos.porcentajes.Recolector : datos.porcentajes.Camionero);
}

function netoFila(fila) {
  const rend = calcularRendimientoDeDia(fila.fecha);
  if (rend > 0) {
    return numero(fila.bruto) * (rend / 100);
  }
  if (fila._netoSheet !== undefined && fila._netoSheet !== null && fila._netoSheet !== '') {
    return numero(fila._netoSheet);
  }
  return 0;
}

function gasolinaFila(fila) {
  const rend = calcularRendimientoDeDia(fila.fecha);
  if (rend > 0) {
    const neto = numero(fila.bruto) * (rend / 100);
    const porc = obtenerPorcentajeRango(fila.rango, fila.fecha);
    return redondearAbajo5(neto * (porc / 100));
  }
  if (fila._gasolinaSheet !== undefined && fila._gasolinaSheet !== null && fila._gasolinaSheet !== '') {
    return numero(fila._gasolinaSheet);
  }
  return 0;
}

function porcentajeFila(fila) {
  const pd = datos.porcentajesPorDia[fila.fecha];
  if (pd && (numero(pd.Recolector) > 0 || numero(pd.Camionero) > 0)) {
    return numero(fila.rango === 'Recolector' ? pd.Recolector : pd.Camionero);
  }
  if (fila._porcentajeSheet !== undefined && fila._porcentajeSheet !== null && fila._porcentajeSheet !== '') {
    return numero(fila._porcentajeSheet);
  }
  return numero(fila.rango === 'Recolector' ? datos.porcentajes.Recolector : datos.porcentajes.Camionero);
}

function filasDelDia(fecha) {
  const fNorm = normalizarFecha(fecha);
  return datos.filas.filter((f) => normalizarFecha(f.fecha) === fNorm);
}

function sincronizarEstadoDesdeDom(fecha) {
  const e = obtenerEstadoDia(fecha);
  e.deposito = numero(estadoDeposito.value);
  e.refinado = numero(estadoRefinado.value);
  e.base = numero(estadoBase.value);
}

function sincronizarParametrosDesdeDom(fecha) {
  const dep = numero(depositoInput.value);
  const prod = numero(produccionInput.value);
  const rec = numero(porcentajeRecolectorInput.value);
  const cam = numero(porcentajeCamioneroInput.value);
  if (datos.parametrosPorDia[fecha] || dep > 0 || prod > 0) {
    const p = obtenerParametrosDia(fecha, true);
    p.deposito = dep; p.produccion = prod;
  }
  if (datos.porcentajesPorDia[fecha] || rec > 0 || cam > 0) {
    const pd = obtenerPorcentajesDia(fecha, true);
    pd.Recolector = rec; pd.Camionero = cam;
  }
  datos.porcentajes.Recolector = rec;
  datos.porcentajes.Camionero = cam;
}

function repararIdsDuplicados() {
  const vistos = {};
  const fechasAfectadas = new Set();
  datos.filas.forEach((f) => {
    let id = f.id;
    if (!id || vistos[String(id)]) {
      id = generarIdUnico();
      while (vistos[String(id)]) id++;
      f.id = id;
      fechasAfectadas.add(f.fecha);
    }
    vistos[String(id)] = true;
  });
  if (fechasAfectadas.size > 0) {
    fechasAfectadas.forEach((fe) => fechasFilasPendientes.add(fe));
    guardarPendientes();
  }
}

function sincronizarFilasDesdeDom(fecha) {
  const filasDiaDom = cuerpoTabla.querySelectorAll('tr[data-id]');
  filasDiaDom.forEach((tr) => {
    const id = parseInt(tr.dataset.id);
    const fila = datos.filas.find((f) => f.id === id);
    if (!fila) return;
    const inputBruto = tr.querySelector('.bruto-input');
    const inputHora = tr.querySelector('.hora-input');
    const selectNombre = tr.querySelector('.nombre-select');
    const selectRango = tr.querySelector('.rango-select');
    const check = tr.querySelector('.entregado-check');
    if (inputBruto) fila.bruto = numero(inputBruto.value);
    if (inputHora) fila.hora = inputHora.value;
    if (selectNombre) fila.nombre = selectNombre.value;
    if (selectRango) fila.rango = selectRango.value;
    if (check) {
      fila.entregado = check.checked;
      if (check.checked) {
        fila.fechaEntregado = fila.fechaEntregado || (fecha || fechaHoy());
      } else {
        fila.fechaEntregado = '';
      }
    }
  });
}

function mostrarConfirmacion(opciones) {
  tituloConfirm.textContent = opciones.titulo || 'Confirmar';
  mensajeConfirm.textContent = opciones.mensaje || '';
  subConfirm.textContent = opciones.sub || '';
  if (opciones.input) {
    entradaConfirm.style.display = 'block';
    entradaConfirm.placeholder = opciones.inputPlaceholder || '';
    entradaConfirm.value = opciones.inputDefault || '';
  } else {
    entradaConfirm.style.display = 'none';
    entradaConfirm.value = '';
  }
  confirmCallback = opciones.callback || null;
  modalConfirm.classList.add('activa');
  if (opciones.input) setTimeout(() => entradaConfirm.focus(), 100);
}

function cerrarConfirmacion() {
  modalConfirm.classList.remove('activa');
  confirmCallback = null;
}

botonAceptarConfirm.addEventListener('click', () => {
  const cb = confirmCallback;
  const valor = entradaConfirm.style.display !== 'none' ? entradaConfirm.value : null;
  cerrarConfirmacion();
  if (cb) cb(valor);
});
botonCancelarConfirm.addEventListener('click', cerrarConfirmacion);
botonCerrarConfirm.addEventListener('click', cerrarConfirmacion);
modalConfirm.addEventListener('click', (e) => { if (e.target === modalConfirm) cerrarConfirmacion(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalConfirm.classList.contains('activa')) cerrarConfirmacion();
});

function mostrarNotificacion(msg, tipo = 'info') {
  notificacion.textContent = msg;
  notificacion.className = 'notificacion ' + tipo;
  notificacion.classList.add('visible');
  setTimeout(() => notificacion.classList.remove('visible'), 3200);
}

function guardarDatos() { localStorage.setItem('swat_datos', JSON.stringify(datos)); }
function guardarMiembros() { localStorage.setItem('swat_miembros', JSON.stringify(miembros)); }

function cargarDatos() {
  const g = localStorage.getItem('swat_datos');
  if (g) {
    try {
      const d = JSON.parse(g);
      const filasRaw = d.filas || [];
      const idsVistos = {};
      const filasNorm = [];
      filasRaw.forEach((f) => {
        const fechaNorm = normalizarFecha(f.fecha);
        if (!fechaNorm) return;
        let id = f.id;
        if (!id || idsVistos[String(id)]) {
          id = generarIdUnico();
          f._idReparado = true;
        }
        idsVistos[String(id)] = true;
        filasNorm.push({
          ...f,
          id: id,
          fecha: fechaNorm,
          fechaEntregado: normalizarFecha(f.fechaEntregado)
        });
      });
      datos.filas = filasNorm;

      const paramRaw = d.parametrosPorDia || {};
      datos.parametrosPorDia = {};
      Object.keys(paramRaw).forEach((k) => {
        const kn = normalizarFecha(k);
        if (kn) datos.parametrosPorDia[kn] = { _tocado: true, ...paramRaw[k] };
      });

      const estadoRaw = d.estadoPorDia || {};
      datos.estadoPorDia = {};
      Object.keys(estadoRaw).forEach((k) => {
        const kn = normalizarFecha(k);
        if (kn) datos.estadoPorDia[kn] = { hora: horaActual(), _tocado: false, ...estadoRaw[k] };
      });

      datos.porcentajes = d.porcentajes || { Recolector: 0, Camionero: 0 };
      datos.porcentajesPorDia = d.porcentajesPorDia || {};
      datos.webhook = d.webhook || WEBHOOK_POR_DEFECTO;
    } catch (e) { console.warn(e); }
  }
}

function cargarMiembros() {
  const g = localStorage.getItem('swat_miembros');
  if (g) { try { miembros = JSON.parse(g) || []; } catch (e) { miembros = []; } }
}

function actualizarBarraConexion() {
  barraConexion.classList.remove('online', 'offline', 'pendiente');
  const fechasUnicas = new Set();
  Object.keys(filasPendientesSheets).forEach((id) => {
    const fila = datos.filas.find((f) => String(f.id) === String(id));
    if (fila && fila.fecha) fechasUnicas.add(fila.fecha);
  });
  fechasFilasPendientes.forEach((f) => fechasUnicas.add(f));
  fechasEstadoPendientes.forEach((f) => fechasUnicas.add(f));
  const pendientes = fechasUnicas.size +
                     (estadoPendienteSheets ? 1 : 0) +
                     (miembrosPendientesSheets ? 1 : 0);

  if (conexionEstado === 'online' && pendientes === 0) {
    barraConexion.classList.add('online');
    estadoConexion.textContent = 'Conectado';
  } else if (conexionEstado === 'offline') {
    barraConexion.classList.add('offline');
    estadoConexion.textContent = 'Sin conexion';
  } else if (pendientes > 0 || conexionEstado === 'pendiente') {
    barraConexion.classList.add('pendiente');
    estadoConexion.textContent = 'Cambios pendientes';
  } else {
    estadoConexion.textContent = 'Iniciando...';
  }
  let detalles = '';
  if (pendientes > 0) detalles += pendientes + ' pendiente(s). ';
  if (ultimaSync) {
    const d = new Date(ultimaSync);
    detalles += 'Ultima carga: ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  } else {
    detalles += 'Sin cargar todavia';
  }
  detallesConexion.textContent = detalles;
}

function marcarFilaPendiente(id) {
  const fila = datos.filas.find((f) => String(f.id) === String(id));
  if (!fila) return;
  filasPendientesSheets[id] = true;
  if (fila.fecha) fechasFilasPendientes.add(fila.fecha);
  guardarPendientes();
  actualizarBarraConexion();
}

function marcarEstadoPendiente(fecha) {
  estadoPendienteSheets = true;
  if (fecha) fechasEstadoPendientes.add(fecha);
  guardarPendientes();
  actualizarBarraConexion();
}

function marcarMiembrosPendientes() {
  miembrosPendientesSheets = true;
  barraMiembros.classList.add('activa');
  infoMiembros.textContent = 'Hay cambios pendientes en la lista de miembros';
  guardarPendientes();
  actualizarBarraConexion();
}

function refrescarVistaPreviaReporte() {
  if (modalOverlay.classList.contains('activa')) {
    vistaPreviaReporte.textContent = generarReporteTexto();
  }
}

async function enviarPeticion(accion, extra) {
  const token = obtenerTokenGuardado();
  if (!token) {
    mostrarLogin();
    throw new Error('Token no configurado');
  }
  const payload = Object.assign({ accion: accion, token: token }, extra || {});
  const r = await fetch(URL_DB, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const json = await r.json();
  if (json.result === 'error' && json.mensaje && json.mensaje.toLowerCase().includes('token')) {
    limpiarToken();
    mostrarLogin();
    throw new Error('Token invalido');
  }
  return json;
}

async function sincronizarConDb(silencioso = false, forzarReemplazoCompleto = false) {
  if (sincronizando) {
    let esperas = 0;
    while (sincronizando && esperas < 60) {
      await new Promise((r) => setTimeout(r, 500));
      esperas++;
    }
    if (sincronizando) return false;
  }

  const idsSnapshot = Object.keys(filasPendientesSheets);
  const fechasFilas = new Set(fechasFilasPendientes);
  idsSnapshot.forEach((id) => {
    const fila = datos.filas.find((f) => String(f.id) === String(id));
    if (fila && fila.fecha) fechasFilas.add(fila.fecha);
  });
  if (forzarReemplazoCompleto) fechasFilas.add(fechaHoy());
  const fechasEstado = new Set(fechasEstadoPendientes);
  const hayMiembros = miembrosPendientesSheets;
  const miembrosSnap = JSON.stringify(miembros);
  const seqInicio = cambioSeq;

  if (fechasFilas.size === 0 && fechasEstado.size === 0 && !hayMiembros) {
    if (!silencioso) mostrarNotificacion('No hay cambios para guardar.', 'info');
    return true;
  }

  sincronizando = true;
  let totalNuevas = 0, errores = 0;
  const fechasOk = new Set();

  for (const fecha of fechasFilas) {
    const fechaNorm = normalizarFecha(fecha);
    if (!fechaNorm) { fechasFilasPendientes.delete(fecha); continue; }
    try {
      const filasDia = datos.filas
        .filter((f) => normalizarFecha(f.fecha) === fechaNorm)
        .map((f) => ({
          id: f.id, fecha: fechaNorm, hora: f.hora,
          nombre: f.nombre, rango: f.rango,
          bruto: numero(f.bruto),
          neto: netoFila(f), porcentaje: porcentajeFila(f), gasolina: gasolinaFila(f),
          entregado: !!f.entregado, fechaEntregado: f.fechaEntregado || ''
        }));
      const resp = await enviarPeticion('reemplazar_dia', { fecha: fechaNorm, filas: filasDia });
      if (resp.result !== 'success') throw new Error(resp.mensaje || 'Error');
      totalNuevas += resp.insertadas || 0;
      fechasOk.add(fecha);
    } catch (e) {
      errores++;
      console.error('Error reemplazar dia:', e);
    }
  }
  if (cambioSeq === seqInicio) {
    fechasOk.forEach((f) => fechasFilasPendientes.delete(f));
    idsSnapshot.forEach((id) => {
      const fila = datos.filas.find((f) => String(f.id) === String(id));
      if (!fila || fechasOk.has(fila.fecha)) delete filasPendientesSheets[id];
    });
  }

  if (fechasEstado.size > 0) {
    try {
      const estadoArray = [];
      const aBorrar = [];
      fechasEstado.forEach((fecha) => {
        const e = datos.estadoPorDia[fecha];
        const p = datos.parametrosPorDia[fecha];
        const pd = datos.porcentajesPorDia[fecha];
        if (!e && !p && !pd) { aBorrar.push(fecha); return; }
        const item = {
          fecha: fecha,
          hora: (e && e.hora) || horaActual(),
          deposito: e ? e.deposito : 0,
          refinado: e ? e.refinado : 0,
          base: e ? e.base : 0
        };
        if (p) { item.paramDeposito = p.deposito || 0; item.produccion = p.produccion || 0; }
        if (pd) { item.porcRecolector = pd.Recolector || 0; item.porcCamionero = pd.Camionero || 0; }
        estadoArray.push(item);
      });
      for (const f of aBorrar) {
        const r = await enviarPeticion('borrar_estado_dia', { fecha: f });
        if (r.result !== 'success') throw new Error(r.mensaje || 'Error');
      }
      if (estadoArray.length > 0) {
        const resp = await enviarPeticion('reemplazar_estado', { estado: estadoArray });
        if (resp.result !== 'success') throw new Error(resp.mensaje || 'Error');
      }
      if (cambioSeq === seqInicio) fechasEstado.forEach((f) => fechasEstadoPendientes.delete(f));
    } catch (e) {
      errores++;
      console.error('Error guardar estado:', e);
    }
  }
  estadoPendienteSheets = fechasEstadoPendientes.size > 0;

  if (hayMiembros) {
    try {
      const resp = await enviarPeticion('guardar_miembros', { miembros: miembros });
      if (resp.result !== 'success') throw new Error(resp.mensaje || 'Error');
      if (JSON.stringify(miembros) === miembrosSnap) {
        miembrosPendientesSheets = false;
        miembrosCopiaOriginal = JSON.parse(miembrosSnap);
        barraMiembros.classList.remove('activa');
      }
    } catch (e) {
      errores++;
      console.error('Error guardar miembros:', e);
    }
  }

  sincronizando = false;
  guardarPendientes(true);

  if (errores > 0) {
    conexionEstado = 'offline';
    actualizarBarraConexion();
    if (!silencioso) mostrarNotificacion('Error al guardar. Se reintentara.', 'error');
    return false;
  }
  conexionEstado = 'online';
  ultimaSync = Date.now();
  actualizarBarraConexion();
  if (!silencioso) mostrarNotificacion('Guardado: ' + totalNuevas + ' filas.', 'exito');
  return true;
}

async function cargarDesdeDb(silencioso = false) {
  if (sincronizando) return false;
  const ejecutar = async () => {
    try {
      establecerCargando(true);
      const respRec = await enviarPeticion('leer_recolecciones');
      if (respRec.result !== 'success') throw new Error(respRec.mensaje || 'Error');

      const respEst = await enviarPeticion('leer_estado');
      const respMie = await enviarPeticion('leer_miembros');

      datos.filas = (respRec.filas || []).map((f) => {
        const fechaNorm = normalizarFecha(f.fecha);
        if (!fechaNorm) return null;
        return {
          id: Number(f.id) || 0,
          fecha: fechaNorm,
          hora: normalizarHora(f.hora),
          nombre: f.nombre,
          rango: f.rango,
          bruto: numero(f.bruto),
          entregado: !!f.entregado,
          fechaEntregado: normalizarFecha(f.fechaEntregado),
          _gasolinaSheet: Number(f.gasolina) || 0,
          _netoSheet: Number(f.neto) || 0,
          _porcentajeSheet: Number(f.porcentaje) || 0
        };
      }).filter(Boolean);

      datos.estadoPorDia = {};
      datos.parametrosPorDia = {};
      datos.porcentajesPorDia = {};

      (respEst.estado || []).forEach((e) => {
        const fechaNorm = normalizarFecha(e.fecha);
        if (!fechaNorm) return;
        datos.estadoPorDia[fechaNorm] = {
          deposito: numero(e.deposito),
          refinado: numero(e.refinado),
          base: numero(e.base),
          hora: normalizarHora(e.hora) || horaActual(),
          _tocado: false
        };
        datos.parametrosPorDia[fechaNorm] = {
          deposito: numero(e.paramDeposito),
          produccion: numero(e.produccion),
          _tocado: false
        };
        datos.porcentajesPorDia[fechaNorm] = {
          Recolector: numero(e.porcRecolector),
          Camionero: numero(e.porcCamionero),
          _tocado: false
        };
      });

      miembros = respMie.miembros || [];
      miembrosCopiaOriginal = JSON.parse(JSON.stringify(miembros));

      filasPendientesSheets = {};
      fechasFilasPendientes.clear();
      fechasEstadoPendientes.clear();
      estadoPendienteSheets = false;
      miembrosPendientesSheets = false;
      barraMiembros.classList.remove('activa');
      ultimaSync = Date.now();
      conexionEstado = 'online';
      guardarPendientes();
      repararIdsDuplicados();
      actualizarBarraConexion();

      guardarDatos();
      guardarMiembros();
      renderDiaActual();
      actualizarVistaMiembros();

      if (consultar('vista-resumen').classList.contains('activa')) {
        setTimeout(() => actualizarResumen(), 150);
      } else if (consultar('vista-historial').classList.contains('activa')) {
        setTimeout(() => actualizarHistorial(), 150);
      } else {
        actualizarResumen();
        actualizarHistorial();
      }

      refrescarVistaPreviaReporte();

      if (!silencioso) {
        mostrarNotificacion('Datos cargados: ' + datos.filas.length + ' recolecciones, ' + miembros.length + ' miembros.', 'exito');
      }
      return true;
    } catch (e) {
      conexionEstado = 'offline';
      actualizarBarraConexion();
      if (!silencioso) mostrarNotificacion('Error al cargar: ' + e.message, 'error');
      return false;
    } finally {
      establecerCargando(false);
    }
  };

  if (!silencioso) {
    return new Promise((resolve) => {
      mostrarConfirmacion({
        titulo: 'Cargar DB',
        mensaje: '¿Cargar todos los datos desde la DB?',
        sub: 'Se reemplazaran los datos locales no guardados y se refrescara la pestaña actual.',
        callback: async () => {
          const r = await ejecutar();
          resolve(r);
        }
      });
    });
  }

  return await ejecutar();
}

async function refrescarDesdeDbParaReporte() {
  const fecha = fechaHoy();
  sincronizarEstadoDesdeDom(fecha);
  sincronizarParametrosDesdeDom(fecha);
  sincronizarFilasDesdeDom(fecha);

  try {
    establecerCargando(true);
    const respRec = await enviarPeticion('leer_recolecciones');
    if (respRec.result !== 'success') throw new Error(respRec.mensaje || 'Error');

    const respEst = await enviarPeticion('leer_estado');

    const filasRemotas = (respRec.filas || []).map((f) => {
      const fechaNorm = normalizarFecha(f.fecha);
      if (!fechaNorm) return null;
      return {
        id: Number(f.id) || 0,
        fecha: fechaNorm,
        hora: normalizarHora(f.hora),
        nombre: f.nombre,
        rango: f.rango,
        bruto: numero(f.bruto),
        entregado: !!f.entregado,
        fechaEntregado: normalizarFecha(f.fechaEntregado),
        _gasolinaSheet: Number(f.gasolina) || 0,
        _netoSheet: Number(f.neto) || 0,
        _porcentajeSheet: Number(f.porcentaje) || 0
      };
    }).filter(Boolean);

    const fechasLocales = new Set(fechasFilasPendientes);
    Object.keys(filasPendientesSheets).forEach((id) => {
      const f = datos.filas.find((x) => String(x.id) === String(id));
      if (f) fechasLocales.add(f.fecha);
    });
    const resultado = [];
    filasRemotas.forEach((f) => { if (!fechasLocales.has(f.fecha)) resultado.push(f); });
    datos.filas.forEach((f) => { if (fechasLocales.has(f.fecha)) resultado.push(f); });
    datos.filas = resultado;
    repararIdsDuplicados();

    (respEst.estado || []).forEach((e) => {
      const fechaNorm = normalizarFecha(e.fecha);
      if (!fechaNorm || fechasEstadoPendientes.has(fechaNorm)) return;
      datos.estadoPorDia[fechaNorm] = {
        deposito: numero(e.deposito), refinado: numero(e.refinado),
        base: numero(e.base), hora: normalizarHora(e.hora) || horaActual(), _tocado: false
      };
      datos.parametrosPorDia[fechaNorm] = {
        deposito: numero(e.paramDeposito), produccion: numero(e.produccion), _tocado: false
      };
      datos.porcentajesPorDia[fechaNorm] = {
        Recolector: numero(e.porcRecolector), Camionero: numero(e.porcCamionero), _tocado: false
      };
    });
    renderDiaActual();

    guardarDatos();
    guardarPendientes();
  } catch (e) {
    console.warn('Error refrescando:', e);
  } finally {
    establecerCargando(false);
  }
}

function renderDiaActual() {
  const fecha = fechaHoy();
  textoFechaHoy.textContent = fechaHoyMostrar();

  const p = datos.parametrosPorDia[fecha];
  depositoInput.value = p ? p.deposito : 0;
  produccionInput.value = p ? p.produccion : 0;

  const pd = datos.porcentajesPorDia[fecha];
  porcentajeRecolectorInput.value = pd ? pd.Recolector : datos.porcentajes.Recolector;
  porcentajeCamioneroInput.value = pd ? pd.Camionero : datos.porcentajes.Camionero;

  const e = obtenerEstadoDia(fecha);
  estadoDeposito.value = e.deposito;
  estadoRefinado.value = e.refinado;
  estadoBase.value = e.base;

  const totalFilasDia = filasDelDia(fecha).length;
  infoDia.textContent = 'Registros: ' + totalFilasDia + ' | Hoy';

  cuerpoTabla.innerHTML = '';
  const filasDia = filasDelDia(fecha);
  filasDia.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));

  if (filasDia.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 9;
    td.className = 'mensaje-vacio';
    td.textContent = 'NO SE HA AÑADIDO DATOS';
    tr.appendChild(td);
    cuerpoTabla.appendChild(tr);
  } else {
    filasDia.forEach((f) => cuerpoTabla.appendChild(crearFilaDom(f, fecha)));
  }

  recalcularTodo();
}

function recalcularTodo() {
  const fecha = fechaHoy();
  const rendimiento = calcularRendimientoDeDia(fecha);
  visualRendimiento.textContent = formatearDecimal(rendimiento) + '%';
  visualPerdida.textContent = formatearDecimal(100 - rendimiento) + '%';

  let sumaBruto = 0, sumaNeto = 0, sumaGas = 0, pend = 0, ent = 0;

  cuerpoTabla.querySelectorAll('tr[data-id]').forEach((tr) => {
    const id = parseInt(tr.dataset.id);
    const fila = datos.filas.find((f) => f.id === id);
    if (!fila) return;

    const bruto = numero(tr.querySelector('.bruto-input').value);
    fila.bruto = bruto;
    const neto = netoFila(fila);
    const porc = porcentajeFila(fila);
    const gas = gasolinaFila(fila);

    tr.querySelector('.neto-celda').textContent = formatearNumero(neto);
    tr.querySelector('.porcentaje-celda').textContent = formatearNumero(porc) + '%';
    tr.querySelector('.gasolina-celda').textContent = formatearNumero(gas);

    sumaBruto += bruto; sumaNeto += neto; sumaGas += gas;
    if (fila.entregado) ent += gas; else pend += gas;
  });

  totalCrudo.textContent = formatearNumero(sumaBruto);
  totalNeto.textContent = formatearNumero(sumaNeto);
  totalGasolina.textContent = formatearNumero(sumaGas);
  pendienteDia.textContent = formatearLitros(pend);
  entregadoDia.textContent = formatearLitros(ent);
  contadorFilas.textContent = filasDelDia(fecha).length;

  guardarDatos();
  refrescarVistaPreviaReporte();
}

function crearFilaDom(fila, fecha) {
  const tr = document.createElement('tr');
  tr.dataset.id = fila.id;
  if (fila.entregado) tr.classList.add('fila-entregada');

  const tdHora = document.createElement('td');
  const inputHora = document.createElement('input');
  inputHora.type = 'time';
  inputHora.value = fila.hora;
  inputHora.className = 'hora-input';
  tdHora.appendChild(inputHora);
  tr.appendChild(tdHora);

  const tdNombre = document.createElement('td');
  const selectNombre = document.createElement('select');
  selectNombre.className = 'nombre-select';
  const opciones = miembros.filter((m) => m.activo).map((m) => m.nombre);
  if (fila.nombre && !opciones.includes(fila.nombre)) opciones.push(fila.nombre);
  if (opciones.length === 0) {
    const optVacio = document.createElement('option');
    optVacio.value = '';
    optVacio.textContent = '-- sin miembros cargados --';
    selectNombre.appendChild(optVacio);
    selectNombre.disabled = true;
  } else {
    opciones.forEach((nombre) => {
      const opt = document.createElement('option');
      opt.value = nombre;
      opt.textContent = nombre || '(sin nombre)';
      if (fila.nombre === nombre) opt.selected = true;
      selectNombre.appendChild(opt);
    });
    if (!fila.nombre) {
      const optVacio = document.createElement('option');
      optVacio.value = '';
      optVacio.textContent = '-- elegir --';
      selectNombre.insertBefore(optVacio, selectNombre.firstChild);
      selectNombre.value = '';
    }
  }
  tdNombre.appendChild(selectNombre);
  tr.appendChild(tdNombre);

  const tdRango = document.createElement('td');
  const selectRango = document.createElement('select');
  selectRango.className = 'rango-select';
  ['Recolector', 'Camionero'].forEach((op) => {
    const opt = document.createElement('option');
    opt.value = op; opt.textContent = op;
    if (fila.rango === op) opt.selected = true;
    selectRango.appendChild(opt);
  });
  tdRango.appendChild(selectRango);
  tr.appendChild(tdRango);

  const tdBruto = document.createElement('td');
  const inputBruto = document.createElement('input');
  inputBruto.type = 'number';
  inputBruto.min = '0'; inputBruto.step = '0.1';
  inputBruto.value = fila.bruto;
  inputBruto.className = 'bruto-input';
  tdBruto.appendChild(inputBruto);
  tr.appendChild(tdBruto);

  const tdNeto = document.createElement('td');
  tdNeto.className = 'celda-calculada neto-celda';
  tdNeto.textContent = '0';
  tr.appendChild(tdNeto);

  const tdPorc = document.createElement('td');
  tdPorc.className = 'celda-calculada porcentaje-celda';
  tdPorc.textContent = '0%';
  tr.appendChild(tdPorc);

  const tdGas = document.createElement('td');
  tdGas.className = 'celda-calculada gasolina-celda';
  tdGas.textContent = '0';
  tr.appendChild(tdGas);

  const tdEnt = document.createElement('td');
  tdEnt.style.textAlign = 'center';
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = !!fila.entregado;
  check.className = 'entregado-check';
  tdEnt.appendChild(check);
  tr.appendChild(tdEnt);

  const tdX = document.createElement('td');
  const botonX = document.createElement('button');
  botonX.className = 'boton boton-peligro boton-pequeno';
  botonX.textContent = 'X';
  botonX.title = 'Eliminar fila';
  botonX.addEventListener('click', () => eliminarFila(fila.id));
  tdX.appendChild(botonX);
  tr.appendChild(tdX);

  inputBruto.addEventListener('input', () => {
    if (numero(inputBruto.value) < 0) { mostrarNotificacion('El campo "Bruto" no puede ser negativo.', 'error'); inputBruto.value = 0; }
    fila.bruto = numero(inputBruto.value);
    fila._gasolinaSheet = undefined;
    fila._netoSheet = undefined;
    fila._porcentajeSheet = undefined;
    recalcularTodo();
    marcarFilaPendiente(fila.id);
  });
  inputHora.addEventListener('change', () => {
    if (!inputHora.value) { mostrarNotificacion('Hora invalida.', 'error'); inputHora.value = fila.hora; return; }
    fila.hora = inputHora.value;
    guardarDatos();
    marcarFilaPendiente(fila.id);
    refrescarVistaPreviaReporte();
  });
  selectNombre.addEventListener('change', () => {
    fila.nombre = selectNombre.value;
    guardarDatos();
    marcarFilaPendiente(fila.id);
    refrescarVistaPreviaReporte();
  });
  selectRango.addEventListener('change', () => {
    fila.rango = selectRango.value;
    fila._gasolinaSheet = undefined;
    fila._netoSheet = undefined;
    fila._porcentajeSheet = undefined;
    recalcularTodo();
    marcarFilaPendiente(fila.id);
  });
  check.addEventListener('change', () => {
    fila.entregado = check.checked;
    fila.fechaEntregado = check.checked ? fechaHoy() : '';
    tr.classList.toggle('fila-entregada', check.checked);
    recalcularTodo();
    marcarFilaPendiente(fila.id);
  });

  const inputs = [inputHora, selectNombre, selectRango, inputBruto];
  inputs.forEach((input, idx) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const esUltima = tr === cuerpoTabla.lastElementChild;
        if (esUltima && input === inputBruto) {
          agregarFila();
        } else {
          const sig = inputs[idx + 1];
          if (sig) sig.focus();
          else {
            const nextTr = tr.nextElementSibling;
            if (nextTr) {
              const pi = nextTr.querySelector('input, select');
              if (pi) pi.focus();
            }
          }
        }
      }
    });
  });

  return tr;
}

function agregarFila() {
  const fecha = fechaHoy();
  const nuevoId = generarIdUnico();
  const nueva = {
    id: nuevoId, fecha: fecha, hora: horaActual(),
    nombre: '', rango: 'Recolector', bruto: 0, entregado: false,
    fechaEntregado: ''
  };
  datos.filas.push(nueva);
  renderDiaActual();
  recalcularTodo();
  marcarFilaPendiente(nuevoId);
  const ultimoTr = cuerpoTabla.lastElementChild;
  if (ultimoTr) {
    const primerInput = ultimoTr.querySelector('input, select');
    if (primerInput) primerInput.focus();
  }
}

function eliminarFila(id) {
  mostrarConfirmacion({
    titulo: 'Eliminar fila',
    mensaje: '¿Eliminar esta recoleccion?',
    sub: 'Esta accion no se puede deshacer.',
    callback: () => {
      const fila = datos.filas.find((f) => f.id === id);
      const fecha = fila ? fila.fecha : null;
      datos.filas = datos.filas.filter((f) => f.id !== id);
      const tr = cuerpoTabla.querySelector('tr[data-id="' + id + '"]');
      if (tr) tr.remove();
      if (fecha) {
        fechasFilasPendientes.add(fecha);
        marcarFilaPendiente(id);
      }
      recalcularTodo();
      renderDiaActual();
    }
  });
}

function limpiarFormulario() {
  mostrarConfirmacion({
    titulo: 'Limpiar formulario',
    mensaje: '¿Limpiar TODO el formulario del dia actual?',
    sub: 'Se borraran las filas, parametros, porcentajes y el estado del deposito y base. El webhook se conserva.',
    callback: async () => {
      const fecha = fechaHoy();
      const filasDia = filasDelDia(fecha);
      filasDia.forEach((f) => {
        datos.filas = datos.filas.filter((x) => x.id !== f.id);
        marcarFilaPendiente(f.id);
      });
      fechasFilasPendientes.add(fecha);
      fechasEstadoPendientes.add(fecha);
      delete datos.parametrosPorDia[fecha];
      delete datos.estadoPorDia[fecha];
      delete datos.porcentajesPorDia[fecha];
      datos.porcentajes = { Recolector: 0, Camionero: 0 };
      guardarDatos();
      guardarPendientes();
      renderDiaActual();

      try {
        const resp = await enviarPeticion('borrar_estado_dia', { fecha: fecha });
        if (resp.result === 'success') {
          fechasEstadoPendientes.delete(fecha);
          guardarPendientes();
        }
      } catch (e) {
        console.warn('No se pudo borrar estado:', e);
      }

      estadoPendienteSheets = fechasEstadoPendientes.size > 0;
      guardarPendientes();
      sincronizarConDb(true);

      mostrarNotificacion('Formulario limpiado completamente.', 'info');
    }
  });
}

function aplicarFiltros() {
  filtrosAplicados.desde = filtroDesde.value;
  filtrosAplicados.hasta = filtroHasta.value;
  filtrosAplicados.miembro = filtroMiembro.value;
  filtrosAplicados.estado = filtroEstado.value;
  actualizarHistorial();
  mostrarNotificacion('Filtros aplicados.', 'info');
}

function obtenerHistorialFiltrado(usarCambiosPendientes = false) {
  const desde = filtrosAplicados.desde;
  const hasta = filtrosAplicados.hasta;
  const miembro = filtrosAplicados.miembro;
  const estado = filtrosAplicados.estado;

  let filasTrabajo = datos.filas.slice();
  if (usarCambiosPendientes) {
    cambiosPendientes.forEach((c) => {
      if (c.tipo === 'check') {
        const fila = filasTrabajo.find((f) => f.id === c.id);
        if (fila) {
          fila.entregado = c.valorNuevo;
          fila.fechaEntregado = c.valorNuevo ? (c.fechaEntregadoNuevo || fechaHoy()) : '';
        }
      }
    });
    const idsEliminar = cambiosPendientes.filter((c) => c.tipo === 'eliminar').map((c) => c.id);
    filasTrabajo = filasTrabajo.filter((f) => !idsEliminar.includes(f.id));
  }

  return filasTrabajo.filter((f) => {
    if (desde && f.fecha < desde) return false;
    if (hasta && f.fecha > hasta) return false;
    if (miembro && f.nombre !== miembro) return false;
    if (estado === 'pendiente' && f.entregado) return false;
    if (estado === 'entregado' && !f.entregado) return false;
    return true;
  }).map((f) => {
    const neto = netoFila(f);
    const porc = porcentajeFila(f);
    const gas = gasolinaFila(f);
    return { ...f, neto, porcentaje: porc, gasolina: gas, beneficio: neto - gas, rendimiento: calcularRendimientoDeDia(f.fecha) };
  });
}

function actualizarHistorial() {
  const nombres = new Set(datos.filas.map((f) => f.nombre).filter(Boolean));
  const actual = filtroMiembro.value;
  filtroMiembro.innerHTML = '<option value="">Todos</option>';
  Array.from(nombres).sort().forEach((n) => {
    const o = document.createElement('option');
    o.value = n; o.textContent = n;
    if (n === actual) o.selected = true;
    filtroMiembro.appendChild(o);
  });

  const lista = obtenerHistorialFiltrado(true);
  let totalBruto = 0, totalNeto = 0, totalGas = 0, totalPend = 0, totalEnt = 0, totalBeneficio = 0;
  lista.forEach((d) => {
    totalBruto += numero(d.bruto);
    totalNeto += d.neto;
    totalGas += d.gasolina;
    totalBeneficio += d.beneficio;
    if (d.entregado) totalEnt += d.gasolina; else totalPend += d.gasolina;
  });

  consultar('statCrudoBruto').textContent = formatearLitros(totalBruto);
  consultar('statNetoTotal').textContent = formatearLitros(totalNeto);
  consultar('statGasolinaTotal').textContent = formatearLitros(totalPend);
  consultar('statPendiente').textContent = formatearLitros(totalBeneficio);
  consultar('statEntregado').textContent = formatearLitros(totalEnt);

  cuerpoHistorial.innerHTML = '';
  if (lista.length === 0) {
    historialVacio.style.display = 'block';
  } else {
    historialVacio.style.display = 'none';
    lista.sort((a, b) => (b.fecha + (b.hora || '')).localeCompare(a.fecha + (a.hora || '')));
    lista.forEach((d) => {
      const tr = document.createElement('tr');
      if (d.entregado) tr.classList.add('fila-entregada');
      const tieneCheckPendiente = cambiosPendientes.some((c) => c.id === d.id && c.tipo === 'check');
      if (tieneCheckPendiente) tr.classList.add('fila-pendiente');

      tr.innerHTML = `
        <td>${escaparHtml(d.fecha)}</td>
        <td>${escaparHtml(d.hora || '')}</td>
        <td>${escaparHtml(d.nombre || '')}</td>
        <td>${escaparHtml(d.rango)}</td>
        <td class="celda-calculada">${formatearNumero(d.bruto)}</td>
        <td class="celda-calculada">${formatearNumero(d.neto)}</td>
        <td class="celda-calculada">${formatearNumero(d.porcentaje)}%</td>
        <td class="celda-calculada">${formatearNumero(d.gasolina)}</td>
        <td style="text-align:center;">
          <input type="checkbox" class="check-historial" ${d.entregado ? 'checked' : ''} data-id="${d.id}">
        </td>
        <td style="text-align:center;">${escaparHtml(d.fechaEntregado || '—')}</td>
        <td>
          <button class="boton boton-pequeno boton-peligro eliminar-historial" data-id="${d.id}" title="Eliminar">X</button>
        </td>
      `;
      cuerpoHistorial.appendChild(tr);
    });

    cuerpoHistorial.querySelectorAll('.check-historial').forEach((chk) => {
      chk.addEventListener('change', () => {
        const id = parseInt(chk.dataset.id);
        const fila = datos.filas.find((f) => f.id === id);
        if (!fila) return;
        const idx = cambiosPendientes.findIndex((c) => c.id === id && c.tipo === 'check');
        const valorAnterior = fila.entregado;
        const valorNuevo = chk.checked;
        if (valorNuevo === valorAnterior) {
          if (idx >= 0) cambiosPendientes.splice(idx, 1);
        } else {
          const fechaFila = fila.fecha || fechaHoy();
          if (idx >= 0) {
            cambiosPendientes[idx].valorNuevo = valorNuevo;
            cambiosPendientes[idx].fechaEntregadoNuevo = valorNuevo ? fechaFila : '';
          } else {
            cambiosPendientes.push({
              id, tipo: 'check', valorAnterior, valorNuevo,
              fechaEntregadoNuevo: valorNuevo ? fechaFila : ''
            });
          }
        }
        actualizarHistorial();
        actualizarBarraPendientes();
      });
    });

    cuerpoHistorial.querySelectorAll('.eliminar-historial').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const fila = datos.filas.find((f) => f.id === id);
        if (!fila) return;
        mostrarConfirmacion({
          titulo: 'Marcar para eliminar',
          mensaje: '¿Marcar esta recoleccion para eliminar?',
          sub: 'Se aplicara al presionar "Actualizar dia".',
          callback: () => {
            cambiosPendientes = cambiosPendientes.filter((c) => c.id !== id);
            cambiosPendientes.push({ id, tipo: 'eliminar', valorAnterior: null, valorNuevo: null });
            actualizarHistorial();
            actualizarBarraPendientes();
            mostrarNotificacion('Recoleccion marcada para eliminar.', 'info');
          }
        });
      });
    });
  }
}

function actualizarBarraPendientes() {
  if (cambiosPendientes.length === 0) {
    barraPendientes.classList.remove('activa');
    return;
  }
  barraPendientes.classList.add('activa');
  const numChecks = cambiosPendientes.filter((c) => c.tipo === 'check').length;
  const numElim = cambiosPendientes.filter((c) => c.tipo === 'eliminar').length;
  const partes = [];
  if (numChecks > 0) partes.push(numChecks + ' cambio(s)');
  if (numElim > 0) partes.push(numElim + ' eliminacion(es)');
  infoPendientes.textContent = 'Pendientes: ' + partes.join(' | ') + '. Presiona "Actualizar dia" para guardar.';
}

function aplicarCambiosPendientes() {
  if (cambiosPendientes.length === 0) {
    mostrarNotificacion('No hay cambios pendientes.', 'info');
    return;
  }
  mostrarConfirmacion({
    titulo: 'Actualizar dia',
    mensaje: '¿Actualizar los cambios pendientes?',
    sub: 'Se guardaran en la DB.',
    callback: () => {
      cambiosPendientes.forEach((c) => {
        if (c.tipo === 'check') {
          const fila = datos.filas.find((f) => f.id === c.id);
          if (fila) {
            fila.entregado = c.valorNuevo;
            fila.fechaEntregado = c.valorNuevo ? (c.fechaEntregadoNuevo || fila.fecha || fechaHoy()) : '';
            marcarFilaPendiente(fila.id);
            fechasFilasPendientes.add(fila.fecha);
          }
        } else if (c.tipo === 'eliminar') {
          const fila = datos.filas.find((f) => f.id === c.id);
          if (fila) {
            fechasFilasPendientes.add(fila.fecha);
            marcarFilaPendiente(c.id);
            datos.filas = datos.filas.filter((f) => f.id !== c.id);
          }
        }
      });
      const num = cambiosPendientes.length;
      cambiosPendientes = [];
      guardarDatos();
      guardarPendientes();
      actualizarBarraPendientes();
      actualizarHistorial();
      actualizarResumen();
      renderDiaActual();
      mostrarNotificacion(num + ' cambio(s) guardado(s).', 'exito');
      sincronizarConDb(true);
    }
  });
}

function descartarCambiosPendientes() {
  if (cambiosPendientes.length === 0) return;
  mostrarConfirmacion({
    titulo: 'Descartar cambios',
    mensaje: '¿Descartar todos los cambios pendientes?',
    callback: () => {
      cambiosPendientes = [];
      actualizarBarraPendientes();
      actualizarHistorial();
      mostrarNotificacion('Cambios descartados.', 'info');
    }
  });
}

function actualizarResumen() {
  let totalBruto = 0, totalNeto = 0, totalGas = 0, totalEnt = 0, totalBeneficio = 0;
  const fechasConDatos = new Set();
  const todosLosDatos = [];

  datos.filas.forEach((f) => {
    const neto = netoFila(f);
    const porc = porcentajeFila(f);
    const gas = gasolinaFila(f);
    const beneficio = neto - gas;
    todosLosDatos.push({
      fecha: f.fecha, nombre: f.nombre, rango: f.rango,
      bruto: numero(f.bruto), neto, gasolina: gas, beneficio, entregado: f.entregado,
      fechaEntregado: f.fechaEntregado || ''
    });
    totalBruto += numero(f.bruto);
    totalNeto += neto;
    totalGas += gas;
    totalBeneficio += beneficio;
    if (f.entregado) totalEnt += gas;
    fechasConDatos.add(f.fecha);
  });

  consultar('resumenDias').textContent = fechasConDatos.size;
  consultar('resumenCrudo').textContent = formatearLitros(totalBruto);
  consultar('resumenNeto').textContent = formatearLitros(totalNeto);
  consultar('resumenEntregado').textContent = formatearLitros(totalEnt);
  consultar('resumenGasolina').textContent = formatearLitros(totalGas - totalEnt);
  consultar('resumenBeneficio').textContent = formatearLitros(totalBeneficio);

  requestAnimationFrame(() => dibujarGraficas(todosLosDatos));
}

function prepararCanvas(canvas) {
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  const parent = canvas.parentElement;
  const cssW = (canvas.clientWidth > 0) ? canvas.clientWidth : (parent ? parent.clientWidth - 32 : 1200);
  const cssH = 340;
  canvas.style.width = '100%';
  canvas.style.height = cssH + 'px';
  canvas.width = Math.max(100, cssW * dpr);
  canvas.height = cssH * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  return { ctx, w: cssW, h: cssH };
}

function dibujarGraficas(datosG) {
  const estilo = {
    eje: '#3a3a3a', texto: '#8a8a8a',
    barraBruto: '#d0d0d0',
    barraNeto: '#a8b4c0',
    barraGas: '#7a8a9a',
    barraBeneficio: '#a0c8b0',
    barraPend: '#d0d0d0', barraEnt: '#4a4a4a'
  };

  (function() {
    const c = prepararCanvas(consultar('graficaRecolectores'));
    if (!c) return;
    const { ctx, w, h } = c;
    const porMiembro = {};
    datosG.forEach((d) => {
      if (!d.nombre) return;
      if (!porMiembro[d.nombre]) porMiembro[d.nombre] = { bruto: 0, neto: 0 };
      porMiembro[d.nombre].bruto += d.bruto;
      porMiembro[d.nombre].neto += d.neto;
    });
    const arr = Object.entries(porMiembro)
      .map(([k, v]) => ({ nombre: k, bruto: v.bruto, neto: v.neto }))
      .sort((a, b) => b.bruto - a.bruto).slice(0, 10);
    dibujarBarrasAgrupadas(ctx, w, h, arr, estilo, [
      { key: 'bruto', color: estilo.barraBruto, label: 'Bruto' },
      { key: 'neto', color: estilo.barraNeto, label: 'Neto' }
    ], (d) => d.nombre);
  })();

  (function() {
    const c = prepararCanvas(consultar('graficaGasolina'));
    if (!c) return;
    const { ctx, w, h } = c;
    const porMiembro = {};
    datosG.forEach((d) => {
      if (!d.nombre) return;
      if (!porMiembro[d.nombre]) porMiembro[d.nombre] = { bruto: 0, neto: 0, gasolina: 0 };
      porMiembro[d.nombre].bruto += d.bruto;
      porMiembro[d.nombre].neto += d.neto;
      porMiembro[d.nombre].gasolina += d.gasolina;
    });
    const arr = Object.entries(porMiembro)
      .map(([k, v]) => ({ nombre: k, bruto: v.bruto, neto: v.neto, gasolina: v.gasolina }))
      .sort((a, b) => b.bruto - a.bruto).slice(0, 10);
    dibujarBarrasAgrupadas(ctx, w, h, arr, estilo, [
      { key: 'bruto', color: estilo.barraBruto, label: 'Bruto' },
      { key: 'neto', color: estilo.barraNeto, label: 'Neto' },
      { key: 'gasolina', color: estilo.barraGas, label: 'Recompensa' }
    ], (d) => d.nombre);
  })();

  (function() {
    const c = prepararCanvas(consultar('graficaPendiente'));
    if (!c) return;
    const { ctx, w, h } = c;
    const porMiembro = {};
    datosG.forEach((d) => {
      if (!d.nombre) return;
      if (!porMiembro[d.nombre]) porMiembro[d.nombre] = { pend: 0, ent: 0 };
      if (d.entregado) porMiembro[d.nombre].ent += d.gasolina;
      else porMiembro[d.nombre].pend += d.gasolina;
    });
    const arr = Object.entries(porMiembro)
      .map(([k, v]) => ({ nombre: k, pend: v.pend, ent: v.ent }))
      .sort((a, b) => (b.pend + b.ent) - (a.pend + a.ent)).slice(0, 10);
    dibujarBarrasAgrupadas(ctx, w, h, arr, estilo, [
      { key: 'pend', color: estilo.barraPend, label: 'Pendiente' },
      { key: 'ent', color: estilo.barraEnt, label: 'Entregado' }
    ], (d) => d.nombre);
  })();

  (function() {
    const c = prepararCanvas(consultar('graficaAporte'));
    if (!c) return;
    const { ctx, w, h } = c;
    const porMiembro = {};
    datosG.forEach((d) => {
      if (!d.nombre) return;
      if (!porMiembro[d.nombre]) porMiembro[d.nombre] = { beneficio: 0 };
      porMiembro[d.nombre].beneficio += d.beneficio;
    });
    const arr = Object.entries(porMiembro)
      .map(([k, v]) => ({ nombre: k, beneficio: v.beneficio }))
      .sort((a, b) => b.beneficio - a.beneficio).slice(0, 10);
    dibujarBarrasAgrupadas(ctx, w, h, arr, estilo, [
      { key: 'beneficio', color: estilo.barraBeneficio, label: 'Aporte al clan' }
    ], (d) => d.nombre);
  })();

  (function() {
    const c = prepararCanvas(consultar('graficaEvolucion'));
    if (!c) return;
    const { ctx, w, h } = c;
    const porFecha = {};
    datosG.forEach((d) => {
      if (!porFecha[d.fecha]) porFecha[d.fecha] = { bruto: 0, neto: 0 };
      porFecha[d.fecha].bruto += d.bruto;
      porFecha[d.fecha].neto += d.neto;
    });
    const arr = Object.entries(porFecha)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([fecha, v]) => ({ fecha: fecha, bruto: v.bruto, neto: v.neto }));
    dibujarBarrasAgrupadas(ctx, w, h, arr, estilo, [
      { key: 'bruto', color: estilo.barraBruto, label: 'Bruto' },
      { key: 'neto', color: estilo.barraNeto, label: 'Neto' }
    ], (d) => formatearFechaCorta(d.fecha));
  })();

  (function() {
    const c = prepararCanvas(consultar('graficaEvolucionAporte'));
    if (!c) return;
    const { ctx, w, h } = c;
    const porFecha = {};
    datosG.forEach((d) => {
      if (!porFecha[d.fecha]) porFecha[d.fecha] = { aporte: 0 };
      porFecha[d.fecha].aporte += d.beneficio;
    });
    const arr = Object.entries(porFecha)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([fecha, v]) => ({ fecha: fecha, aporte: v.aporte }));
    dibujarBarrasAgrupadas(ctx, w, h, arr, estilo, [
      { key: 'aporte', color: estilo.barraBeneficio, label: 'Aporte al clan' }
    ], (d) => formatearFechaCorta(d.fecha));
  })();
}

function formatearFechaCorta(fecha) {
  if (!fecha) return '';
  const s = String(fecha);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return m[2] + '-' + m[3];
  return s.substring(0, 10);
}

function dibujarBarrasAgrupadas(ctx, w, h, datosB, estilo, series, fnLabel) {
  const m = { top: 50, right: 20, bottom: 90, left: 70 };
  const ancho = w - m.left - m.right;
  const alto = h - m.top - m.bottom;
  ctx.strokeStyle = estilo.eje; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(m.left, m.top); ctx.lineTo(m.left, m.top + alto); ctx.lineTo(m.left + ancho, m.top + alto);
  ctx.stroke();

  let max = 1;
  datosB.forEach((d) => { series.forEach((s) => { const v = d[s.key] || 0; if (v > max) max = v; }); });
  const pasos = 4;
  ctx.fillStyle = estilo.texto; ctx.font = '10px Arial'; ctx.textAlign = 'right';
  for (let i = 0; i <= pasos; i++) {
    const y = m.top + (alto / pasos) * i;
    const valor = max - (max / pasos) * i;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath();
    ctx.moveTo(m.left, y);
    ctx.lineTo(m.left + ancho, y);
    ctx.stroke();
    ctx.fillStyle = estilo.texto;
    ctx.fillText(formatearNumero(valor), m.left - 6, y + 3);
  }

  if (datosB.length === 0) {
    ctx.fillStyle = estilo.texto; ctx.font = '14px Arial'; ctx.textAlign = 'center';
    ctx.fillText('Sin datos', w / 2, h / 2);
    return;
  }

  const nSeries = series.length;
  const esp = ancho / datosB.length;
  const grupoAnchoMax = 140;
  const grupoAncho = Math.min(esp * 0.7, grupoAnchoMax);
  const barraAncho = grupoAncho / nSeries;

  datosB.forEach((d, i) => {
    const xBase = m.left + esp * i + (esp - grupoAncho) / 2;
    series.forEach((s, j) => {
      const valor = d[s.key] || 0;
      const altura = (valor / max) * alto;
      const x = xBase + barraAncho * j;
      const y = m.top + alto - altura;
      ctx.fillStyle = s.color;
      ctx.fillRect(x, y, Math.max(2, barraAncho - 3), altura);
      if (valor > 0) {
        ctx.fillStyle = estilo.texto;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(formatearNumero(valor), x + (barraAncho - 3) / 2, y - 5);
      }
    });
    const label = fnLabel(d);
    ctx.fillStyle = estilo.texto;
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label.substring(0, 16), xBase + grupoAncho / 2, m.top + alto + 18);
  });

  let leyendaX = m.left;
  series.forEach((s) => {
    ctx.fillStyle = s.color;
    ctx.fillRect(leyendaX, m.top - 30, 14, 14);
    ctx.fillStyle = estilo.texto; ctx.font = '11px Arial'; ctx.textAlign = 'left';
    ctx.fillText(s.label, leyendaX + 18, m.top - 19);
    leyendaX += Math.max(100, s.label.length * 8 + 40);
  });
}

function actualizarVistaMiembros() {
  cuerpoMiembros.innerHTML = '';
  contadorMiembros.textContent = 'Total de miembros: ' + miembros.length;
  if (miembros.length === 0) {
    cuerpoMiembros.innerHTML = '<tr><td colspan="4" class="mensaje-vacio">NO HAY MIEMBROS CARGADOS O REGISTRADOS</td></tr>';
    return;
  }

  miembros.forEach((m, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escaparHtml(m.nombre)}</td>
      <td>${escaparHtml(m.rango)}</td>
      <td>${m.activo ? 'Activo' : 'Inactivo'}</td>
      <td>
        <button class="boton boton-pequeno alternar-miembro" data-i="${i}">${m.activo ? 'Desactivar' : 'Activar'}</button>
        <button class="boton boton-pequeno boton-peligro eliminar-miembro" data-i="${i}">X</button>
      </td>
    `;
    cuerpoMiembros.appendChild(tr);
  });
  cuerpoMiembros.querySelectorAll('.alternar-miembro').forEach((btn) => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.i);
      miembros[i].activo = !miembros[i].activo;
      guardarMiembros();
      marcarMiembrosPendientes();
      actualizarVistaMiembros();
      renderDiaActual();
    });
  });
  cuerpoMiembros.querySelectorAll('.eliminar-miembro').forEach((btn) => {
    btn.addEventListener('click', () => {
      mostrarConfirmacion({
        titulo: 'Eliminar miembro',
        mensaje: '¿Eliminar este miembro de la lista?',
        callback: () => {
          const i = parseInt(btn.dataset.i);
          miembros.splice(i, 1);
          guardarMiembros();
          marcarMiembrosPendientes();
          actualizarVistaMiembros();
        }
      });
    });
  });
}

function agregarMiembro() {
  const nombre = nuevoMiembro.value.trim();
  if (!nombre) { mostrarNotificacion('Escribe un nombre.', 'error'); return; }
  if (miembros.some((m) => m.nombre.toLowerCase() === nombre.toLowerCase())) {
    mostrarNotificacion('Ya existe un miembro con ese nombre.', 'error'); return;
  }
  miembros.push({ nombre, rango: nuevoMiembroRango.value, activo: true });
  guardarMiembros();
  marcarMiembrosPendientes();
  nuevoMiembro.value = '';
  actualizarVistaMiembros();
  mostrarNotificacion('Miembro agregado (pendiente de guardar).', 'info');
}

function guardarListaMiembros() {
  if (!miembrosPendientesSheets) {
    mostrarNotificacion('No hay cambios pendientes en la lista.', 'info');
    return;
  }
  mostrarConfirmacion({
    titulo: 'Guardar miembros',
    mensaje: '¿Guardar la lista de miembros en la DB?',
    sub: 'Se reemplazara la lista actual con los cambios.',
    callback: () => sincronizarConDb(false)
  });
}

function descartarCambiosMiembros() {
  if (!miembrosPendientesSheets) return;
  mostrarConfirmacion({
    titulo: 'Descartar cambios',
    mensaje: '¿Descartar los cambios en la lista de miembros?',
    callback: () => {
      miembros = JSON.parse(JSON.stringify(miembrosCopiaOriginal));
      guardarMiembros();
      miembrosPendientesSheets = false;
      barraMiembros.classList.remove('activa');
      actualizarVistaMiembros();
      renderDiaActual();
      guardarPendientes();
      actualizarBarraConexion();
      mostrarNotificacion('Cambios de miembros descartados.', 'info');
    }
  });
}

function calcularDesglosePorMiembro(fecha) {
  const porMiembro = {};
  const fechaNorm = normalizarFecha(fecha);
  datos.filas.forEach((f) => {
    if (!f.nombre) return;
    if (!porMiembro[f.nombre]) {
      porMiembro[f.nombre] = {
        gasEntregadaHoy: 0,
        pendienteTotal: 0,
        rango: f.rango
      };
    }
    const gas = gasolinaFila(f);
    porMiembro[f.nombre].rango = f.rango;

    const fechaEntregaNorm = normalizarFecha(f.fechaEntregado);
    if (f.entregado && fechaEntregaNorm === fechaNorm) {
      porMiembro[f.nombre].gasEntregadaHoy += gas;
    }
    if (!f.entregado) {
      porMiembro[f.nombre].pendienteTotal += gas;
    }
  });
  return porMiembro;
}

function generarReporteTexto() {
  const fecha = fechaHoy();
  const rendimiento = calcularRendimientoDeDia(fecha);
  const perdida = 100 - rendimiento;
  const desglose = calcularDesglosePorMiembro(fecha);
  const estado = obtenerEstadoDia(fecha);
  const ahora = new Date();
  const fechaHora = ahora.toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });

  let texto = 'Registro refinación\n';
  texto += 'Fecha del reporte: ' + fecha + '\n';
  texto += '========================================\n\n';
  texto += 'PARAMETROS:\n';
  texto += '   Rendimiento: ' + formatearDecimal(rendimiento) + '%\n';
  texto += '   Perdida: ' + formatearDecimal(perdida) + '%\n\n';
  texto += 'ESTADO DEL DEPOSITO Y BASE:\n';
  texto += '   Crudo: ' + formatearLitros(estado.deposito) + '\n';
  texto += '   Refinado: ' + formatearLitros(estado.refinado) + '\n';
  texto += '   Base: ' + formatearLitros(estado.base) + '\n\n';
  texto += 'DETALLE POR MIEMBRO:\n';
  texto += '----------------------------------------\n';

  const nombresOrdenados = Object.keys(desglose).sort((a, b) => a.localeCompare(b));
  if (nombresOrdenados.length === 0) {
    texto += '   (Sin recolecciones registradas)\n';
  } else {
    nombresOrdenados.forEach((nombre) => {
      const d = desglose[nombre];
      texto += '**' + nombre + '** [' + d.rango + ']\n';
      texto += '   Entregada hoy: ' + formatearLitros(d.gasEntregadaHoy) + '\n';
      texto += '   Pendiente total: ' + formatearLitros(d.pendienteTotal) + '\n\n';
    });
  }

  texto += '========================================\n';
  texto += 'Generado: ' + fechaHora + ' hora Colombia\n';
  return texto;
}

function generarEmbedDiscord(nombreReportante) {
  const fecha = fechaHoy();
  const rendimiento = calcularRendimientoDeDia(fecha);
  const perdida = 100 - rendimiento;
  const desglose = calcularDesglosePorMiembro(fecha);
  const estado = obtenerEstadoDia(fecha);
  const lineas = [];

  const nombresOrdenados = Object.keys(desglose).sort((a, b) => a.localeCompare(b));
  nombresOrdenados.forEach((nombre) => {
    const d = desglose[nombre];
    let linea = '**' + nombre + '** [' + d.rango + ']\n';
    linea += '> Entregada hoy: **' + formatearLitros(d.gasEntregadaHoy) + '**\n';
    linea += '> Pendiente total: **' + formatearLitros(d.pendienteTotal) + '**';
    lineas.push(linea);
  });

  const detalle = lineas.length > 0 ? lineas.join('\n\n') : 'Sin recolecciones registradas.';

  const embed = {
    title: 'Registro refinación · ' + fecha,
    color: 0xd0d0d0,
    fields: [
      { name: 'Parametros', value: '> Rendimiento: **' + formatearDecimal(rendimiento) + '%**\n> Perdida: **' + formatearDecimal(perdida) + '%**', inline: false },
      { name: 'Detalle por miembro', value: detalle.length > 1024 ? detalle.substring(0, 1020) + '\n...' : detalle, inline: false },
      { name: 'Crudo deposito', value: '**' + formatearLitros(estado.deposito) + '**', inline: true },
      { name: 'Refinado deposito', value: '**' + formatearLitros(estado.refinado) + '**', inline: true },
      { name: 'Base deposito', value: '**' + formatearLitros(estado.base) + '**', inline: true }
    ],
    footer: { text: 'Unidad S.W.A.T · por ' + (nombreReportante || 'Anonimo') },
    timestamp: new Date().toISOString()
  };

  if (IMAGEN_EMBED && IMAGEN_EMBED.startsWith('https://')) {
    embed.thumbnail = { url: IMAGEN_EMBED };
  }

  return { embeds: [embed] };
}

async function abrirModalReporte() {
  const fecha = fechaHoy();
  renderDiaActual();

  sincronizarEstadoDesdeDom(fecha);
  sincronizarParametrosDesdeDom(fecha);
  sincronizarFilasDesdeDom(fecha);
  guardarDatos();

  modalOverlay.classList.add('activa');
  vistaPreviaReporte.textContent = 'Consultando...';
  establecerCargando(true);
  try {
    await refrescarDesdeDbParaReporte();
    vistaPreviaReporte.textContent = generarReporteTexto();
  } finally {
    establecerCargando(false);
  }
}

function cerrarModal() { modalOverlay.classList.remove('activa'); }

async function copiarReporte() {
  const t = vistaPreviaReporte.textContent;
  try { await navigator.clipboard.writeText(t); mostrarNotificacion('Reporte copiado.', 'exito'); }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = t;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta); mostrarNotificacion('Reporte copiado.', 'exito');
  }
}

function descargarArchivo(contenido, nombre) {
  const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = nombre;
  document.body.appendChild(link); link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function descargarCsv() {
  const fecha = fechaHoy();
  const p = datos.parametrosPorDia[fecha];
  const e = obtenerEstadoDia(fecha);
  const rendimiento = calcularRendimientoDeDia(fecha);
  const perdida = (p && p.deposito > 0) ? 100 - rendimiento : 0;
  let csv = 'Fecha;Hora;Nombre;Rango;Bruto (L);Neto (L);% Rango;Recompensa (L);Entregado;Fecha pago\n';
  const filasDia = filasDelDia(fecha).sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
  filasDia.forEach((f) => {
    const bruto = numero(f.bruto);
    const neto = netoFila(f);
    const porc = porcentajeFila(f);
    const gas = gasolinaFila(f);
    csv += f.fecha + ';' + (f.hora || '') + ';' + f.nombre + ';' + f.rango + ';' +
           formatearNumero(bruto) + ';' + formatearNumero(neto) + ';' +
           formatearNumero(porc) + ';' + formatearNumero(gas) + ';' +
           (f.entregado ? 'Si' : 'No') + ';' + (f.fechaEntregado || '') + '\n';
  });
  csv += 'TOTALES;;;;;' + totalCrudo.textContent + ';' + totalNeto.textContent + ';;' + totalGasolina.textContent + ';;\n';
  csv += '\nParametros;Deposito (L);' + formatearNumero(p ? p.deposito : 0) + '\n';
  csv += 'Parametros;Produccion estimada (L);' + formatearNumero(p ? p.produccion : 0) + '\n';
  csv += 'Parametros;Rendimiento (%);' + formatearDecimal(rendimiento) + '\n';
  csv += 'Parametros;Perdida (%);' + formatearDecimal(perdida) + '\n';
  csv += 'Estado;Crudo;' + formatearNumero(e.deposito) + '\n';
  csv += 'Estado;Refinado;' + formatearNumero(e.refinado) + '\n';
  csv += 'Estado;Base;' + formatearNumero(e.base) + '\n';
  descargarArchivo(csv, 'reporte_swat_' + fecha + '.csv');
  mostrarNotificacion('CSV descargado.', 'exito');
}

function importarCsv() { entradaCsv.click(); }

function procesarCsvImportado(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const contenido = e.target.result;
      const lineas = contenido.split(/\r?\n/).filter((l) => l.trim() !== '');
      if (lineas.length < 2) { mostrarNotificacion('CSV vacio o invalido.', 'error'); return; }

      const fecha = fechaHoy();
      const idsDia = filasDelDia(fecha).map((f) => f.id);
      idsDia.forEach((id) => {
        datos.filas = datos.filas.filter((x) => x.id !== id);
        marcarFilaPendiente(id);
      });
      fechasFilasPendientes.add(fecha);

      let importadas = 0;
      let parametros = null;
      let estado = null;
      for (let i = 1; i < lineas.length; i++) {
        const partes = lineas[i].split(';');
        if (partes.length >= 10 && partes[0].match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [f, h, nom, ran, br, ne, po, ga, en, fe] = partes;
          const nuevoId = generarIdUnico();
          datos.filas.push({
            id: nuevoId, fecha: f, hora: h, nombre: nom,
            rango: ran || 'Recolector',
            bruto: numero(br),
            entregado: (en || '').toLowerCase() === 'si',
            fechaEntregado: (fe || '').trim(),
            _gasolinaSheet: numero(ga),
            _netoSheet: numero(ne),
            _porcentajeSheet: numero(po)
          });
          marcarFilaPendiente(nuevoId);
          importadas++;
        } else if (partes[0] === 'Parametros') {
          const clave = partes[1];
          const valor = numero(partes[2]);
          if (!parametros) parametros = {};
          if (clave.indexOf('Deposito') >= 0) parametros.deposito = valor;
          if (clave.indexOf('Produccion') >= 0) parametros.produccion = valor;
        } else if (partes[0] === 'Estado') {
          const clave = partes[1];
          const valor = numero(partes[2]);
          if (!estado) estado = {};
          if (clave === 'Crudo' || clave === 'Deposito') estado.deposito = valor;
          if (clave === 'Refinado') estado.refinado = valor;
          if (clave === 'Base') estado.base = valor;
        }
      }
      if (parametros) datos.parametrosPorDia[fecha] = { deposito: parametros.deposito || 0, produccion: parametros.produccion || 0, _tocado: true };
      if (estado) {
        datos.estadoPorDia[fecha] = { deposito: estado.deposito || 0, refinado: estado.refinado || 0, base: estado.base || 0, hora: horaActual(), _tocado: true };
        marcarEstadoPendiente(fecha);
      }
      guardarDatos();
      guardarPendientes();
      renderDiaActual();
      refrescarVistaPreviaReporte();
      actualizarHistorial();
      actualizarResumen();

      mostrarNotificacion('CSV importado: ' + importadas + ' filas.', 'exito');
    } catch (err) {
      mostrarNotificacion('Error al leer CSV: ' + err.message, 'error');
    }
    entradaCsv.value = '';
  };
  reader.readAsText(file, 'UTF-8');
}

function exportarCsvFiltrado() {
  const lista = obtenerHistorialFiltrado(true);
  if (lista.length === 0) { mostrarNotificacion('No hay datos con esos filtros.', 'error'); return; }
  let csv = 'Fecha;Hora;Nombre;Rango;Bruto (L);Neto (L);% Rango;Recompensa (L);Beneficio (L);Entregado;Fecha pago\n';
  lista.forEach((d) => {
    csv += d.fecha + ';' + (d.hora || '') + ';' + d.nombre + ';' + d.rango + ';' +
           formatearNumero(d.bruto) + ';' + formatearNumero(d.neto) + ';' +
           formatearNumero(d.porcentaje) + ';' + formatearNumero(d.gasolina) + ';' +
           formatearNumero(d.beneficio) + ';' +
           (d.entregado ? 'Si' : 'No') + ';' + (d.fechaEntregado || '') + '\n';
  });
  descargarArchivo(csv, 'historial_swat_' + fechaHoy() + '.csv');
  mostrarNotificacion('CSV exportado.', 'exito');
}

async function enviarADiscord() {
  const url = entradaWebhook.value.trim();
  if (!url) { mostrarNotificacion('No has configurado un Webhook.', 'error'); return; }
  if (!url.startsWith('https://discord.com/api/webhooks/')) {
    mostrarNotificacion('URL de Webhook invalida.', 'error'); return;
  }

  const fecha = fechaHoy();

  mostrarConfirmacion({
    titulo: 'Enviar reporte a Discord',
    mensaje: '¿Quién hace el reporte?',
    sub: 'Se enviara el reporte del dia ' + fecha + ' (hoy).',
    input: true,
    inputPlaceholder: 'Tu nombre',
    callback: async (nombreReportante) => {
      if (!nombreReportante || !nombreReportante.trim()) {
        mostrarNotificacion('Debes indicar quien hace el reporte.', 'error');
        return;
      }

      establecerCargando(true);
      mostrarNotificacion('Consultando...', 'info');

      let existeReporte = false;
      try {
        const respCheck = await enviarPeticion('leer_recolecciones');
        if (respCheck.result === 'success') {
          const fechaNorm = normalizarFecha(fecha);
          existeReporte = (respCheck.filas || []).some((f) => normalizarFecha(f.fecha) === fechaNorm);
          if (!existeReporte) {
            const localesSincronizadas = datos.filas.filter((f) =>
              normalizarFecha(f.fecha) === fechaNorm && !filasPendientesSheets[f.id]
            );
            existeReporte = localesSincronizadas.length > 0;
          }
        }
      } catch (e) {
        console.warn('No se pudo verificar reporte previo:', e);
      } finally {
        establecerCargando(false);
      }

      if (existeReporte) {
        mostrarConfirmacion({
          titulo: 'Reporte ya existente',
          mensaje: 'Ya existe un reporte para el día ' + fecha + '.',
          sub: 'Se BORRARÁ el reporte anterior y se reemplazará con los datos actuales. ¿Estás seguro de enviarlo?',
          callback: async () => {
            await enviarReporteFinal(url, nombreReportante.trim(), fecha);
          }
        });
      } else {
        mostrarConfirmacion({
          titulo: 'Confirmar envío',
          mensaje: '¿Desea hacer el reporte del día ' + fecha + '?',
          sub: 'Se enviará a Discord y se guardará en la DB.',
          callback: async () => {
            await enviarReporteFinal(url, nombreReportante.trim(), fecha);
          }
        });
      }
    }
  });
}

async function enviarReporteFinal(url, nombreReportante, fecha) {
  mostrarNotificacion('Enviando reporte a Discord...', 'info');
  establecerCargando(true);

  sincronizarFilasDesdeDom(fecha);
  sincronizarEstadoDesdeDom(fecha);
  sincronizarParametrosDesdeDom(fecha);

  datos.filas.forEach((f) => { if (f.fecha === fecha) filasPendientesSheets[f.id] = true; });
  fechasFilasPendientes.add(fecha);
  marcarEstadoPendiente(fecha);
  guardarDatos();
  guardarPendientes();

  let exito = false;
  try {
    exito = await sincronizarConDb(true, true);
  } catch (e) {
    console.warn('Error sincronizando:', e);
  }

  if (!exito) {
    establecerCargando(false);
    mostrarNotificacion('Error al guardar en la DB. NO se envió a Discord.', 'error');
    return;
  }

  const payload = generarEmbedDiscord(nombreReportante);
  try {
    const r = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (r.ok || r.status === 204) {
      mostrarNotificacion('Reporte enviado a Discord.', 'exito');
    } else {
      const t = await r.text();
      mostrarNotificacion('Error (' + r.status + '): ' + t.substring(0, 100), 'error');
    }
  } catch (e) {
    mostrarNotificacion('Error de conexion: ' + e.message, 'error');
  } finally {
    establecerCargando(false);
  }
}

function cambiarVista(id) {
  if (id !== 'vista-historial' && cambiosPendientes.length > 0) {
    mostrarConfirmacion({
      titulo: 'Cambios pendientes',
      mensaje: '¿Tienes cambios pendientes sin guardar en Reportes?',
      sub: 'Si sales, se perderan. Continuar?',
      callback: () => {
        cambiosPendientes = [];
        actualizarBarraPendientes();
        ejecutarCambioVista(id);
      }
    });
    return;
  }
  ejecutarCambioVista(id);
}

function ejecutarCambioVista(id) {
  document.querySelectorAll('.vista').forEach((v) => v.classList.remove('activa'));
  document.querySelectorAll('.boton-pestana').forEach((b) => b.classList.remove('activa'));
  consultar(id).classList.add('activa');
  document.querySelector('.boton-pestana[data-vista="' + id + '"]').classList.add('activa');
  if (id === 'vista-historial') setTimeout(() => actualizarHistorial(), 50);
  if (id === 'vista-resumen') {
    setTimeout(() => actualizarResumen(), 50);
    setTimeout(() => actualizarResumen(), 300);
  }
}

function mostrarLogin() {
  pantallaLogin.classList.add('activa');
  tokenAcceso.value = '';
  loginError.textContent = '';
  setTimeout(() => tokenAcceso.focus(), 200);
}

function ocultarLogin() {
  pantallaLogin.classList.remove('activa');
}

function mostrarContenido() {
  contenidoPrincipal.style.display = 'block';
  barraConexion.style.display = 'flex';
  pestanasPrincipales.style.display = 'flex';
  contenedorPrincipal.style.display = 'block';
}

function ocultarContenido() {
  contenidoPrincipal.style.display = 'none';
  barraConexion.style.display = 'none';
  pestanasPrincipales.style.display = 'none';
  contenedorPrincipal.style.display = 'none';
}

async function validarToken(t) {
  try {
    const r = await fetch(URL_DB, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ accion: 'validar_token', token: t })
    });
    if (!r.ok) return false;
    const json = await r.json();
    return json.result === 'success' && json.valido === true;
  } catch (e) {
    return false;
  }
}

function iniciarPrecarga() {
  const pasos = [
    { texto: 'Iniciando sistema...', pct: 10 },
    { texto: 'Cargando modulos...', pct: 30 },
    { texto: 'Verificando seguridad...', pct: 55 },
    { texto: 'Preparando interfaz...', pct: 80 },
    { texto: 'Listo', pct: 100 }
  ];
  let i = 0;
  const intervalo = setInterval(() => {
    if (i >= pasos.length) {
      clearInterval(intervalo);
      setTimeout(() => {
        pantallaCarga.classList.add('oculta');
        iniciarFlujoAcceso();
      }, 400);
      return;
    }
    cargaTexto.textContent = pasos[i].texto;
    cargaProgreso.style.width = pasos[i].pct + '%';
    i++;
  }, 380);
}

async function iniciarFlujoAcceso() {
  const tokenGuardado = obtenerTokenGuardado();
  if (tokenGuardado) {
    const valido = await validarToken(tokenGuardado);
    if (valido) {
      tokenValido = true;
      ocultarLogin();
      mostrarContenido();
      inicializar();
      return;
    }
    limpiarToken();
  }
  ocultarContenido();
  mostrarLogin();
}

async function intentarAcceder() {
  const t = tokenAcceso.value.trim();
  if (!t) {
    loginError.textContent = 'Ingresa el token de seguridad.';
    return;
  }
  loginError.textContent = 'Verificando...';
  botonAcceder.disabled = true;

  const valido = await validarToken(t);
  botonAcceder.disabled = false;

  if (valido) {
    guardarToken(t);
    tokenValido = true;
    loginError.textContent = '';
    ocultarLogin();
    mostrarContenido();
    inicializar();
  } else {
    loginError.textContent = 'Token invalido. Intenta de nuevo.';
    tokenAcceso.value = '';
    tokenAcceso.focus();
  }
}

function cerrarSesion() {
  mostrarConfirmacion({
    titulo: 'Cerrar sesión',
    mensaje: '¿Cerrar la sesión actual?',
    sub: 'Se borrará el token guardado y volverás al login.',
    callback: () => {
      limpiarToken();
      tokenValido = false;
      ocultarContenido();
      mostrarLogin();
    }
  });
}

function inicializar() {
  cargarMiembros();
  miembrosCopiaOriginal = JSON.parse(JSON.stringify(miembros));
  actualizarVistaMiembros();

  cargarDatos();
  cargarPendientes();
  entradaWebhook.value = datos.webhook || WEBHOOK_POR_DEFECTO;

  textoFechaHoy.textContent = fechaHoyMostrar();
  renderDiaActual();
  actualizarBarraConexion();

  const datosGuardados = localStorage.getItem('swat_datos');
  const hayFilasLocales = datos.filas && datos.filas.length > 0;
  const hayMiembrosLocales = miembros && miembros.length > 0;
  const esPrimeraVez = !datosGuardados || (!hayFilasLocales && !hayMiembrosLocales);

  if (esPrimeraVez) {
    setTimeout(() => {
      cargarDesdeDb(true).then((ok) => {
        if (ok) {
          mostrarNotificacion('Datos cargados automaticamente desde la DB.', 'exito');
        }
      });
    }, 300);
  }

  depositoInput.addEventListener('input', () => {
    if (numero(depositoInput.value) < 0) { mostrarNotificacion('El campo "Deposito" no puede ser negativo.', 'error'); depositoInput.value = 0; }
    const fecha = fechaHoy();
    const p = obtenerParametrosDia(fecha, true);
    p.deposito = numero(depositoInput.value);
    p._tocado = true;
    datos.filas.forEach((f) => {
      if (f.fecha === fecha) {
        f._gasolinaSheet = undefined;
        f._netoSheet = undefined;
        f._porcentajeSheet = undefined;
        filasPendientesSheets[f.id] = true;
      }
    });
    fechasFilasPendientes.add(fecha);
    fechasEstadoPendientes.add(fecha);
    estadoPendienteSheets = true;
    guardarDatos();
    guardarPendientes();
    recalcularTodo();
    actualizarBarraConexion();
  });
  produccionInput.addEventListener('input', () => {
    if (numero(produccionInput.value) < 0) { mostrarNotificacion('El campo "Produccion" no puede ser negativo.', 'error'); produccionInput.value = 0; }
    const fecha = fechaHoy();
    const p = obtenerParametrosDia(fecha, true);
    p.produccion = numero(produccionInput.value);
    p._tocado = true;
    datos.filas.forEach((f) => {
      if (f.fecha === fecha) {
        f._gasolinaSheet = undefined;
        f._netoSheet = undefined;
        f._porcentajeSheet = undefined;
        filasPendientesSheets[f.id] = true;
      }
    });
    fechasFilasPendientes.add(fecha);
    fechasEstadoPendientes.add(fecha);
    estadoPendienteSheets = true;
    guardarDatos();
    guardarPendientes();
    recalcularTodo();
    actualizarBarraConexion();
  });
  porcentajeRecolectorInput.addEventListener('input', () => {
    if (numero(porcentajeRecolectorInput.value) < 0) { mostrarNotificacion('El campo "Porcentaje Recolector" no puede ser negativo.', 'error'); porcentajeRecolectorInput.value = 0; }
    const fecha = fechaHoy();
    datos.porcentajes.Recolector = numero(porcentajeRecolectorInput.value);
    const pd = obtenerPorcentajesDia(fecha, true);
    pd.Recolector = datos.porcentajes.Recolector;
    pd._tocado = true;
    datos.filas.forEach((f) => {
      if (f.fecha === fecha) {
        f._gasolinaSheet = undefined;
        f._netoSheet = undefined;
        f._porcentajeSheet = undefined;
        filasPendientesSheets[f.id] = true;
      }
    });
    fechasFilasPendientes.add(fecha);
    fechasEstadoPendientes.add(fecha);
    estadoPendienteSheets = true;
    guardarDatos();
    guardarPendientes();
    recalcularTodo();
    actualizarBarraConexion();
  });
  porcentajeCamioneroInput.addEventListener('input', () => {
    if (numero(porcentajeCamioneroInput.value) < 0) { mostrarNotificacion('El campo "Porcentaje Camionero" no puede ser negativo.', 'error'); porcentajeCamioneroInput.value = 0; }
    const fecha = fechaHoy();
    datos.porcentajes.Camionero = numero(porcentajeCamioneroInput.value);
    const pd = obtenerPorcentajesDia(fecha, true);
    pd.Camionero = datos.porcentajes.Camionero;
    pd._tocado = true;
    datos.filas.forEach((f) => {
      if (f.fecha === fecha) {
        f._gasolinaSheet = undefined;
        f._netoSheet = undefined;
        f._porcentajeSheet = undefined;
        filasPendientesSheets[f.id] = true;
      }
    });
    fechasFilasPendientes.add(fecha);
    fechasEstadoPendientes.add(fecha);
    estadoPendienteSheets = true;
    guardarDatos();
    guardarPendientes();
    recalcularTodo();
    actualizarBarraConexion();
  });
  estadoDeposito.addEventListener('input', () => {
    if (numero(estadoDeposito.value) < 0) { mostrarNotificacion('El campo "Deposito actual" no puede ser negativo.', 'error'); estadoDeposito.value = 0; }
    sincronizarEstadoDesdeDom(fechaHoy());
    datos.estadoPorDia[fechaHoy()].hora = horaActual();
    marcarEstadoPendiente(fechaHoy());
    guardarDatos();
    refrescarVistaPreviaReporte();
  });
  estadoRefinado.addEventListener('input', () => {
    if (numero(estadoRefinado.value) < 0) { mostrarNotificacion('El campo "Gasolina refinada" no puede ser negativo.', 'error'); estadoRefinado.value = 0; }
    sincronizarEstadoDesdeDom(fechaHoy());
    datos.estadoPorDia[fechaHoy()].hora = horaActual();
    marcarEstadoPendiente(fechaHoy());
    guardarDatos();
    refrescarVistaPreviaReporte();
  });
  estadoBase.addEventListener('input', () => {
    if (numero(estadoBase.value) < 0) { mostrarNotificacion('El campo "Gasolina en base" no puede ser negativo.', 'error'); estadoBase.value = 0; }
    sincronizarEstadoDesdeDom(fechaHoy());
    datos.estadoPorDia[fechaHoy()].hora = horaActual();
    marcarEstadoPendiente(fechaHoy());
    guardarDatos();
    refrescarVistaPreviaReporte();
  });

  entradaWebhook.addEventListener('input', () => {
    datos.webhook = entradaWebhook.value;
    guardarDatos();
  });

  consultar('botonAgregarFila').addEventListener('click', () => agregarFila());
  consultar('botonEnviarReporte').addEventListener('click', abrirModalReporte);
  consultar('botonMarcarTodo').addEventListener('click', () => {
    mostrarConfirmacion({
      titulo: 'Marcar todo entregado',
      mensaje: '¿Marcar todas las filas de hoy como entregadas?',
      callback: () => {
        const fecha = fechaHoy();
        datos.filas.forEach((f) => {
          if (f.fecha === fecha) {
            f.entregado = true;
            f.fechaEntregado = fecha;
            marcarFilaPendiente(f.id);
          }
        });
        guardarDatos();
        renderDiaActual();
        mostrarNotificacion('Filas marcadas como entregadas.', 'exito');
      }
    });
  });
  consultar('botonLimpiar').addEventListener('click', limpiarFormulario);

  consultar('botonFiltrar').addEventListener('click', aplicarFiltros);
  consultar('botonLimpiarFiltros').addEventListener('click', () => {
    filtroDesde.value = ''; filtroHasta.value = '';
    filtroMiembro.value = ''; filtroEstado.value = '';
    filtrosAplicados = { desde: '', hasta: '', miembro: '', estado: '' };
    actualizarHistorial();
  });
  consultar('botonExportarFiltrado').addEventListener('click', exportarCsvFiltrado);
  consultar('botonActualizarDia').addEventListener('click', aplicarCambiosPendientes);
  consultar('botonDescartarCambios').addEventListener('click', descartarCambiosPendientes);
  consultar('botonAgregarMiembro').addEventListener('click', agregarMiembro);
  consultar('botonGuardarMiembros').addEventListener('click', guardarListaMiembros);
  consultar('botonDescartarMiembros').addEventListener('click', descartarCambiosMiembros);

  consultar('botonCerrarModal').addEventListener('click', cerrarModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) cerrarModal(); });
  consultar('botonRefrescarReporte').addEventListener('click', async () => {
    if (cargando) return;
    vistaPreviaReporte.textContent = 'Consultando...';
    establecerCargando(true);
    try {
      await refrescarDesdeDbParaReporte();
      vistaPreviaReporte.textContent = generarReporteTexto();
      mostrarNotificacion('Reporte actualizado.', 'exito');
    } finally {
      establecerCargando(false);
    }
  });
  consultar('botonCopiarReporte').addEventListener('click', copiarReporte);
  consultar('botonDescargarCsv').addEventListener('click', descargarCsv);
  consultar('botonImportarCsv').addEventListener('click', importarCsv);
  consultar('botonEnviarDiscord').addEventListener('click', enviarADiscord);
  entradaCsv.addEventListener('change', procesarCsvImportado);

  consultar('botonCargarDb').addEventListener('click', () => cargarDesdeDb(false));
  consultar('botonCerrarSesion').addEventListener('click', cerrarSesion);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('activa')) cerrarModal();
  });

  document.querySelectorAll('.boton-pestana').forEach((btn) => {
    btn.addEventListener('click', () => cambiarVista(btn.dataset.vista));
  });

  let temporizadorResize;
  window.addEventListener('resize', () => {
    clearTimeout(temporizadorResize);
    temporizadorResize = setTimeout(() => {
      if (consultar('vista-resumen').classList.contains('activa')) actualizarResumen();
      if (consultar('vista-historial').classList.contains('activa')) actualizarHistorial();
    }, 1000);
  });

  setTimeout(() => {
    const hayPendientes = Object.keys(filasPendientesSheets).length > 0 ||
                          fechasFilasPendientes.size > 0 ||
                          fechasEstadoPendientes.size > 0 ||
                          estadoPendienteSheets ||
                          miembrosPendientesSheets;
    if (!hayPendientes) {
      conexionEstado = 'online';
      actualizarBarraConexion();
    }
  }, 2000);

  actualizarResumen();
}

document.addEventListener('DOMContentLoaded', () => {
  botonAcceder.addEventListener('click', intentarAcceder);
  tokenAcceso.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') intentarAcceder();
  });
  iniciarPrecarga();
});