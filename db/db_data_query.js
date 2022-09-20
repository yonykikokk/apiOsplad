const { connection } = require("./db_connection");

exports.obtenerDatosDeTramite = (numero_tramite_completo, nro_remito) => {
  return `SELECT 
        remitos.fexpedicion,
        remitos.numero as nro_remito,
        farmacias.denominacion as farmacia,
        farmacias_sucursales.domicilio  as direccion_entrega,
        remitos.frecibido_farmacia as fecha_recibo
        FROM   
        remitos
        INNER JOIN ordenes_compras ON ordenes_compras.id=remitos.orden_compras_id
        INNER JOIN tramites ON tramites.id=ordenes_compras.tramites_id
        INNER JOIN farmacias ON farmacias.id =tramites.farmacias_sucursales_id 
        INNER JOIN farmacias_sucursales ON farmacias_sucursales.farmacias_id =farmacias.id 
        and tramites.numero_tramite_completo ="${numero_tramite_completo}" and remitos.numero = "${nro_remito}";`;
};

//Busca la Orden de Compra segun nro de tramite y tramo
exports.getInforOC = (numero_tramite_completo, tramo) => {
 return tramo 
  ? `SELECT 
  cotizaciones_productos.id AS item,
  farmacias_sucursales.denominacion AS farmacia,
  concat(personas.nombre,' ',personas.apellido) AS paciente,   
  ordenes_compras.fnotificacion_expedicion as fechaNotificacion,
  productos.comercial  as comercial,
  productos_generico.denominacion as generico,
  productos_presentacion.denominacion as presentacion,
  tramites_productos.cantidad
 
  FROM  tramites
  INNER JOIN pacientes ON pacientes.id =tramites.pacientes_id 
  INNER JOIN farmacias_sucursales  ON farmacias_sucursales.id =tramites.farmacias_sucursales_id 
  INNER JOIN personas ON personas.id =pacientes.personas_id  
  INNER JOIN tramites_productos ON tramites_productos.tramites_id = tramites.id
  INNER JOIN productos ON productos.id= tramites_productos.productos_id
  INNER JOIN productos_generico ON  productos_generico.id= productos.productos_generico_id 
  INNER JOIN productos_presentacion ON productos_presentacion.id =productos.productos_presentacion_id   
  INNER JOIN ordenes_compras ON ordenes_compras.tramites_id  =tramites.id  
  AND tramites.numero_tramite_completo ="${numero_tramite_completo}" AND tramites.numero_extendido ="${tramo}"
  INNER JOIN cotizaciones_productos  ON cotizaciones_productos.cotizaciones_id = ordenes_compras.cotizaciones_id and cotizaciones_productos.tramites_productos_id = tramites_productos.id;`
    : `SELECT 
    cotizaciones_productos.id AS item,
    farmacias_sucursales.denominacion AS farmacia,
    concat(personas.nombre,' ',personas.apellido) AS paciente,  
    tramites.numero_extendido,
    ordenes_compras.fnotificacion_expedicion as fechaNotificacion,
    productos.id, 
    productos.comercial as comercial,
    productos_generico.denominacion as generico,
    productos_presentacion.denominacion as presentacion,
    tramites_productos.cantidad

    FROM  tramites
    INNER JOIN pacientes ON pacientes.id =tramites.pacientes_id 
    INNER JOIN farmacias_sucursales  ON farmacias_sucursales.id =tramites.farmacias_sucursales_id 
    INNER JOIN personas ON personas.id =pacientes.personas_id  
    INNER JOIN tramites_productos ON tramites_productos.tramites_id = tramites.id
    INNER JOIN productos ON productos.id= tramites_productos.productos_id
    INNER JOIN productos_generico ON  productos_generico.id= productos.productos_generico_id 
    INNER JOIN productos_presentacion ON productos_presentacion.id =productos.productos_presentacion_id   
    INNER JOIN ordenes_compras ON ordenes_compras.tramites_id  =tramites.id  
    AND tramites.numero_tramite_completo ="${numero_tramite_completo}" and tramites.numero_extendido is NULL
    INNER JOIN cotizaciones_productos  ON cotizaciones_productos.cotizaciones_id = ordenes_compras.cotizaciones_id and cotizaciones_productos.tramites_productos_id = tramites_productos.id;`
}



//Obtiene el remito por nro remito y nro tramite
exports.getRemitoByNumeroAndTramite = (nroRemito, numeroTramiteCompleto) => {
  return `SELECT re.id as id_remito , re.numero as numero_remito ,
    re.remitos_estados_id , oc.id as orden_compra, oc.tramites_id as tramite_id,
    oc.fnotificacion_expedicion,oc.expedido_completo, oc.ordenes_compras_estados_id,
    oce.denominacion as estadoOC,   re2.estado_orden , re2.denominacion as estadoRemito,
    t.numero_tramite_completo
    FROM remitos re 
    INNER JOIN ordenes_compras oc  ON oc.id = re.orden_compras_id  
    INNER JOIN ordenes_compras_estados oce ON oce.id = oc.ordenes_compras_estados_id 
    INNER JOIN remitos_estados re2 ON re2.id =re.remitos_estados_id
    INNER JOIN tramites t ON t.id = oc.tramites_id  
    WHERE re.numero ="${nroRemito}" and t.numero_tramite_completo ="${numeroTramiteCompleto}" `;
};

exports.insertDetalleRemito = (
  gtin,  generico,  comercial,  presentacion,  cantidad,  comentario,  codigoRetiro,  numeroRemito,  itemId) => {
  return ` INSERT INTO leannec.detalle_remito
    (gtin, generico, comercial, presentacion,
    cantidad,comentario, codigo_retiro, numero_remito, item_id)
    VALUES 
    ('${gtin}','${generico}','${comercial}','${presentacion}', 
    '${cantidad}', '${comentario}','${codigoRetiro}','${numeroRemito}','${itemId}');`;
  };

  exports.getDetalleRemito = (nroRemito) => {
    return `SELECT gtin, comercial, presentacion, cantidad, comentario, numero_factura, codigo_retiro, item_id
      FROM detalle_remito WHERE numero_remito ="${nroRemito}"; `;
  };
