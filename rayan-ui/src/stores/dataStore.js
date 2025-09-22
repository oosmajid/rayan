// src/stores/dataStore.js
import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import db from '@/data/db.json';
import dayjs from 'dayjs';
import jalali from 'dayjs-jalali';

dayjs.extend(jalali);
dayjs.locale('fa');

const generateAssignmentStatuses = () => {
  const statuses = ['completed', 'missed', 'pending'];
  return Array.from({ length: 7 }, () => statuses[Math.floor(Math.random() * 3)]);
};

export const useDataStore = defineStore('data', () => {
  const students = ref(db.students);
  const apollonyars = ref(db.apollonyars);
  const terms = ref(db.terms);
  const courses = ref(db.courses);
  const assignments = ref(db.assignments);
  const calls = ref(db.calls);
  const installments = ref(db.installments);
  const medals = ref(db.medals || []);
  const groups = ref(db.groups || []);
  const transactions = ref(db.transactions || []);

  const coursesById = computed(() => new Map(courses.value.map(c => [c.id, c])));
  const termsById = computed(() => new Map(terms.value.map(t => [t.id, t])));
  const apollonyarsById = computed(() => new Map(apollonyars.value.map(a => [a.id, a])));

  const studentsWithDetails = computed(() => {
    return students.value.map(student => {
      const term = termsById.value.get(student.termId) || {};
      const course = coursesById.value.get(term.courseId) || {};
      const apollonyar = apollonyarsById.value.get(student.apollonyarId) || {};
      const lastCall = calls.value.filter(c => c.studentId === student.id).pop();
      
      return {
        ...student,
        term: term.name || '-',
        termStartDate: term.startDate,
        termEndDate: term.endDate,
        course: course.name || '-',
        courseId: course.id, // ۱. افزودن آیدی دوره برای استفاده در پروفایل
        apollonyar: apollonyar.name || '-',
        assignmentStatus: generateAssignmentStatuses(),
        daysSinceLastContact: lastCall ? Math.floor(Math.random() * 10) + 1 : 30,
        accountStatus: student.status,
      };
    });
  });

  const assignmentsForTable = computed(() => {
    return assignments.value.map(a => {
      const student = studentsWithDetails.value.find(s => s.id === a.studentId) || {};
      return { 
        ...a, 
        studentName: student.name || 'نامشخص', 
        course: student.course,
        assignmentTitle: a.assignmentTitle 
      };
    });
  });
  
  const callsForTable = computed(() => {
    return calls.value.map(c => {
        const student = studentsWithDetails.value.find(s => s.id === c.studentId) || {};
        return { 
            ...c, 
            studentName: student.name,
            phone: student.phone, 
            course: student.course, 
            term: student.term, 
            apollonyar: student.apollonyar, 
            hearts: student.hearts,
            previousCallDate: c.previousCallDate,
            daysToCallWindow: c.daysToCallWindow,
            previousCallTopic: c.previousCallTopic
        };
    })
  });
  
  const installmentsForTable = computed(() => {
      return installments.value.map(i => {
          const student = studentsWithDetails.value.find(s => s.id === i.studentId) || {};
          return { 
              ...i, 
              studentName: student.name,
              phone: student.phone,
              term: student.term,
              course: student.course,
              apollonyar: student.apollonyar,
              courseStatus: student.accessStatus,
              lastContactDate: i.lastContactDate
          };
      })
  });
  
  const groupsForTable = computed(() => {
    return (groups.value || []).map(g => {
        const term = termsById.value.get(g.termId) || {};
        const course = coursesById.value.get(term.courseId) || {};
        return { ...g, termName: term.name || '-', course: course.name || '-' }
    })
  });

  const coursesForTable = computed(() => {
    return courses.value.map(course => {
      const courseTerms = terms.value.filter(t => t.courseId === course.id).map(t => t.id);
      const courseStudents = students.value.filter(s => courseTerms.includes(s.termId));
      const courseStudentIds = courseStudents.map(s => s.id);
      const totalStudents = courseStudents.length;
      const graduates = courseStudents.filter(s => s.enrollmentStatus === 'فارغ‌التحصیل').length;
      const assignmentCount = assignments.value.filter(a => courseStudentIds.includes(a.studentId)).length;
      const callCount = calls.value.filter(c => courseStudentIds.includes(c.studentId)).length;
      return { ...course, totalStudents, graduates, assignmentCount, callCount };
    });
  });

  const termsForTable = computed(() => {
    return terms.value.map(term => {
      const course = coursesById.value.get(term.courseId) || {};
      const studentsCount = students.value.filter(s => s.termId === term.id).length;
      return { ...term, course: course.name || '-', studentsCount };
    });
  });

  const apollonyarsForTable = computed(() => {
    return apollonyars.value.map(apollonyar => {
      const urgentCalls = calls.value.filter(c => c.apollonyarId === apollonyar.id && c.callStatus === 'برای انجام').length;
      const avgScore = (Math.random() * (5 - 3) + 3).toFixed(1);
      return { ...apollonyar, urgentCalls, avgScore };
    });
  });

  const medalsForTable = computed(() => {
    return medals.value.map(medal => {
      const studentsWithMedal = studentsWithDetails.value
        .filter(s => s.earnedMedalIds && s.earnedMedalIds.includes(medal.id))
        .map(student => ({
          ...student,
          medalAwardDate: `۱۴۰۴/۰${Math.floor(Math.random() * 9) + 1}/${Math.floor(Math.random() * 28) + 1}`
        }));
      return { ...medal, holderCount: studentsWithMedal.length, students: studentsWithMedal };
    });
  });
  
  const getAssignmentsForStudentProfile = computed(() => {
      return (studentId, courseId) => {
          if (!studentId || !courseId) return [];
          const course = coursesById.value.get(courseId);
          if (!course || !course.assignmentsDef) return [];
          const studentSubmissions = assignments.value.filter(a => a.studentId === studentId);
          return course.assignmentsDef.map(def => {
              const submission = studentSubmissions.find(s => s.assignmentDefId === def.id);
              const isOverdue = !submission && dayjs().isAfter(dayjs(def.dueDate, { jalali: true }));
              return {
                  ...def,
                  ...(submission || {}),
                  isOverdue,
                  submissionCount: submission ? (submission.submissions?.length || 0) : 0,
              };
          });
      };
  });
  
  const getStudentById = computed(() => {
    return (id) => studentsWithDetails.value.find(s => s.id === id);
  });

  const getAssignmentsByStudentId = computed(() => {
    return (studentId) => assignmentsForTable.value.filter(a => a.studentId === studentId);
  });
  
  function updateTransactionStatus(transactionId, newStatus) {
    const transaction = transactions.value.find(t => t.id === transactionId);
    if (transaction) {
      transaction.status = newStatus;
      const note = {
        author: 'علی رضایی',
        date: new Date().toLocaleString('fa-IR'),
        text: `وضعیت توسط کاربر به «${newStatus}» تغییر کرد.`
      };
      transaction.notes.unshift(note);
    }
  }

  function addTransactionNote(transactionId, noteText) {
    const transaction = transactions.value.find(t => t.id === transactionId);
    if (transaction && noteText) {
      const note = {
        author: 'علی رضایی',
        date: new Date().toLocaleString('fa-IR'),
        text: noteText
      };
      transaction.notes.unshift(note);
    }
  }

  function addMedalToStudent(studentId, medalId) {
    const student = students.value.find(s => s.id === studentId);
    if (student) {
      if (!student.earnedMedalIds) {
        student.earnedMedalIds = [];
      }
      if (!student.earnedMedalIds.includes(medalId)) {
        student.earnedMedalIds.push(medalId);
      }
    }
  }

  // تابع جدید برای حذف مدال
  function removeMedalFromStudent(studentId, medalId) {
    const student = students.value.find(s => s.id === studentId);
    if (student && student.earnedMedalIds) {
      const index = student.earnedMedalIds.indexOf(medalId);
      if (index > -1) {
        student.earnedMedalIds.splice(index, 1);
      }
    }
  }

  const getCallsForStudentProfile = computed(() => {
    return (studentId, courseId) => {
        if (!studentId || !courseId) return [];
        const course = coursesById.value.get(courseId);
        if (!course || !course.callsDef) return [];

        const studentCalls = calls.value.filter(c => c.studentId === studentId);
        
        return course.callsDef.map(def => {
            const loggedCall = studentCalls.find(c => c.callDefId === def.id);
            const apollonyar = loggedCall ? apollonyarsById.value.get(loggedCall.apollonyarId) : null;

            return {
                ...def,
                ...(loggedCall || {}),
                callStatus: loggedCall ? loggedCall.callStatus : 'در آینده',
                apollonyar: apollonyar ? apollonyar.name : '-'
            };
        });
    };
  });

  // ۲. اصلاح نهایی و کامل بخش خروجی
  return {
    students, apollonyars, terms, courses, assignments, calls, transactions, installments, medals, groups,
    studentsWithDetails, assignmentsForTable, callsForTable, installmentsForTable, groupsForTable,
    coursesForTable, termsForTable, apollonyarsForTable, medalsForTable,
    getStudentById, getAssignmentsByStudentId, getAssignmentsForStudentProfile,
    updateTransactionStatus, addTransactionNote, addMedalToStudent, removeMedalFromStudent, getCallsForStudentProfile
  };
});