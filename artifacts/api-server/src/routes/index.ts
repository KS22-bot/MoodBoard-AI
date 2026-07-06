import { Router, type IRouter } from "express";
import healthRouter from "./health";
import moodRouter from "./mood";

const router: IRouter = Router();

router.use(healthRouter);
router.use(moodRouter);

export default router;
