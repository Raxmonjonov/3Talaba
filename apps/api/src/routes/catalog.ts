import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  getCourses,
  getCourseDetail,
  getLessonDetail,
  completeLessonAction,
  getLessonNote,
  saveLessonNote,
  getNotes,
  getQuestionReflection,
  saveQuestionReflection,
  getSelfQuestions,
  createSelfQuestion,
  deleteSelfQuestion,
  getSkills,
  enrollCourse,
  getMyEnrollments,
  startPlacement,
  answerPlacement,
  getPracticeQuestion,
  submitPractice,
  getReviews,
  getMistakes,
  getCalibration,
  getMockExamList,
  getMockExamDetail,
  answerMockExam,
  finishMockExamAction,
  getMockExamAttempts,
  saveMockExamReflection,
} from "../controllers/catalog.js";

const router = Router();

router.get("/courses", requireAuth, getCourses);
router.get("/courses/:slug", requireAuth, getCourseDetail);
router.post("/courses/:slug/enroll", requireAuth, enrollCourse);
router.get("/enrollments", requireAuth, getMyEnrollments);
router.get("/lessons/:slug", requireAuth, getLessonDetail);
router.post("/lessons/:slug/complete", requireAuth, completeLessonAction);
router.get("/lessons/:slug/note", requireAuth, getLessonNote);
router.put("/lessons/:slug/note", requireAuth, saveLessonNote);
router.get("/notes", requireAuth, getNotes);
router.get("/questions/:id/reflection", requireAuth, getQuestionReflection);
router.put("/questions/:id/reflection", requireAuth, saveQuestionReflection);
router.get("/self-questions", requireAuth, getSelfQuestions);
router.post("/self-questions", requireAuth, createSelfQuestion);
router.delete("/self-questions/:id", requireAuth, deleteSelfQuestion);
router.get("/skills", requireAuth, getSkills);

router.get("/placement/start", requireAuth, startPlacement);
router.post("/placement/answer", requireAuth, answerPlacement);

router.get("/practice/next", requireAuth, getPracticeQuestion);
router.post("/practice/answer", requireAuth, submitPractice);

router.get("/reviews", requireAuth, getReviews);
router.get("/mistakes", requireAuth, getMistakes);
router.get("/calibration", requireAuth, getCalibration);
router.get("/mock-exams", requireAuth, getMockExamList);
router.get("/mock-exams/:slug", requireAuth, getMockExamDetail);
router.post("/mock-exams/:slug/answer", requireAuth, answerMockExam);
router.post("/mock-exams/:slug/finish", requireAuth, finishMockExamAction);
router.get("/mock-exams/:slug/attempts", requireAuth, getMockExamAttempts);
router.put("/mock-exam-attempts/:id/reflection", requireAuth, saveMockExamReflection);

export default router;