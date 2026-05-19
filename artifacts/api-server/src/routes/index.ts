import { Router, type IRouter } from "express";
import healthRouter from "./health";
import demoRouter from "./demo";
import supportRouter from "./support";
import signupRouter from "./signup";
import ndaRouter from "./nda";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(demoRouter);
router.use(supportRouter);
router.use(signupRouter);
router.use(ndaRouter);
router.use(uploadRouter);

export default router;
