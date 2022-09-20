var express = require("express");
var router = express.Router();
const { connection } = require("../db/db_connection");
var jwt = require("jsonwebtoken");
var md5 = require("md5");

const getFechaDeExpiracion = require("../helpers/jwtHelper");

const {
  getInforOC,
  getRemitoByNumeroAndTramite,
  insertDetalleRemito,
  getDetalleRemito
} = require("../db/db_data_query");
const { verifyToken } = require("../middlewares/jwt");

//---------------------JOI-------------------------
//TODO: mover a middleware
const Joi = require("@hapi/joi");

const schemaLogin = Joi.object({
  user: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "com.ar", "ar"] },
    })
    .min(3)
    .max(50)
    .required()
    .empty()
    .messages({
      "string.email": "debe ser un usuario válido",
      "string.empty": `"user" no puede estar vacio`,
      "string.min": `"user" debe tener una longitud mínima de  {#limit}`,
      "string.max": `"user" debe tener una longitud máxima de  {#limit}`,
      "any.required": `"user" es un campo requerido`,
    }),
  password: Joi.string()
    .alphanum()
    .min(6) // verificar si es asi en la base
    .required()
    .messages({
      "string.alphanum": "debe contener solo letras y números",
      "string.empty": `"password" no puede estar vacio`,
      "string.min": `"password" debe tener una longitud mínima de {#limit}`,
      "string.max": `"password" debe tener una longitud máxima de  {#limit}`,
      "any.required": `"password" es un campo requerido`,
    }),
});

const schemaObtenerOC = Joi.object({
  dniPaciente: Joi.string()
    .regex(/^[0-9]+([.][0-9]+)?$/)
    .min(8)
    .max(8)
    .required()
    .messages({
      "string.regex": `"dniPaciente" debe ser numerico`,
      "string.empty": `"dniPaciente" no puede estar vacio`,
      "string.min": `"dniPaciente" debe tener una longitud mínima de {#limit}`,
      "string.max": `"dniPaciente" debe tener una longitud máxima de  {#limit}`,
      "any.required": `"dniPaciente" es un campo requerido`,
    }),
  proveedor: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "com.ar", "ar"] },
    })
    .min(3)
    .max(50)
    .required()
    .empty()
    .messages({
      "string.email": `"proveedor" debe ser un email válido`,
      "string.empty": `"proveedor" no puede estar vacio`,
      "string.min": `"proveedor" debe tener una longitud mínima de  {#limit}`,
      "string.max": `"proveedor" debe tener una longitud máxima de  {#limit}`,
      "any.required": `"proveedor" es un campo requerido`,
    }),
  nroTramiteCompleto: Joi.string()
    .min(6) //VER
    .required()
    .messages({
      "string.empty": `"nroTramiteCompleto" no puede estar vacio`,
      "string.min": `"nroTramiteCompleto" debe tener una longitud mínima de {#limit}`,
      "string.max": `"nroTramiteCompleto" debe tener una longitud máxima de  {#limit}`,
      "any.required": `"nroTramiteCompleto" es un campo requerido`,
    }),
});

const schemaVerDetalle = Joi.object({
  nroRemito: Joi.string().min(3).max(15).required().empty().messages({
    "string.empty": `"nroRemito" no puede estar vacio`,
    "string.min": `"nroRemito" debe tener una longitud mínima de  {#limit}`,
    "string.max": `"nroRemito" debe tener una longitud máxima de  {#limit}`,
    "any.required": `"nroRemito" es un campo requerido`,
  }),
  proveedor: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "com.ar", "ar"] },
    })
    .min(3)
    .max(50)
    .required()
    .empty()
    .messages({
      "string.email": `"proveedor" debe ser un email válido`,
      "string.empty": `"proveedor" no puede estar vacio`,
      "string.min": `"proveedor" debe tener una longitud mínima de  {#limit}`,
      "string.max": `"proveedor" debe tener una longitud máxima de  {#limit}`,
      "any.required": `"proveedor" es un campo requerido`,
    }),
});

const schemaCargarDetalle = Joi.object({
  nroTramiteCompleto: Joi.string()
    .min(6) //VER
    .required()
    .messages({
      "string.empty": `"nroTramiteCompleto" no puede estar vacio`,
      "string.min": `"nroTramiteCompleto" debe tener una longitud mínima de {#limit}`,
      "string.max": `"nroTramiteCompleto" debe tener una longitud máxima de  {#limit}`,
      "any.required": `"nroTramiteCompleto" es un campo requerido`,
    }),
  dniPaciente: Joi.string()
    .regex(/^[0-9]+([.][0-9]+)?$/)
    .min(8)
    .max(8)
    .required()
    .messages({
      "string.regex": `"dniPaciente" debe ser numerico`,
      "string.empty": `"dniPaciente" no puede estar vacio`,
      "string.min": `"dniPaciente" debe tener una longitud mínima de {#limit}`,
      "string.max": `"dniPaciente" debe tener una longitud máxima de  {#limit}`,
      "any.required": `"dniPaciente" es un campo requerido`,
    }),
  proveedor: Joi.string() //OK
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "com.ar", "ar"] },
    })
    .min(3)
    .max(50)
    .required()
    .empty()
    .messages({
      "string.email": `"proveedor" debe ser un email válido`,
      "string.empty": `"proveedor" no puede estar vacio`,
      "string.min": `"proveedor" debe tener una longitud mínima de  {#limit}`,
      "string.max": `"proveedor" debe tener una longitud máxima de  {#limit}`,
      "any.required": `"proveedor" es un campo requerido`,
    }),
  nroRemito: Joi.string().min(3).max(15).required().empty().messages({
    "string.empty": `"nroRemito" no puede estar vacio`,
    "string.min": `"nroRemito" debe tener una longitud mínima de  {#limit}`,
    "string.max": `"nroRemito" debe tener una longitud máxima de  {#limit}`,
    "any.required": `"nroRemito" es un campo requerido`,
  }),
  nroFactura: Joi.string() //Opcional?
    .min(3)
    .max(20)
    .optional()
    .messages({
      "string.empty": `"nroFactura" no puede estar vacio`,
      "string.min": `"nroFactura" debe tener una longitud mínima de  {#limit}`,
      "string.max": `"nroFactura" debe tener una longitud máxima de  {#limit}`,
      "any.required": `"nroFactura" es un campo requerido`,
    }),
  productosEntregados: Joi.array()
    .items(
      Joi.object({
        item: Joi.number().min(1).messages({
          "number.min": `"item" debe tener una longitud mínima de  {#limit}`,
        }),
        gtin: Joi.string()
          .allow("")
          .regex(/^[0-9]/)
          .messages({
            "string.regex": `"gtin" debe ser numerico`,
          }),
        generico: Joi.string()
          .when("gtin", {
            is: "",
            then: Joi.string(),
            otherwise: Joi.string().allow(""),
          })
          .messages({
            "string.when": `No debe ser vacio`,
          }),
        comercial: Joi.string()
          .when("gtin", {
            is: "",
            then: Joi.string(),
            otherwise: Joi.string().allow(""),
          })
          .messages({
            "string.when": `No debe ser vacio`,
          }),
        presentacion: Joi.string()
          .when("gtin", {
            is: "",
            then: Joi.string(),
            otherwise: Joi.string().allow(""),
          })
          .messages({
            "string.when": `No debe ser vacio`,
          }),
        cantidad: Joi.number()
          .greater(0)
          .positive()
          .min(1)
          .max(20) //Validar
          .required()
          .messages({
            "string.empty": `"cantidad" no puede estar vacio`,
            "number.greater": `"cantidad" debe ser mayor a {#limit}`,
            "number.positive": `"cantidad" debe ser un número positivo`,
            "string.min": `"cantidad" debe tener una longitud mínima de  {#limit}`,
            "string.max": `"cantidad" debe tener una longitud máxima de  {#limit}`,
            "any.required": `"cantidad" es un campo requerido`,
          }),
      })
    )
    .required(),
});

//-------------------LOGIN ---------------------------
router.post("/login", (req, res, next) => {
  let body = req.body;
  const { error, value } = schemaLogin.validate({
    user: body.user,
    password: body.password,
  });

  if (error) {
    res.status(422).json({
      error: "Error al consumir login",
      mensaje: error.message,
    });
  } else {
    try {
      connection.query(
        `SELECT * from bo_usuarios WHERE usuario ="${value.user
        }" and password ="${md5(value.password)}" LIMIT 1`,
        (err, rows, fields) => {
          if (err) next(err);
          console.log(rows);
          if (rows <= 0 || !rows) {
            res.status(401).json({ mensaje: "Usuario o password incorrecto." });
          } else {
            let data = rows[0];
            if (
              !data.feliminado &&
              data.habilitado &&
              data.bo_usuario_estado_id != 2
            ) {
              connection.query(
                `SELECT * from bo_usuarios 
            inner join bo_usuarios_perfiles bup on bup.bo_usuario_id =bo_usuarios.id
            and bup.bo_perfil_id =11 
            and usuario ="${value.user}" and password ="${md5(
                  value.password
                )}" LIMIT 1`,
                (err, rows, fields) => {
                  if (rows[0]) {
                    jwt.sign(
                      {
                        data: {
                          user: value.user,
                          password: md5(value.password),
                        },
                      },
                      process.env.SECRETKEY,
                      { expiresIn: "24h" },
                      (err, token) => {
                        //TODO: cambiar  expiresIn a 12h
                        let fecha_expiracion = getFechaDeExpiracion();
                        res.json({ token, fecha_expiracion });
                      }
                    );
                  } else {
                    //usuario que no es de expedicion
                    res.status(401).json({
                      mensaje:
                        "Solo los usuarios de perfil expedición tienen acceso a esta API.",
                    });
                  }
                }
              );
            } else {
              //usuario no habilitado, eliminado o suspendido
              res.status(401).json({
                mensaje:
                  "La cuenta con la que trata de acceder no se encuentra habilitada para operar.",
              });
            }
          }
        }
      );
    } catch (error) {
      console.log(res.error);
    }
  }
});

//-------------------OBTENER ORDEN DE COMPRA ---------------------------
router.get("/obtenerOrdenCompra", verifyToken, (req, res, next) => {
  jwt.verify(req.token, process.env.SECRETKEY, (error, userInfo) => {
    if (userInfo != undefined) {
      let user = userInfo.data.user;
      error
        ? res.status(401).json({
          error: "Acceso restringido",
          mensaje: "Inicie sesion para obtener un token y poder operar.",
        })
        : obtenerOrdenDeCompra(req, res, user);
    } else {
      res.status(401).json({
        error: "Error Token vencido.",
        mensaje: "Inicie sesion para obtener un token y poder operar.",
      });
    }
  });
});

//-------------------CARGAR DETALLE REMITO ---------------------------
router.post("/cargarDetalleRemito", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.SECRETKEY, (error, userInfo) => {
    if (userInfo != undefined) {
      let user = userInfo.data.user;
      error
        ? res.status(401).json({
          error: "Acceso restringido",
          mensaje: "Inicie sesion para obtener un token y poder operar.",
        })
        : guardarDetalleRemito(req, res, user);
    } else {
      res.status(401).json({
        error: "Error Token vencido.",
        mensaje: "Inicie sesion para obtener un token y poder operar.",
      });
    }
  });
});


//-------------------VER DETALLE REMITO ---------------------------
router.get("/verDetalleRemito", verifyToken, (req, res) => {
  jwt.verify(req.token, process.env.SECRETKEY, (error, userInfo) => {
    if (userInfo != undefined) {
      let user = userInfo.data.user;
      error
        ? res.status(401).json({
          error: "Acceso restringido",
          mensaje: "Inicie sesion para obtener un token y poder operar.",
        })
        : verDetalleRemito(req, res, user);
    } else {
      res.status(401).json({
        error: "Error Token vencido.",
        mensaje: "Inicie sesion para obtener un token y poder operar.",
      });
    }
  });
});


//---------------------------FUNCTIONS-------------------------
//TODO: mover a middleware
function verDetalleRemito(req, res, user) {
  let body = req.body;
  const { error, value } = schemaVerDetalle.validate({
    nroRemito: body.nroRemito,
    proveedor: body.proveedor
  });

  if (error) {
    res.status(422).json({
      error: "Falta informacion en la peticion.",
      mensaje: error.message,
    });
    return;
  } else {
    if (value.proveedor != user) {
      res.status(401).json({
        error: "Acceso restringido",
        mensaje: "Inicie sesion para obtener un token y poder operar.",
      });
    }
    try {
      connection.query(
        getDetalleRemito(value.nroRemito),
        async (err, dataArray) => {
          if (err) next(err);
          if (!dataArray || dataArray.length <= 0) {
            res.status(404).json({
              ok: false,
              mensaje: "No se encontro informacion relacionada con esos datos.",
            });
            return;
          }

          let data = {
            detallesRemito: null,
          };

          let detalle = dataArray.map((val) => {
            let res = {
              gtin: val.gtin,
              comercial: val.comercial,
              presentacion: val.presentacion,
              cantidad: val.cantidad,
              generico: val.generico,
              // data.push(val.codigo_retiro);
              numeroRemito: val.numero_remito,
              itemId: val.item_id
            }
            return res

          });

          data.detallesRemito = detalle
          res.status(200).json(data);
        }
      );


    } catch (err) {
      console.log("Err", err);
    }
  }
}
function guardarDetalleRemito(req, res, user) {
  let body = req.body;
  const { error, value } = schemaCargarDetalle.validate({
    dniPaciente: body.dniPaciente,
    proveedor: body.proveedor,
    nroTramiteCompleto: body.nroTramiteCompleto,
    nroRemito: body.nroRemito,
    productosEntregados: body.productosEntregados,
  });

  if (error) {
    res.status(422).json({
      error: "Falta informacion en la peticion.",
      mensaje: error.message,
    });
    return;
  } else {
    if (value.proveedor != user) {
      res.status(401).json({
        error: "Acceso restringido",
        mensaje: "Inicie sesion para obtener un token y poder operar.",
      });
    }
    // valido que el tramite incluya el tramo
    let nroTramiteCompletoArray = value.nroTramiteCompleto.split(" ");
    nroTramiteCompleto = nroTramiteCompletoArray[0];

    let tramo = nroTramiteCompletoArray[1];
    if (!tramo) {
      res.json("sin tramo");
    }
    try {
      /*  connection.query(
        getRemitoByNumeroAndTramite(
          value.nroRemito,
          nroTramiteCompletoArray[0]
        ),
        async (err, dataArray) => {
          console.log(JSON.stringify(dataArray));
          if (err) next(err); //manejo de errores

          if (!dataArray || dataArray.length <= 0) {
            res.status(404).json({
              ok: false,
              mensaje:
                "No se encontro información con ese número de remito y número de trámite.",
            });
            return;
          } else {
            let remito_estado = dataArray.map((data) => {
              return data.remitos_estados_id;
            });
            if (remito_estado == 4) {
              res.status(422).json({
                ok: false,
                mensaje:
                  "Remito recibido por el paciente. No es posible realizar la carga del detalle.",
              });
              return;
            } else {
              try {
                const x = await new Promise((resolve, reject) => {
                  value.productosEntregados.map(async (data) => {
                    let gtin;
                    let generico;
                    let comercial;
                    let presentacion;
                    if (!data.gtin || undefined) {
                      gtin = "";
                    } else {
                      gtin = data.gtin;
                    }
                    if (!data.generico) {
                      generico = "";
                    } else {
                      generico = data.generico;
                    }
                    if (!data.comercial) {
                      comercial = "";
                    } else {
                      comercial = data.comercial;
                    }
                    if (!data.presentacion) {
                      presentacion = "";
                    } else {
                      presentacion = data.presentacion;
                    }
                    const resultado = await guardarDetalle(
                      gtin,
                      generico,
                      comercial,
                      presentacion,
                      data.cantidad,
                      "",
                      0,
                      value.nroRemito,
                      data.item
                    );
                    res.status(200).json(resultado);
                  });
                })
                  .then(console.log("Result Insert OK "))
                  .catch((reason) => {
                    console.log(reason);
                  });
              } catch (error) {
                console.log(error);
              }
            }
          }
        }
      ); */
    } catch (error) {
      console.log(error);
    }
  }
}

async function guardarDetalle(
  gtin,
  generico,
  comercial,
  presentacion,
  cantidad,
  comentario,
  codigoRetiro,
  nroRemito,
  item
) {
  return new Promise((resolve, reject) => {
    connection.query(
      insertDetalleRemito(
        gtin,
        generico,
        comercial,
        presentacion,
        cantidad,
        comentario,
        codigoRetiro,
        nroRemito,
        item
      ),
      async (err, result) => {
        if (err) throw err; //TODO: manejo de errores
        console.log("Result Insert ", result.affectedRows);
      }
    );
  });
}

function obtenerOrdenDeCompra(req, res, user) {
  let body = req.body;
  const { error, value } = schemaObtenerOC.validate({
    dniPaciente: body.dniPaciente,
    proveedor: body.proveedor,
    nroTramiteCompleto: body.nroTramiteCompleto,
  });

  console.log("error", error);
  if (error) {
    res.status(422).json({
      error: "Falta informacion en la petición.",
      mensaje: error.message,
    });
    return;
  }

  if (value.proveedor != user) {
    res.status(401).json({
      error: "Acceso restringido",
      mensaje: "Inicie sesion para obtener un token y poder operar.",
    });
  }

  let nroTramiteCompletArray = value.nroTramiteCompleto.split(" ");

  nroTramiteCompleto = nroTramiteCompletArray[0];
  let tramo = nroTramiteCompletArray[1];

  if (!tramo) {
    //TODO: casos con tramos null.
    res.json("sin tramo");
  }
  try {
    connection.query(
      getInforOC(nroTramiteCompletArray[0], tramo),

      async (err, dataArray) => {
        if (err) next(err); //manejo de errores

        if (!dataArray || dataArray.length <= 0) {
          res.status(404).json({
            ok: false,
            mensaje: "No se encontro informacion relacionada con esos datos.",
          });
          return;
        }

        let data = {
          paciente: dataArray[0].paciente,
          farmacia: dataArray[0].farmacia,
          fechaNotificacion: dataArray[0].fechaNotificacion,
          productosSolicitados: null,
        };
        let productos = dataArray.map((data) => {
          delete data.farmacia;
          delete data.paciente;
          delete data.numero_extendido;
          delete data.fechaNotificacion;
          let res = {
            item: data.item,
            generico: data.generico,
            comercial: data.comercial,
            presentacion: data.presentacion,
            cantidad: data.cantidad,
          };
          return res;
        });

        data.productosSolicitados = productos;
        res.status(200).json(data);
      }
    );
  } catch (err) {
    console.log("Err", err);
  }
}

module.exports = router;
