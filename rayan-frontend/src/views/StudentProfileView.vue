<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDataStore } from '@/stores/dataStore.js'
import { useLayoutStore } from '@/stores/layout.js'
import MedalsGrid from '@/components/MedalsGrid.vue'
import BaseModal from '@/components/BaseModal.vue'
import BaseTable from '@/components/BaseTable.vue'
import HeartRating from '@/components/HeartRating.vue'
import AssignmentSubmission from '@/components/AssignmentSubmission.vue'
import DetailedProgressBar from '@/components/DetailedProgressBar.vue'
import dayjs from 'dayjs'
import jalali from 'dayjs-jalali'

// ۱. پلاگین جلالی را فعال کرده و زبان را روی فارسی تنظیم کنید
dayjs.extend(jalali)
dayjs.locale('fa')

const layoutStore = useLayoutStore()
const dataStore = useDataStore()
const route = useRoute()
const router = useRouter()

const studentId = parseInt(route.params.id)
const student = computed(() => dataStore.getStudentById(studentId))

// --- Medals Modal ---
const isMedalModalOpen = ref(false)
const selectedMedal = ref(null)
const isAwardingMedal = ref(true)
function handleMedalClick(medal) {
  selectedMedal.value = medal
  isAwardingMedal.value = !student.value.earnedMedalIds.includes(medal.id)
  isMedalModalOpen.value = true
}
function submitMedalAction() {
  if (isAwardingMedal.value) {
    dataStore.addMedalToStudent(studentId, selectedMedal.value.id)
  } else {
    dataStore.removeMedalFromStudent(studentId, selectedMedal.value.id)
  }
  isMedalModalOpen.value = false
  selectedMedal.value = null
}

// --- Change Term Modal ---
const isChangeTermModalOpen = ref(false)
const previousTermChangesCount = ref(0)
const termsInSameCourse = computed(() => {
  if (!student.value || !student.value.courseId) return []
  return dataStore.terms.filter((term) => term.courseId === student.value.courseId)
})
function openChangeTermModal() {
  previousTermChangesCount.value = student.value.actionLogs.filter(
    (log) => log.action === 'تغییر ترم',
  ).length
  isChangeTermModalOpen.value = true
}
function submitChangeTerm() {
  console.log('Term Changed!')
  isChangeTermModalOpen.value = false
}

// --- Edit Apollonyar Modal ---
const isEditApollonyarModalOpen = ref(false)
const allApollonyars = computed(() => dataStore.apollonyars)
function openEditApollonyarModal() {
  isEditApollonyarModalOpen.value = true
}
function submitApollonyarChange() {
  console.log('Apollonyar Changed!')
  isEditApollonyarModalOpen.value = false
}

// --- Edit Student Type Modal ---
const isEditTypeModalOpen = ref(false)
const selectedType = ref('')
function openEditTypeModal() {
  selectedType.value = student.value.studentType
  isEditTypeModalOpen.value = true
}
function submitTypeChange() {
  console.log('Type Changed!')
  isEditTypeModalOpen.value = false
}

// --- Edit Student Status Modal ---
const isEditStatusModalOpen = ref(false)
const selectedStatus = ref('')
function openEditStatusModal() {
  selectedStatus.value = student.value.status
  isEditStatusModalOpen.value = true
}
function submitStatusChange() {
  console.log('Status Changed!')
  isEditStatusModalOpen.value = false
}

// --- Edit Profile Modal ---
const isEditProfileModalOpen = ref(false)
function openEditProfileModal() {
  isEditProfileModalOpen.value = true
}
function submitProfileEdit() {
  console.log('Profile Edited!')
  isEditProfileModalOpen.value = false
}

// --- Edit Assignment Due Date Modal ---
const isEditDueDateModalOpen = ref(false)
const selectedAssignmentForDueDate = ref(null)
const newDueDate = ref('')
function openEditDueDateModal(assignment) {
  console.log('openEditDueDateModal called with assignment:', assignment)
  selectedAssignmentForDueDate.value = assignment

  if (assignment && assignment.dueDate) {
    // ۲. تاریخ جلالی را مستقیماً به آبجکت dayjs تبدیل می‌کنیم
    try {
      // Normalize Persian digits to English digits (if any)
      const persianMap = {
        '۰': '0',
        '۱': '1',
        '۲': '2',
        '۳': '3',
        '۴': '4',
        '۵': '5',
        '۶': '6',
        '۷': '7',
        '۸': '8',
        '۹': '9',
      }
      const normalizeDigits = (s) => String(s).replace(/[۰-۹]/g, (d) => persianMap[d] ?? d)
      let dateStr = normalizeDigits(assignment.dueDate).trim()

      // Try parsing as ISO / Gregorian first
      let parsed = dayjs(dateStr)
      // If not valid, try common separators and formats
      if (!parsed.isValid()) {
        // Try swapping slashes/backslashes to dashes
        const alt = dateStr.replace(/\//g, '-').replace(/\\/g, '-')
        parsed = dayjs(alt)
      }
      // If still invalid, try explicit YYYY-MM-DD or YYYY/MM/DD format
      if (!parsed.isValid()) {
        parsed = dayjs(dateStr, 'YYYY-MM-DD')
      }
      if (!parsed.isValid()) {
        parsed = dayjs(dateStr, 'YYYY/MM/DD')
      }

      if (parsed.isValid()) {
        newDueDate.value = parsed.format('YYYY-MM-DD')
      } else {
        // Fallback to empty string so input stays blank but modal still opens
        console.warn('Unable to parse assignment.dueDate:', assignment.dueDate)
        newDueDate.value = ''
      }
    } catch (err) {
      // Ensure any unexpected error does not prevent the modal from opening
      console.error('Error while parsing due date:', err)
      newDueDate.value = ''
    }
  } else {
    newDueDate.value = ''
  }

  isEditDueDateModalOpen.value = true
}
function submitDueDateChange() {
  console.log(`Due Date Changed to: ${newDueDate.value}`)
  isEditDueDateModalOpen.value = false
}

// --- Log Call Modal ---
const showLogCallModal = ref(false)
const newCallData = ref({
  topic: '',
  description: '',
  isUnanswered: false,
})

const callTopics = computed(() => {
  if (!course.value || !course.value.callsDef) return []
  const courseCalls = course.value.callsDef.map((c) => c.topic)
  return [...courseCalls, 'تماس انصراف', 'تماس پیگیری قسط', 'سایر']
})

function openLogCallModal() {
  newCallData.value = {
    topic: callTopics.value[0] || '',
    description: '',
    isUnanswered: false,
  }
  showLogCallModal.value = true
}
function submitLogCall() {
  console.log('New Call Logged:', newCallData.value)
  showLogCallModal.value = false
}

// --- Other computed properties and functions ---
const studentCalls = computed(() => {
  if (!student.value || !course.value) return []
  return dataStore.getCallsForStudentProfile(studentId, course.value.id)
})

const course = computed(() => {
  if (!student.value) return null
  return dataStore.courses.find((c) => c.id === student.value.courseId)
})
const studentAssignments = computed(() => {
  if (!student.value) return []
  return dataStore.getAssignmentsForStudentProfile(studentId, student.value.courseId)
})

watchEffect(() => {
  if (student.value) {
    layoutStore.setPageTitle(`پروفایل: ${student.value.name}`)
  }
})
function goBack() {
  router.back()
}
const isModalOpen = ref(false)
const selectedAssignment = ref(null)
function openEvaluationModal(assignment) {
  const assignmentCopy = JSON.parse(JSON.stringify(assignment))
  if (assignmentCopy.submissions) {
    assignmentCopy.submissions.sort((a, b) => b.date.localeCompare(a.date))
  }
  selectedAssignment.value = assignmentCopy
  isModalOpen.value = true
}
function submitEvaluation() {
  isModalOpen.value = false
}

const progressPercent = computed(() => {
  if (!student.value || !student.value.totalWatchTime) return 0
  return (student.value.watchTime / student.value.totalWatchTime) * 100
})
const assignmentColumns = [
  { key: 'actions', label: '', sortable: false, filterable: false },
  { key: 'title', label: 'عنوان تکلیف' },
  { key: 'dueDate', label: 'مهلت ارسال' },
  { key: 'submissionDate', label: 'تاریخ ارسال' },
  { key: 'submissionCount', label: 'نسخه‌های ارسالی' },
  { key: 'status', label: 'وضعیت بررسی' },
  { key: 'grade', label: 'نمره', width: '100px' },
]
const callColumns = [
  { key: 'actions', label: '' },
  { key: 'topic', label: 'موضوع تماس' },
  { key: 'callStatus', label: 'وضعیت تماس' },
  { key: 'apollonyar', label: 'آپولون‌یار' },
]
const logColumns = [
  { key: 'actions', label: '' },
  { key: 'action', label: 'اقدام' },
  { key: 'dateTime', label: 'تاریخ و ساعت' },
  { key: 'author', label: 'توسط' },
]
const noteColumns = [
  { key: 'date', label: 'تاریخ' },
  { key: 'note', label: 'یادداشت' },
  { key: 'author', label: 'نویسنده' },
]
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
            <img src="https://picsum.photos/120/120" alt="عکس هنرجو" />
          </div>
          <div class="profile-name-header">
            <h2 class="profile-name">{{ student.name }}</h2>
            <button @click="openEditProfileModal" class="btn-icon">
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>
          <ul class="profile-details">
            <li>
              <i class="fa-solid fa-mobile-screen-button"></i> <span>{{ student.phone }}</span>
            </li>
            <li><i class="fa-solid fa-cake-candles"></i> <span>متولد ۱۳۷۸</span></li>
            <li><i class="fa-solid fa-location-dot"></i> <span>تهران</span></li>
          </ul>
          <div class="sidebar-actions">
            <button @click="openLogCallModal" class="btn">
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
            <div class="card-title">
              <h4>نوع</h4>
              <button @click="openEditTypeModal" class="btn-icon">
                <i class="fa-solid fa-pen"></i>
              </button>
            </div>
            <p>
              <span class="status-bubble type">{{ student.studentType }}</span>
            </p>
          </div>
          <div class="stat-card card">
            <div class="card-title">
              <h4>وضعیت</h4>
              <button @click="openEditStatusModal" class="btn-icon">
                <i class="fa-solid fa-pen"></i>
              </button>
            </div>
            <p>
              <span class="status-bubble" :class="`status-${student.status}`">{{
                student.status
              }}</span>
            </p>
          </div>
          <div class="stat-card card">
            <div class="card-title"><h4>حضور</h4></div>
            <p>
              <span class="status-bubble presence">{{ student.enrollmentStatus }}</span>
            </p>
          </div>
          <div class="stat-card card">
            <div class="card-title"><h4>دسترسی</h4></div>
            <p>
              <span
                class="status-bubble"
                :class="
                  student.accessStatus && student.accessStatus.includes('فعال')
                    ? 'access-active'
                    : 'access-inactive'
                "
                >{{ student.accessStatus }}</span
              >
            </p>
          </div>

          <div class="stat-card card">
            <div class="card-title">
              <h4>ترم</h4>
              <button @click="openChangeTermModal" class="btn-icon">
                <i class="fa-solid fa-pen"></i>
              </button>
            </div>
            <p>{{ student.term }}</p>
            <small class="term-dates">
              <i class="fa-solid fa-calendar-alt"></i>
              <span>{{ student.termStartDate }} تا {{ student.termEndDate }}</span>
            </small>
          </div>
          <div class="stat-card card">
            <div class="card-title">
              <h4>آپولون‌یار</h4>
              <button @click="openEditApollonyarModal" class="btn-icon">
                <i class="fa-solid fa-pen"></i>
              </button>
            </div>
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
              {{ student.watchTime }} از {{ student.totalWatchTime }} ساعت ({{
                Math.round(progressPercent)
              }}٪)
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
              <button
                @click="openEvaluationModal(item)"
                class="btn-sm btn-icon-only"
                :disabled="!item.submissionDate"
              >
                <i class="fa-solid fa-eye"></i>
              </button>
            </template>
            <template #cell-dueDate="{ item }">
              <div class="due-date-cell">
                <span>{{ item.dueDate }}</span>
                <button
                  type="button"
                  title="ویرایش مهلت"
                  @click.stop="openEditDueDateModal(item)"
                  class="btn-icon"
                >
                  <i class="fa-solid fa-pen"></i>
                </button>
              </div>
            </template>
            <template #cell-submissionDate="{ item }">
              <span v-if="item.submissionDate">{{ item.submissionDate }}</span>
              <span v-else class="status-badge not-submitted">ارسال نشده</span>
            </template>
            <template #cell-status="{ item }">
              <span
                v-if="item.status"
                class="status-badge"
                :class="item.status.includes('بررسی') ? 'checked' : 'not-checked'"
              >
                {{ item.status }}
              </span>
              <span v-else>-</span>
            </template>
            <template #cell-grade="{ item }">
              <div v-if="item.grade === 'مردود'" class="status-badge grade-failed">
                {{ item.grade }}
              </div>
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
            <button @click="openLogCallModal" class="btn-sm">
              <i class="fa-solid fa-phone"></i> ثبت تماس جدید
            </button>
          </div>
          <BaseTable :columns="callColumns" :data="studentCalls || []" :rows-per-page="10">
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
        <p class="medal-description">{{ selectedMedal.description }}</p>
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
      <template #header><h2>ثبت تماس</h2></template>
      <form @submit.prevent="submitLogCall" class="modal-form">
        <div class="form-group">
          <label for="call-topic">عنوان تماس</label>
          <select id="call-topic" v-model="newCallData.topic">
            <option v-for="topic in callTopics" :key="topic" :value="topic">
              {{ topic }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="call-description">توضیحات</label>
          <textarea id="call-description" v-model="newCallData.description" rows="4"></textarea>
        </div>
        <div class="form-group-checkbox">
          <input type="checkbox" id="call-unanswered" v-model="newCallData.isUnanswered" />
          <label for="call-unanswered">تماس بی‌پاسخ بود</label>
        </div>
        <button type="submit" class="btn">ثبت</button>
      </form>
    </BaseModal>

    <BaseModal :show="isChangeTermModalOpen" @close="isChangeTermModalOpen = false">
      <template #header><h2>تغییر ترم</h2></template>
      <div v-if="student">
        <div class="modal-info-box">
          <div class="info-item">
            <span>ترم فعلی:</span> <strong>{{ student.term }}</strong>
          </div>
          <div class="info-item">
            <span>تغییرات قبلی:</span> <strong>{{ previousTermChangesCount }} بار</strong>
          </div>
        </div>
        <form @submit.prevent="submitChangeTerm" class="modal-form">
          <div class="form-group">
            <label for="term-select">ترم جدید</label>
            <select id="term-select" :value="student.termId">
              <option v-for="term in termsInSameCourse" :key="term.id" :value="term.id">
                {{ term.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="change-term-notes">توضیحات</label
            ><textarea
              id="change-term-notes"
              rows="4"
              placeholder="دلیل تغییر ترم را بنویسید..."
            ></textarea>
          </div>
          <button type="submit" class="btn">ثبت</button>
        </form>
      </div>
    </BaseModal>

    <BaseModal :show="isEditApollonyarModalOpen" @close="isEditApollonyarModalOpen = false">
      <template #header><h2>ویرایش آپولون‌یار</h2></template>
      <div v-if="student">
        <div class="modal-info-box">
          <div class="info-item">
            <span>آپولون‌یار فعلی:</span> <strong>{{ student.apollonyar }}</strong>
          </div>
        </div>
        <form @submit.prevent="submitApollonyarChange" class="modal-form">
          <div class="form-group">
            <label for="apollonyar-select">آپولون‌یار جدید</label>
            <select id="apollonyar-select" :value="student.apollonyarId">
              <option v-for="ap in allApollonyars" :key="ap.id" :value="ap.id">
                {{ ap.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="apollonyar-notes">توضیحات</label
            ><textarea id="apollonyar-notes" rows="4"></textarea>
          </div>
          <button type="submit" class="btn">ثبت</button>
        </form>
      </div>
    </BaseModal>

    <BaseModal :show="isEditTypeModalOpen" @close="isEditTypeModalOpen = false">
      <template #header><h2>ویرایش نوع</h2></template>
      <div v-if="student">
        <div class="modal-info-box">
          <div class="info-item">
            <span>نوع فعلی:</span> <strong>{{ student.studentType }}</strong>
          </div>
        </div>
        <form @submit.prevent="submitTypeChange" class="modal-form">
          <div class="form-group">
            <label>نوع جدید</label>
            <div class="toggle-switch-2">
              <button
                type="button"
                :class="{ active: selectedType === 'ترمی' }"
                @click="selectedType = 'ترمی'"
              >
                ترمی
              </button>
              <button
                type="button"
                :class="{ active: selectedType === 'خودخوان' }"
                @click="selectedType = 'خودخوان'"
              >
                خودخوان
              </button>
            </div>
          </div>
          <div class="form-group">
            <label for="type-notes">توضیحات</label><textarea id="type-notes" rows="4"></textarea>
          </div>
          <button type="submit" class="btn">ثبت</button>
        </form>
      </div>
    </BaseModal>

    <BaseModal :show="isEditStatusModalOpen" @close="isEditStatusModalOpen = false">
      <template #header><h2>ویرایش وضعیت</h2></template>
      <div v-if="student">
        <div class="modal-info-box">
          <div class="info-item">
            <span>وضعیت فعلی:</span> <strong>{{ student.status }}</strong>
          </div>
        </div>
        <form @submit.prevent="submitStatusChange" class="modal-form">
          <div class="form-group">
            <label>وضعیت جدید</label>
            <div class="toggle-switch-3">
              <button
                type="button"
                :class="{ active: selectedStatus === 'آزاد' }"
                @click="selectedStatus = 'آزاد'"
              >
                آزاد
              </button>
              <button
                type="button"
                :class="{ active: selectedStatus === 'مسدود' }"
                @click="selectedStatus = 'مسدود'"
              >
                مسدود
              </button>
              <button
                type="button"
                :class="{ active: selectedStatus === 'انصراف' }"
                @click="selectedStatus = 'انصراف'"
              >
                انصراف
              </button>
            </div>
          </div>
          <div class="form-group">
            <label for="status-notes">توضیحات</label
            ><textarea id="status-notes" rows="4"></textarea>
          </div>
          <button type="submit" class="btn">ثبت</button>
        </form>
      </div>
    </BaseModal>

    <BaseModal :show="isEditProfileModalOpen" @close="isEditProfileModalOpen = false">
      <template #header><h2>ویرایش مشخصات هنرجو</h2></template>
      <div v-if="student">
        <form @submit.prevent="submitProfileEdit" class="modal-form profile-edit-form">
          <div class="form-group profile-image-editor">
            <img src="https://picsum.photos/120/120" alt="عکس هنرجو" />
            <label for="profile-image-upload" class="edit-photo-btn">
              <i class="fa-solid fa-camera"></i>
              <input type="file" id="profile-image-upload" hidden />
            </label>
          </div>
          <div class="form-group">
            <label for="profile-name">نام و نام خانوادگی</label>
            <input type="text" id="profile-name" :value="student.name" />
          </div>
          <div class="form-group">
            <label for="profile-phone">شماره تلفن</label>
            <input type="tel" id="profile-phone" :value="student.phone" />
          </div>
          <div class="form-group">
            <label for="profile-birth-year">سال تولد</label>
            <input type="number" id="profile-birth-year" value="1378" />
          </div>
          <div class="form-group">
            <label for="profile-city">شهر</label>
            <input type="text" id="profile-city" value="تهران" />
          </div>
          <button type="submit" class="btn">ثبت تغییرات</button>
        </form>
      </div>
    </BaseModal>

    <BaseModal :show="isEditDueDateModalOpen" @close="isEditDueDateModalOpen = false">
      <template #header><h2>ویرایش مهلت ارسال تکلیف</h2></template>
      <div v-if="selectedAssignmentForDueDate">
        <div class="modal-info-box">
          <div class="info-item">
            <span>تکلیف:</span>
            <strong>{{ selectedAssignmentForDueDate.title }}</strong>
          </div>
          <div class="info-item">
            <span>مهلت فعلی:</span>
            <strong>{{ selectedAssignmentForDueDate.dueDate }}</strong>
          </div>
        </div>
        <form @submit.prevent="submitDueDateChange" class="modal-form">
          <div class="form-group">
            <label for="new-due-date">مهلت جدید</label>
            <input type="date" id="new-due-date" v-model="newDueDate" class="native-date-picker" />
          </div>
          <div class="form-group">
            <label for="due-date-notes">توضیحات</label>
            <textarea
              id="due-date-notes"
              rows="4"
              placeholder="دلیل تغییر مهلت را بنویسید..."
            ></textarea>
          </div>
          <button type="submit" class="btn">ثبت</button>
        </form>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
/* استایل‌ها بدون تغییر باقی می‌مانند */
/* استایل‌های مودال مدال */
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
  margin-bottom: 10px; /* کاهش فاصله پایینی */
}
.medal-modal-content .form-group {
  text-align: right;
  margin-bottom: 20px;
}
/* ==== تغییر جدید ==== */
.medal-description {
  background-color: var(--background-color);
  padding: 10px 15px;
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.7;
  margin-bottom: 20px;
  text-align: justify;
}
/* =================== */

/* استایل‌های کلی */
.card {
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  padding: 25px;
  box-shadow: var(--shadow-color) 0px 7px 29px 0px;
}
.page-header {
  margin-bottom: 25px;
}
.back-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.back-link i {
  margin-left: 8px;
}
.profile-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}
.profile-main {
  display: flex;
  flex-direction: column;
  gap: 25px;
}
.profile-sidebar .profile-card {
  text-align: center;
}
.profile-image img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--primary-color);
  object-fit: cover;
  margin-bottom: 15px;
}
.profile-name-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.profile-name {
  margin-bottom: 0;
  font-size: 1.5rem;
}
.profile-details {
  list-style: none;
  text-align: right;
}
.profile-details li {
  margin-bottom: 15px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}
.profile-details li i {
  margin-left: 12px;
  color: var(--primary-color);
  width: 20px;
  text-align: center;
}
.sidebar-actions {
  margin-top: 25px;
  padding-top: 25px;
  border-top: 1px solid var(--border-color);
}
.course-selector {
  display: flex;
  align-items: center;
  gap: 15px;
}
.course-selector select {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-color);
}
.stats-grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
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
.stat-card .btn-icon {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.8rem;
}
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
  font-size: 0.75rem;
  color: var(--text-secondary);
  background-color: var(--background-color);
  padding: 4px 8px;
  border-radius: 12px;
  margin-top: 10px;
  white-space: nowrap;
}
.stat-card .term-dates i {
  margin-left: 5px;
}
.status-bubble {
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}
.status-bubble.type {
  background-color: #e0e7ff;
  color: #3730a3;
}
.status-bubble.status-آزاد {
  background-color: var(--success-bg);
  color: var(--success-text);
}
.status-bubble.status-انصراف {
  background-color: #e5e7eb;
  color: #374151;
}
.status-bubble.status-مسدود {
  background-color: #fee2e2;
  color: #b91c1c;
}
.status-bubble.presence {
  background-color: #f3e8ff;
  color: #6b21a8;
}
.status-bubble.access-active {
  background-color: var(--success-bg);
  color: var(--success-text);
}
.status-bubble.access-inactive {
  background-color: #ffedd5;
  color: #9a3412;
}
.icon-value-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  flex-grow: 1;
}
.icon-value-wrapper p {
  font-size: 1.2rem;
  font-weight: 700;
}
.score-icon {
  color: var(--star-color);
}
.progress-section h4 {
  margin-bottom: 15px;
}
.btn {
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'Vazirmatn', sans-serif;
}
.btn-icon {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 1rem;
}
.form-group {
  margin-bottom: 20px;
}
.form-group-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.form-group-checkbox label {
  cursor: pointer;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
}
.form-group select,
.form-group textarea,
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-color);
  font-family: 'Vazirmatn', sans-serif;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.btn-sm {
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn-icon-only {
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 1rem;
}
.status-badge {
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 11px;
  white-space: nowrap;
}
.status-badge.checked {
  background-color: var(--success-bg);
  color: var(--success-text);
}
.status-badge.not-checked {
  background-color: #ffedd5;
  color: #9a3412;
}
.status-badge.not-submitted {
  background-color: #e5e7eb;
  color: #374151;
}
.grade-failed {
  background-color: #fee2e2;
  color: #b91c1c;
}
.star-rating {
  color: var(--star-color);
  white-space: nowrap;
}
:deep(.overdue-row td) {
  background-color: #fff1f2 !important;
}
[data-theme='dark'] :deep(.overdue-row td) {
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
.due-date-cell .btn-icon {
  position: relative;
  z-index: 10;
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
.status-badge.call-status-موفق {
  background-color: var(--success-bg);
  color: var(--success-text);
}
.status-badge.call-status-بی‌پاسخ {
  background-color: #ffedd5;
  color: #9a3412;
}
.status-badge.call-status-در-آینده {
  background-color: #e5e7eb;
  color: #374151;
}
.status-badge.call-status-برای-انجام {
  background-color: #fef9c3;
  color: #854d0e;
}
.status-badge.call-status-سوخته {
  background-color: #fee2e2;
  color: #b91c1c;
}

/* استایل‌های مودال‌های جدید */
.modal-info-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: var(--background-color);
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 25px;
  border: 1px solid var(--border-color);
}
.modal-info-box .info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-info-box span {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

/* استایل Toggle Switch */
.toggle-switch-2,
.toggle-switch-3 {
  display: flex;
  background-color: var(--background-color);
  border-radius: 8px;
  padding: 4px;
  border: 1px solid var(--border-color);
}
.toggle-switch-2 button,
.toggle-switch-3 button {
  flex: 1;
  padding: 8px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  border-radius: 6px;
  transition:
    background-color 0.2s,
    color 0.2s;
  font-family: 'Vazirmatn', sans-serif;
}
.toggle-switch-2 button.active,
.toggle-switch-3 button.active {
  background-color: var(--primary-color);
  color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* استایل مودال ویرایش پروفایل */
.profile-edit-form {
  text-align: center;
}
.profile-image-editor {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}
.profile-image-editor img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border-color);
}

.edit-photo-btn {
  position: absolute;
  bottom: 0px;
  left: 0px;
  width: 36px;
  height: 36px;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.edit-photo-btn:hover {
  background-color: var(--primary-hover);
}

.edit-photo-btn i {
  color: #fff;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 1;
}

.profile-edit-form .form-group {
  text-align: right;
}

.native-date-picker {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-color);
  font-family: 'Vazirmatn', sans-serif;
  color: var(--text-primary);
  text-align: right;
}
</style>
