import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  createAccountHandler,
  listAccountsHandler,
  getAccountHandler,
} from "./accounts.controller";

const router = Router();

// Todas las rutas de este módulo requieren estar autenticado.
router.use(requireAuth);

router.post("/", createAccountHandler);
router.get("/", listAccountsHandler);
router.get("/:id", getAccountHandler);

export default router;
