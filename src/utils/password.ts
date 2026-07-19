// Importa bcrypt para el hashing de contraseñas
import bcrypt from 'bcrypt'

// Define el número de rondas de sal para el hashing (Ni muy bajo ni muy alto, un valor de 12 es un buen equilibrio entre seguridad y rendimiento)
const SALT_ROUNDS = 12

// Función para hashear una contraseña en texto plano
export const hashPassword = async (plain: string) : Promise<string> => {
    return await bcrypt.hash(plain, SALT_ROUNDS)
}

// Función para comparar una contraseña en texto plano con un hash almacenado
export const comparePassword = async (plain: string, hash: string) : Promise<boolean> => {
    return await bcrypt.compare(plain, hash)
} 