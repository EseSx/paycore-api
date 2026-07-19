// Importación de dependencias necesarias para la aplicación Express
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'

// Creación de una instancia de la aplicación Express
const app = express()

// Configuración de middlewares para la aplicación Express
app.use(helmet())
app.use(cors())
app.use(express.json())

// Definición de una ruta de prueba para verificar el estado de la aplicación
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// Exportación de la instancia de la aplicación Express para su uso en otros módulos
export default app