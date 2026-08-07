import { Router } from "express";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
} from "./auth.controller";

const router = Router();

// Rutas públicas — no pasan por requireAuth, son el punto de entrada
// para obtener el token que después se usa en el resto de la API.
router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);

export default router;
