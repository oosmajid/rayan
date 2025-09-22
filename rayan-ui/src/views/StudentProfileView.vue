<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDataStore } from '@/stores/dataStore.js';
import { useLayoutStore } from '@/stores/layout.js';
import MedalsGrid from '@/components/MedalsGrid.vue';
import BaseModal from '@/components/BaseModal.vue';
import BaseTable from '@/components/BaseTable.vue';
import HeartRating from '@/components/HeartRating.vue';
import AssignmentSubmission from '@/components/AssignmentSubmission.vue';
import DetailedProgressBar from '@/components/DetailedProgressBar.vue';


const layoutStore = useLayoutStore();
const dataStore = useDataStore();
const route = useRoute();
const router = useRouter();

const studentId = parseInt(route.params.id);
const student = computed(() => dataStore.getStudentById(studentId));

// ۱. افزودن متغیرهای وضعیت برای مودال مدال
const isMedalModalOpen = ref(false);
const selectedMedal = ref(null);
const isAwardingMedal = ref(true); // برای تشخیص اعطا یا حذف

// ۲. تابع برای مدیریت کلیک روی مدال
function handleMedalClick(medal) {
  selectedMedal.value = medal;
  isAwardingMedal.value = !student.value.earnedMedalIds.includes(medal.id);
  isMedalModalOpen.value = true;
}

// ۳. تابع برای ثبت نهایی تغییرات مدال
function submitMedalAction() {
  if (isAwardingMedal.value) {
    dataStore.addMedalToStudent(studentId, selectedMedal.value.id);
  } else {
    dataStore.removeMedalFromStudent(studentId, selectedMedal.value.id);
  }
  isMedalModalOpen.value = false;
  selectedMedal.value = null;
}

const studentCalls = computed(() => {
    if (!student.value || !course.value) return [];
    return dataStore.getCallsForStudentProfile(studentId, course.value.id);
});

const course = computed(() => {
    if (!student.value) return null;
    return dataStore.courses.find(c => c.id === student.value.courseId);
});
const studentAssignments = computed(() => {
  if (!student.value) return [];
  return dataStore.getAssignmentsForStudentProfile(studentId, student.value.courseId);
});

watchEffect(() => {
  if (student.value) { layoutStore.setPageTitle(`پروفایل: ${student.value.name}`); }
});
function goBack() { router.back(); }
const isModalOpen = ref(false);
const selectedAssignment = ref(null);
function openEvaluationModal(assignment) {
  const assignmentCopy = JSON.parse(JSON.stringify(assignment));
  if (assignmentCopy.submissions) {
    assignmentCopy.submissions.sort((a, b) => b.date.localeCompare(a.date));
  }
  selectedAssignment.value = assignmentCopy;
  isModalOpen.value = true;
}
function submitEvaluation() { isModalOpen.value = false; }
const showLogCallModal = ref(false);
const progressPercent = computed(() => {
  if (!student.value || !student.value.totalWatchTime) return 0;
  return (student.value.watchTime / student.value.totalWatchTime) * 100;
});
const assignmentColumns = [
    { key: 'actions', label: '', sortable: false, filterable: false },
    { key: 'title', label: 'عنوان تکلیف' }, { key: 'dueDate', label: 'مهلت ارسال' },
    { key: 'submissionDate', label: 'تاریخ ارسال' }, { key: 'submissionCount', label: 'نسخه‌های ارسالی' },
    { key: 'status', label: 'وضعیت بررسی' }, { key: 'grade', label: 'نمره', width: '100px' },
];
const callColumns = [
    { key: 'actions', label: '' },
    { key: 'topic', label: 'موضوع تماس' },
    { key: 'callStatus', label: 'وضعیت تماس' },
    { key: 'apollonyar', label: 'آپولون‌یار' },
];
const logColumns = [
  { key: 'actions', label: '' },
  { key: 'action', label: 'اقدام' },
  { key: 'dateTime', label: 'تاریخ و ساعت' },
  { key: 'author', label: 'توسط' },
];
const noteColumns = [
  { key: 'date', label: 'تاریخ' }, { key: 'note', label: 'یادداشت' }, { key: 'author', label: 'نویسنده' },
];
</script>

<template>
  <div>
    <header class="page-header">
      <button @click="goBack" class="back-link">
        <i class="fa-solid fa-arrow-right"></i> بازگشت به صفحه قبلی
      </button>
    </header>
     <div v-if="student" class="profile-grid">
      <aside class="profile-sidebar">
        <div class="profile-card card">
          <div class="profile-image">
            <img src="https://picsum.photos/120/120" alt="عکس هنرجو">
          </div>
          <div class="profile-name-header">
            <h2 class="profile-name">{{ student.name }}</h2>
            <button class="btn-icon"><i class="fa-solid fa-pen"></i></button>
          </div>
          <ul class="profile-details">
            <li><i class="fa-solid fa-mobile-screen-button"></i> <span>{{ student.phone }}</span></li>
            <li><i class="fa-solid fa-cake-candles"></i> <span>متولد ۱۳۷۸</span></li>
            <li><i class="fa-solid fa-location-dot"></i> <span>تهران</span></li>
          </ul>
          <div class="sidebar-actions">
            <button @click="showLogCallModal = true" class="btn">
              <i class="fa-solid fa-phone"></i> ثبت تماس
            </button>
          </div>
        </div>
      </aside>
       <main class="profile-main">
        <div class="course-selector card">
          <label for="course-select">نمایش اطلاعات برای دوره:</label>
          <select id="course-select">
            <option :value="student.course">{{ student.course }}</option>
          </select>
        </div>
         <div class="stats-grid-container">
          <div class="stat-card card">
            <div class="card-title"><h4>نوع</h4><button class="btn-icon"><i class="fa-solid fa-pen"></i></button></div>
            <p><span class="status-bubble type">{{ student.studentType }}</span></p>
          </div>
          <div class="stat-card card">
            <div class="card-title"><h4>وضعیت</h4><button class="btn-icon"><i class="fa-solid fa-pen"></i></button></div>
            <p><span class="status-bubble" :class="`status-${student.status}`">{{ student.status }}</span></p>
          </div>
          <div class="stat-card card">
            <div class="card-title"><h4>حضور</h4></div>
            <p><span class="status-bubble presence">{{ student.enrollmentStatus }}</span></p>
          </div>
          <div class="stat-card card">
            <div class="card-title"><h4>دسترسی</h4></div>
            <p><span class="status-bubble" :class="student.accessStatus && student.accessStatus.includes('فعال') ? 'access-active' : 'access-inactive'">{{ student.accessStatus }}</span></p>
          </div>
          
          <div class="stat-card card">
            <div class="card-title"><h4>ترم</h4><button class="btn-icon"><i class="fa-solid fa-pen"></i></button></div>
            <p>{{ student.term }}</p>
            <small class="term-dates">
              <i class="fa-solid fa-calendar-alt"></i>
              <span>{{ student.termStartDate }} تا {{ student.termEndDate }}</span>
            </small>
          </div>
          <div class="stat-card card">
            <div class="card-title"><h4>آپولون‌یار</h4><button class="btn-icon"><i class="fa-solid fa-pen"></i></button></div>
            <p>{{ student.apollonyar }}</p>
          </div>
          <div class="stat-card card">
            <div class="card-title"><h4>جان</h4></div>
            <div class="icon-value-wrapper">
              <HeartRating :count="student.hearts" />
            </div>
          </div>
          <div class="stat-card card">
            <div class="card-title"><h4>امتیاز</h4></div>
            <div class="icon-value-wrapper">
              <p>{{ student.score }} <i class="fa-solid fa-star score-icon"></i></p>
            </div>
          </div>
        </div>
        <MedalsGrid 
          :earned-medal-ids="student.earnedMedalIds || []" 
          @medal-click="handleMedalClick"
        />
        <div class="progress-section card">
          <div class="progress-header">
            <h4>پیشرفت دوره</h4>
            <span class="total-progress-text">
              {{ student.watchTime }} از {{ student.totalWatchTime }} ساعت ({{ Math.round(progressPercent) }}٪)
            </span>
          </div>
          <DetailedProgressBar 
            v-if="course"
            :chapters="course.chapters || []"
            :progress-data="student.chapterProgress || []"
          />
        </div>
         <div class="card">
          <div class="card-header"><h4>تکالیف</h4></div>
          <BaseTable 
            :columns="assignmentColumns" 
            :data="studentAssignments || []" 
            :rows-per-page="10"
            :row-class-fn="(item) => ({ 'overdue-row': item.isOverdue })"
          >
            <template #cell-actions="{ item }">
              <button @click="openEvaluationModal(item)" class="btn-sm btn-icon-only" :disabled="!item.submissionDate">
                <i class="fa-solid fa-eye"></i>
              </button>
            </template>
             <template #cell-dueDate="{ item }">
              <div class="due-date-cell">
                <span>{{ item.dueDate }}</span>
                <button class="btn-icon"><i class="fa-solid fa-pen"></i></button>
              </div>
            </template>
            <template #cell-submissionDate="{ item }">
                <span v-if="item.submissionDate">{{ item.submissionDate }}</span>
                <span v-else class="status-badge not-submitted">ارسال نشده</span>
            </template>
            <template #cell-status="{ item }">
              <span v-if="item.status" class="status-badge" :class="item.status.includes('بررسی') ? 'checked' : 'not-checked'">
                {{ item.status }}
              </span>
              <span v-else>-</span>
            </template>
            <template #cell-grade="{ item }">
              <div v-if="item.grade === 'مردود'" class="status-badge grade-failed">{{ item.grade }}</div>
              <div v-else-if="typeof item.grade === 'number'" class="star-rating">
                <i v-for="star in item.grade" :key="star" class="fa-solid fa-star"></i>
              </div>
              <span v-else>-</span>
            </template>
          </BaseTable>
        </div>
        <div class="card">
            <div class="card-header">
                <h4>تماس‌ها</h4>
                <button class="btn-sm"><i class="fa-solid fa-phone"></i> ثبت تماس جدید</button>
            </div>
            <BaseTable 
                :columns="callColumns" 
                :data="studentCalls || []" 
                :rows-per-page="10"
            >
                <template #cell-callStatus="{ item }">
                    <span class="status-badge" :class="`call-status-${item.callStatus}`">
                        {{ item.callStatus }}
                    </span>
                </template>
                <template #cell-actions>
                    <button class="btn-sm btn-icon-only" title="مشاهده توضیحات">
                        <i class="fa-solid fa-info-circle"></i>
                    </button>
                </template>
            </BaseTable>
        </div>
        <div class="card">
            <div class="card-header"><h4>لاگ اقدامات</h4></div>
            <BaseTable :columns="logColumns" :data="student.actionLogs || []" :rows-per-page="5">
                <template #cell-actions>
                    <button class="btn-sm btn-icon-only" title="مشاهده توضیحات">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                </template>
            </BaseTable>
        </div>
        <div class="card">
            <div class="card-header">
                <h4>یادداشت‌ها</h4>
                <button class="btn-sm"><i class="fa-solid fa-file-text"></i> افزودن یادداشت</button>
            </div>
            <BaseTable :columns="noteColumns" :data="student.notes || []" :rows-per-page="5" />
        </div>
      </main>
    </div>
    
    <div v-else><h2>هنرجو یافت نشد!</h2></div>
    <BaseModal :show="isMedalModalOpen" @close="isMedalModalOpen = false">
      <template #header>
        <h2 v-if="selectedMedal">{{ isAwardingMedal ? 'اعطای مدال' : 'حذف مدال' }}</h2>
      </template>
      <div v-if="selectedMedal" class="medal-modal-content">
        <i :class="selectedMedal.icon" class="modal-medal-icon"></i>
        <h3>{{ selectedMedal.name }}</h3>
        <div class="form-group">
          <label>توضیحات (اختیاری)</label>
          <textarea rows="4" placeholder="دلیل خود را برای این اقدام بنویسید..."></textarea>
        </div>
        <button @click="submitMedalAction" class="btn">ثبت</button>
      </div>
    </BaseModal>

    <BaseModal :show="isModalOpen" @close="isModalOpen = false" size="lg">
      <template #header>
        <h2>ارزیابی تکلیف: {{ student?.name }} - {{ selectedAssignment?.title }}</h2>
      </template>
      <div v-if="selectedAssignment" class="modal-body-content">
        <div class="submissions-wrapper">
          <AssignmentSubmission
            v-for="submission in selectedAssignment.submissions"
            :key="submission.version"
            :submission="submission"
            :template-files="selectedAssignment.templateFiles"
          />
        </div>
        <div class="evaluation-footer">
          <button @click="submitEvaluation" class="btn">ثبت نهایی ارزیابی</button>
        </div>
      </div>
    </BaseModal>
     <BaseModal :show="showLogCallModal" @close="showLogCallModal = false">
      <template #header ><h2>ثبت تماس</h2></template>
      <form @submit.prevent>
        <div class="form-group"><label>عنوان تماس</label><select><option>تماس اول</option></select></div>
        <div class="form-group"><label>توضیحات</label><textarea rows="4"></textarea></div>
        <button type="submit" class="btn" >ثبت</button>
      </form>
    </BaseModal>
  </div>
</template>

<style scoped>
/* ۶. افزودن استایل‌های مودال مدال */
.medal-modal-content {
  text-align: center;
}
.modal-medal-icon {
  font-size: 4rem;
  color: var(--star-color);
  margin-bottom: 15px;
}
.medal-modal-content h3 {
  font-size: 1.5rem;
  margin-bottom: 20px;
}
.medal-modal-content .form-group {
  text-align: right;
  margin-bottom: 20px;
}

/* ... (بقیه استایل‌ها بدون تغییر) ... */
.card { background-color: var(--surface-color); border-radius: var(--border-radius); padding: 25px; box-shadow: var(--shadow-color) 0px 7px 29px 0px; }
.page-header { margin-bottom: 25px; }
.back-link {
  color: var(--primary-color); text-decoration: none; font-weight: 500;
  background: none; border: none; padding: 0; cursor: pointer;
}
.back-link i { margin-left: 8px; }
.profile-grid { display: grid; grid-template-columns: 300px 1fr; gap: 30px; }
.profile-main { display: flex; flex-direction: column; gap: 25px; }
.profile-sidebar .profile-card { text-align: center; }
.profile-image img { width: 120px; height: 120px; border-radius: 50%; border: 4px solid var(--primary-color); object-fit: cover; margin-bottom: 15px; }
.profile-name-header { display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 20px; }
.profile-name { margin-bottom: 0; font-size: 1.5rem; }
.profile-details { list-style: none; text-align: right; }
.profile-details li { margin-bottom: 15px; color: var(--text-secondary); display: flex; align-items: center; }
.profile-details li i { margin-left: 12px; color: var(--primary-color); width: 20px; text-align: center; }
.sidebar-actions { margin-top: 25px; padding-top: 25px; border-top: 1px solid var(--border-color); }
.course-selector { display: flex; align-items: center; gap: 15px; }
.course-selector select { width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--background-color); }
.stats-grid-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.stat-card {
    text-align: center;
    display: flex;
    flex-direction: column;
}
.stat-card .card-title {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    margin-bottom: 15px;
}
.stat-card .btn-icon { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 2px 4px; border-radius: 4px; font-size: 0.8rem; }
.stat-card p {
    font-size: 1rem;
    font-weight: 500;
    margin: 0;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}
.stat-card .term-dates {
    font-size: 0.75rem; color: var(--text-secondary); background-color: var(--background-color);
    padding: 4px 8px; border-radius: 12px; margin-top: 10px; white-space: nowrap;
}
.stat-card .term-dates i { margin-left: 5px; }
.status-bubble {
    padding: 6px 14px;
    border-radius: 99px;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
}
.status-bubble.type { background-color: #e0e7ff; color: #3730a3; }
.status-bubble.status-آزاد { background-color: var(--success-bg); color: var(--success-text); }
.status-bubble.status-انصراف { background-color: #e5e7eb; color: #374151; }
.status-bubble.status-مسدود { background-color: #fee2e2; color: #b91c1c; }
.status-bubble.presence { background-color: #f3e8ff; color: #6b21a8; }
.status-bubble.access-active { background-color: var(--success-bg); color: var(--success-text); }
.status-bubble.access-inactive { background-color: #ffedd5; color: #9a3412; }
.icon-value-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  flex-grow: 1;
}
.icon-value-wrapper p { font-size: 1.2rem; font-weight: 700; }
.score-icon { color: var(--star-color); }
.progress-section h4 { margin-bottom: 15px; }
.progress-bar-container { width: 100%; height: 20px; background-color: var(--background-color); border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
.progress-bar { height: 100%; background-color: var(--primary-color); border-radius: 10px; }
.btn {border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; width: 100%; font-size: 1rem; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Vazirmatn', sans-serif;}
.btn-icon { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 4px 8px; border-radius: 6px; font-size: 1rem; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; }
.form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--background-color); font-family: 'Vazirmatn', sans-serif;}
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-sm {border: none; padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
.btn-icon-only { width: 32px; height: 32px; padding: 0; font-size: 1rem; }
.status-badge { padding: 4px 12px; border-radius: 99px; font-size: 11px; white-space: nowrap; }
.status-badge.checked { background-color: var(--success-bg); color: var(--success-text); }
.status-badge.not-checked { background-color: #ffedd5; color: #9a3412; }
.status-badge.not-submitted { background-color: #e5e7eb; color: #374151; }
.grade-failed { background-color: #fee2e2; color: #b91c1c; }
.star-rating { color: var(--star-color); white-space: nowrap; }
:deep(.overdue-row td) {
    background-color: #fff1f2 !important;
}
[data-theme="dark"] :deep(.overdue-row td) {
    background-color: #3f2226 !important;
}
.modal-body-content {
    display: flex;
    flex-direction: column;
}
.submissions-wrapper { 
  max-height: 60vh; 
  overflow-y: auto; 
  padding: 5px 15px 5px 5px;
  margin: 0 -15px 0 -5px;
}
.evaluation-footer { 
  border-top: 1px solid var(--border-color); 
  padding-top: 20px; 
  margin-top: 20px; 
  text-align: center; 
}
.btn-icon-only:disabled {
  background-color: var(--border-color);
  color: var(--text-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}
.due-date-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.profile-name-header .btn-icon:hover,
.stat-card .btn-icon:hover,
.due-date-cell .btn-icon:hover {
  background-color: var(--primary-color);
  color: #fff;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
.progress-header h4 {
  margin-bottom: 0;
}
.total-progress-text {
  color: var(--text-secondary);
  font-weight: 500;
}
.status-badge.call-status-موفق { background-color: var(--success-bg); color: var(--success-text); }
.status-badge.call-status-بی‌پاسخ { background-color: #ffedd5; color: #9a3412; } /* Orange */
.status-badge.call-status-در-آینده { background-color: #e5e7eb; color: #374151; } /* Gray */
.status-badge.call-status-برای-انجام { background-color: #fef9c3; color: #854d0e; } /* Yellow */
.status-badge.call-status-سوخته { background-color: #fee2e2; color: #b91c1c; } /* Red */
</style>