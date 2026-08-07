import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  createAccountHandler,
  listAccountsHandler,
  getAccountHandler,
} from "./accounts.controller";

const router = Router();

router.use(requireAuth);

router.post("/", createAccountHandler);
router.get("/", listAccountsHandler);
router.get("/:id", getAccountHandler);

export default router;
