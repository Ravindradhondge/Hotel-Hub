import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tablesRouter from "./tables";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import inventoryRouter from "./inventory";
import expensesRouter from "./expenses";
import usersRouter from "./users";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(tablesRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(inventoryRouter);
router.use(expensesRouter);
router.use(usersRouter);
router.use(analyticsRouter);

export default router;
