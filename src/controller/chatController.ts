import { Request, Response } from 'express';

// Interface para el cuerpo de la solicitud POST
interface PostRequestBody {
    nombre: string;
    email: string;
}

// Función controladora del POST
export const postController = async (
    req: Request<{}, {}, PostRequestBody>, // Tipado del cuerpo (body)
    res: Response
) => {
    try {
        // Extraer datos del cuerpo de la solicitud
        const { nombre, email } = req.body;

        // Validación básica
        if (!nombre || !email) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }

        // Lógica de negocio (ejemplo: guardar en base de datos)
        // const nuevoUsuario = await database.saveUser({ nombre, email });

        // Respuesta exitosa
        res.status(201).json({
            mensaje: "Recurso creado exitosamente",
            data: { nombre, email },
        });

    } catch (error) {
        // Manejo de errores
        res.status(500).json({ error: "Error interno del servidor" });
    }
};