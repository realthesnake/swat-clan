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
      mensaje: '¿Registrar la entrega completa de todas las filas de hoy?',
      sub: 'Se marcara cada fila con el total pendiente.',
      callback: () => {
        const fecha = fechaHoy();
        datos.filas.forEach((f) => {
          if (f.fecha === fecha) {
            const recompensa = gasolinaFila(f);
            const pagado = totalPagadoFila(f);
            const pendiente = Math.max(0, recompensa - pagado);
            if (pendiente > 0) {
              setPagoHoyPendiente(f, pendiente);
              marcarFilaPendiente(f.id);
            }
          }
        });
        guardarDatos();
        renderDiaActual();
        actualizarHistorial();
        actualizarResumen();
        actualizarBarraPendientes();
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

  actualizarBarraPendientes();
  actualizarResumen();
}

document.addEventListener('DOMContentLoaded', () => {
  botonAcceder.addEventListener('click', intentarAcceder);
  tokenAcceso.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') intentarAcceder();
  });
  iniciarPrecarga();
});
