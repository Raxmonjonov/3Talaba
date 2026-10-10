import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  getCourses,
  getCourseDetail,
  getLessonDetail,
  completeLessonAction,
  getSkills,
  enrollCourse,
  startPlacement,
  answerPlacement,
  getPracticeQuestion,
  submitPractice,
  getReviews,
} from "../controllers/catalog.js";

const router = Router();

router.get("/courses", requireAuth, getCourses);
router.get("/courses/:slug", requireAuth, getCourseDetail);
router.post("/courses/:slug/enroll", requireAuth, enrollCourse);
router.get("/lessons/:slug", requireAuth, getLessonDetail);
router.post("/lessons/:slug/complete", requireAuth, completeLessonAction);
router.get("/skills", requireAuth, getSkills);

router.get("/placement/start", requireAuth, startPlacement);
router.post("/placement/answer", requireAuth, answerPlacement);

router.get("/practice/next", requireAuth, getPracticeQuestion);
router.post("/practice/answer", requireAuth, submitPractice);

router.get("/reviews", requireAuth, getReviews);

export default router;