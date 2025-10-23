// src/renderer/backend/dashboard.ts

import { supabase } from './supabaseClient';

// --- TYPE DEFINITION ---
interface NewStudent {
  lname: string;
  fname: string;
  strand: 'STEM' | 'ABM' | 'TVL-ICT' | 'HUMSS';
  gradeLevel: number;
  semester: string;
  enrollment_status: 'Pending' | 'Enrolled' | 'Rejected';
}

// --- DOM ELEMENT SELECTORS (Matching the dashboard.html structure) ---
const SELECTORS = {
  // Strand Counts (from the Stat Cards)
  stemCount: '.stat-stem-count',
  abmCount: '.stat-abm-count',
  tvlCount: '.stat-tvl-count',
  humssCount: '.stat-humss-count',
  // Enrollment Status Counts (from the Enrollment Count Panel)
  pendingCount: '.stat-pending-count',
  enrolledCount: '.stat-enrolled-count',
  // Rejected count - assuming 'Approved' in your HTML means 'Enrolled' and 'Rejected' is the third status
  rejectedCount: '.stat-rejected-count',
  // Recent Applications Table Body
  recentTableBody: '#recent-table-body',
};

// --- DATA FETCHING FUNCTIONS ---

/**
 * Fetches all students to calculate strand and status counts.
 */
const fetchAndProcessAllStudents = async (): Promise<{
  strandCounts: Record<NewStudent['strand'], number>;
  statusCounts: Record<NewStudent['enrollment_status'], number>;
}> => {
  const { data: students, error } = await supabase
    .from('NewStudents')
    .select('strand, enrollment_status');

  if (error) {
    throw new Error('Failed to load student data.');
  }

  const strandCounts: Record<NewStudent['strand'], number> = {
    STEM: 0,
    ABM: 0,
    'TVL-ICT': 0,
    HUMSS: 0,
  };
  const statusCounts: Record<NewStudent['enrollment_status'], number> = {
    Pending: 0,
    Enrolled: 0,
    Rejected: 0,
  };

  students.forEach((student: Partial<NewStudent>) => {
    const strand = student.strand as NewStudent['strand'];
    const status = student.enrollment_status as NewStudent['enrollment_status'];

    if (strand && strandCounts[strand] !== undefined) {
      strandCounts[strand]++;
    }

    if (status && statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  return { strandCounts, statusCounts };
};

/**
 * Fetches the 5 most recent student applications.
 */
const fetchRecentApplications = async (): Promise<NewStudent[]> => {
  // Temporarily ordering by 'lname' (Last Name) since LRN/created_at are removed.
  const orderByColumn = 'lname';

  const { data, error } = await supabase
    .from('NewStudents')
    .select('gradeLevel, lname, fname, semester, strand, enrollment_status')
    .order(orderByColumn, { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent applications:', error);
    throw new Error('Failed to load recent applications.');
  }

  // Cast the returned data to the defined type
  return data as NewStudent[];
};

// --- DOM UPDATE FUNCTIONS ---

/**
 * Updates a single DOM element's text content.
 */
const updateElementText = (selector: string, text: string): void => {
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = text;
  } else {
    console.warn(`Element not found for selector: ${selector}`);
  }
};

/**
 * Generates an HTML table row for a student application.
 */
const generateTableRow = (student: NewStudent): string => {
  // Determine the Tailwind CSS class based on the student's status
  const statusClass =
    student.enrollment_status === 'Pending'
      ? 'bg-yellow-100 text-yellow-800'
      : student.enrollment_status === 'Enrolled'
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800';

  return `
        <tr class="bg-white border-b hover:bg-gray-50 transition-colors">
            <td class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">${student.fname} ${student.lname}</td>
            <td class="py-4 px-6">${student.strand}</td>
            <td class="py-4 px-6 text-center">${student.gradeLevel}</td>
            <td class="py-4 px-6 text-center">${student.semester}</td>
            <td class="py-4 px-6">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass}">
                    ${student.enrollment_status}
                </span>
            </td>
        </tr>
    `;
};

// --- MAIN EXECUTION LOGIC ---

/**
 * Main function to run the dashboard logic after the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch and process all student data for counts
    const { strandCounts, statusCounts } = await fetchAndProcessAllStudents();

    // Fetch the 5 most recent applications
    const recentApplications = await fetchRecentApplications();

    // Update Strand Cards
    updateElementText(SELECTORS.stemCount, strandCounts.STEM.toString());
    updateElementText(SELECTORS.abmCount, strandCounts.ABM.toString());
    updateElementText(SELECTORS.tvlCount, strandCounts['TVL-ICT'].toString());
    updateElementText(SELECTORS.humssCount, strandCounts.HUMSS.toString());

    // Update Enrollment Status Counts
    updateElementText(SELECTORS.pendingCount, statusCounts.Pending.toString());
    updateElementText(SELECTORS.enrolledCount, statusCounts.Enrolled.toString());
    updateElementText(SELECTORS.rejectedCount, statusCounts.Rejected.toString());

    // Populate Recent Enrollment Applications Table
    const tableBody = document.querySelector(SELECTORS.recentTableBody);
    if (tableBody) {
      tableBody.innerHTML = recentApplications.map(generateTableRow).join('');
    }
  } catch (err) {
    console.error('Error loading dashboard data:', err);
  }
});
