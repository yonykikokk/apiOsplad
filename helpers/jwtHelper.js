module.exports = function getFechaDeExpiracion() {
  let fecha_expiracion = new Date();
  fecha_expiracion.setDate(fecha_expiracion.getDate() + 1); //le agregamos un dia a la fecha

  //FORMATO segun api DD/MM/YYYY HH:MM:SS
  let fechaFormatada =
    [
      fecha_expiracion.getMonth() + 1,
      fecha_expiracion.getDate(),
      fecha_expiracion.getFullYear(),
    ].join("/") +
    " " +
    [
      fecha_expiracion.getHours(),
      fecha_expiracion.getMinutes(),
      fecha_expiracion.getSeconds(),
    ].join(":");

  return fechaFormatada;
};
