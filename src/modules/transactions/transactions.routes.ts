import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  createTransactionHandler,
  getHistoryHandler,
} from "./transactions.controller";

const router = Router();

// Todas las rutas de este módulo requieren estar autenticado.
router.use(requireAuth);

router.post("/", createTransactionHandler);
router.get("/account/:accountId", getHistoryHandler);

export default router;
