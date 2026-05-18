import { Router, type IRouter } from "express";
import healthRouter from "./health";
import demoRouter from "./demo";
import supportRouter from "./support";
import signupRouter from "./signup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(demoRouter);
router.use(supportRouter);
router.use(signupRouter);

export default router;
