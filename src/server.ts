// Importación de la aplicación principal desde el archivo 'app.ts'
import app from './app'

// Definición del puerto en el que se ejecutará el servidor, utilizando una variable de entorno o un valor por defecto
const PORT = process.env.PORT || 3000

// Iniciando el servidor Express y escuchando en el puerto definido, mostrando un mensaje en la consola cuando el servidor esté en funcionamiento
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))