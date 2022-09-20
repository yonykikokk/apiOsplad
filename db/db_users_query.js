const { connection } = require("./db_connection")

exports.verificarUsuarioConRemito = (nro_remito, dni_paciente) => {
    return `
        SELECT 
        personas.documento,
        personas.nombre,
        personas.apellido,
        remitos.numero,
        remitos.fexpedicion,
        tramites.numero_tramite_completo 
        FROM tramites_productos  
        INNER JOIN tramites ON tramites.id =tramites_productos.tramites_id 
        INNER JOIN pacientes ON pacientes.id =tramites.pacientes_id  
        INNER JOIN personas ON personas.id =pacientes.personas_id  
        INNER JOIN ordenes_compras ON ordenes_compras.tramites_id =tramites.id 
        INNER JOIN remitos ON remitos.orden_compras_id =ordenes_compras.id
        and remitos.numero ="${nro_remito}" and personas.documento = "${dni_paciente}" 
        LIMIT 1
        `
}
exports.obtenerInformacionDelTramite = (nro_tramite_completo, tramo) => {
    console.log(`SELECT
    personas.nombre,
    personas.documento as dni,
    tramites.numero_tramite_completo,
    tramites.tramites_id,
    remitos.numero as nro_remito,
    proveedores.email as proveedor,
    bo_perfiles.denominacion,
    tramites.numero_extendido 
    from tramites 
    inner join pacientes on pacientes.id=tramites.pacientes_id 
    inner join personas on personas.id=pacientes.personas_id  
    inner join ordenes_compras on ordenes_compras.tramites_id =tramites.tramites_id  
    inner join remitos on remitos.orden_compras_id =ordenes_compras.id  
    inner join proveedores on proveedores.id =ordenes_compras.proveedores_id  
    inner join bo_usuarios_proveedores on bo_usuarios_proveedores.proveedores_id =proveedores.id  
    inner join bo_usuarios on bo_usuarios.id =bo_usuarios_proveedores.bo_usuarios_id  
    inner join bo_usuarios_perfiles on bo_usuarios_perfiles.bo_usuario_id  =bo_usuarios.id
    inner join bo_perfiles on bo_perfiles.id  =bo_usuarios_perfiles.bo_perfil_id 
    and tramites.numero_tramite_completo ="${nro_tramite_completo}" 
    and tramites.numero_extendido like "${tramo}"
    and bo_perfiles.id =11
    limit 1`)
    return `SELECT
        personas.nombre,
        personas.documento as dni,
        tramites.numero_tramite_completo,
        tramites.tramites_id,
        remitos.numero as nro_remito,
        proveedores.email as proveedor,
        bo_perfiles.denominacion,
        tramites.numero_extendido 
        from tramites 
        inner join pacientes on pacientes.id=tramites.pacientes_id 
        inner join personas on personas.id=pacientes.personas_id  
        inner join ordenes_compras on ordenes_compras.tramites_id =tramites.tramites_id  
        inner join remitos on remitos.orden_compras_id =ordenes_compras.id  
        inner join proveedores on proveedores.id =ordenes_compras.proveedores_id  
        inner join bo_usuarios_proveedores on bo_usuarios_proveedores.proveedores_id =proveedores.id  
        inner join bo_usuarios on bo_usuarios.id =bo_usuarios_proveedores.bo_usuarios_id  
        inner join bo_usuarios_perfiles on bo_usuarios_perfiles.bo_usuario_id  =bo_usuarios.id
        inner join bo_perfiles on bo_perfiles.id  =bo_usuarios_perfiles.bo_perfil_id 
        and tramites.numero_tramite_completo ="${nro_tramite_completo}" 
        and tramites.numero_extendido like "${tramo}"
        and bo_perfiles.id =11
        limit 1`
}
