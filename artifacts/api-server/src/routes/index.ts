import { Router, type IRouter } from "express";
import healthRouter from "./health";
import demoRouter from "./demo";
import supportRouter from "./support";

const router: IRouter = Router();

router.use(healthRouter);
router.use(demoRouter);
router.use(supportRouter);

export default router;
