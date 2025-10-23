// src/renderer/backend/students.ts

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

document.addEventListener('DOMContentLoaded', async () => {
  // --- Get All Elements ---
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  const filterStrand = document.getElementById('filterStrand') as HTMLSelectElement;
  const filterYear = document.getElementById('filterYear') as HTMLSelectElement;
  const filterSemester = document.getElementById('filterSemester') as HTMLSelectElement;
  const tableBody = document.getElementById('studentTableBody');
  const modal = document.getElementById('studentModal');
  const closeModalBtn = document.getElementById('closeModal');
  const modalName = document.getElementById('modalName');
  const modalStrand = document.getElementById('modalStrand');
  const modalYear = document.getElementById('modalYear');
  const modalSemester = document.getElementById('modalSemester');
  const modalStatus = document.getElementById('modalStatus');

  // This check prevents the script from crashing if the page is missing elements
  if (!tableBody || !searchInput || !filterStrand || !filterYear || !filterSemester) {
    console.error('Failed to find one or more essential elements. Script will not run.');
    return; // Stop execution if elements are missing
  }

  let allStudents: NewStudent[] = []; // Store all fetched students

  /**
   * Fetches all students from Supabase.
   */
  const fetchAllStudents = async (): Promise<NewStudent[]> => {
    const { data, error } = await supabase
      .from('NewStudents')
      .select('gradeLevel, lname, fname, semester, strand, enrollment_status');

    if (error) {
      console.error('Error fetching students:', error);
      throw new Error('Failed to load students.');
    }

    console.log('Fetched students for table:', data); // Debug log

    return data as NewStudent[];
  };

  /**
   * Populates the table with student data.
   */
  const populateTable = (students: NewStudent[]): void => {
    tableBody.innerHTML = ''; // Clear existing rows

    students.forEach((student, index) => {
      const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
      const statusClass =
        student.enrollment_status === 'Pending'
          ? 'bg-yellow-100 text-yellow-800'
          : student.enrollment_status === 'Enrolled'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800';

      const row = document.createElement('tr');
      row.className = `${rowClass} border-b`;
      row.dataset.name = `${student.fname} ${student.lname}`;
      row.dataset.strand = student.strand;
      row.dataset.year = student.gradeLevel.toString();
      row.dataset.semester = student.semester;
      row.dataset.status = student.enrollment_status;

      row.innerHTML = `
                <td class="py-4 px-6">${student.fname} ${student.lname}</td>
                <td class="py-4 px-6">${student.strand}</td>
                <td class="py-4 px-6 pl-12">${student.gradeLevel}</td>
                <td class="py-4 px-6 pl-12">${student.semester}</td>
                <td class="py-4 px-6"><span class="text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full ${statusClass}">${student.enrollment_status}</span></td>
                <td class="py-4 px-4 text-right"><button class="view-btn px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-md hover:bg-gray-200">VIEW</button></td>
            `;

      tableBody.appendChild(row);
    });
  };

  /**
   * Filters the student table based on all active filters.
   */
  function filterTable(): void {
    const searchTerm = searchInput.value.toLowerCase();
    const strand = filterStrand.value;
    const year = filterYear.value;
    const semester = filterSemester.value;

    const rows = tableBody!.getElementsByTagName('tr') as HTMLCollectionOf<HTMLElement>;

    for (const row of Array.from(rows)) {
      const name = (row.dataset.name ?? '').toLowerCase();
      const rowStrand = row.dataset.strand ?? '';
      const rowYear = row.dataset.year ?? '';
      const rowSemester = row.dataset.semester ?? '';

      const nameMatch = name.includes(searchTerm);
      const strandMatch = strand === 'all' || rowStrand === strand;
      const yearMatch = year === 'all' || rowYear === year;
      const semesterMatch = semester === 'all' || rowSemester === semester;

      if (nameMatch && strandMatch && yearMatch && semesterMatch) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  }

  /**
   * Opens the modal with the student's data.
   * @param row The table row element that was clicked.
   */
  function openStudentModal(row: HTMLElement): void {
    if (modalName) {
      modalName.textContent = row.dataset.name ?? 'N/A';
    }
    if (modalStrand) {
      modalStrand.textContent = row.dataset.strand ?? 'N/A';
    }
    if (modalYear) {
      modalYear.textContent = row.dataset.year ?? 'N/A';
    }
    if (modalSemester) {
      modalSemester.textContent = row.dataset.semester ?? 'N/A';
    }
    if (modalStatus) {
      modalStatus.textContent = row.dataset.status ?? 'N/A';
    }

    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  // --- Initialize ---
  try {
    allStudents = await fetchAllStudents();
    populateTable(allStudents);
  } catch (err) {
    console.error('Error loading students:', err);
    tableBody.innerHTML =
      '<tr><td colspan="6" class="py-4 px-6 text-center text-red-500">Error loading students.</td></tr>';
  }

  // --- Attach Event Listeners ---

  // Filters
  searchInput.addEventListener('input', filterTable);
  filterStrand.addEventListener('change', filterTable);
  filterYear.addEventListener('change', filterTable);
  filterSemester.addEventListener('change', filterTable);

  // Modal
  tableBody.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const viewButton = target.closest('.view-btn');
    const row = target.closest('tr');

    if (viewButton && row) {
      openStudentModal(row);
    }
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (modal) modal.classList.add('hidden');
    });
  }

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.classList.add('hidden');
      }
    });
  }
});
