// scripts.js 
const API_BASE_URL = 'http://localhost:5000/api';

let currentJobs = [];
let allJobs = []; 
let currentPage = 1;
const jobsPerPage = 10;
let authToken = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Job Portal Loading...');
    loadJobs();
    
    // Add event listeners
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
    
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', handleSort);
    }
    
    setupFilterListeners();
    console.log('Event listeners attached');
});

// Setup filter event listeners
function setupFilterListeners() {
    // Salary range filters
    const salaryFilters = document.querySelectorAll('input[name="salary"]');
    salaryFilters.forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    // Job type filters
    const jobTypeFilters = document.querySelectorAll('input[name="jobType"]');
    jobTypeFilters.forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    // Work mode filters
    const workModeFilters = document.querySelectorAll('input[name="workMode"]');
    workModeFilters.forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    // Function filters
    const functionFilters = document.querySelectorAll('input[name="function"]');
    functionFilters.forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    // Experience level filters
    const levelFilters = document.querySelectorAll('input[name="level"]');
    levelFilters.forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    console.log('Filter listeners setup complete');
}

// Load jobs from API
async function loadJobs(searchFilters = {}) {
    try {
        showLoading();
        
        const queryParams = new URLSearchParams({
            limit: 100, // Load more jobs for better filtering
            ...searchFilters
        });
        
        console.log('Loading jobs with filters:', searchFilters);
        
        const response = await fetch(`${API_BASE_URL}/jobs?${queryParams}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Handle different response formats
        let jobs = [];
        if (Array.isArray(data)) {
            jobs = data;
        } else if (data.jobs && Array.isArray(data.jobs)) {
            jobs = data.jobs;
        } else if (data.data && Array.isArray(data.data)) {
            jobs = data.data;
        } else if (data.success && data.data) {
            jobs = Array.isArray(data.data) ? data.data : [data.data];
        }
        
        if (!jobs || jobs.length === 0) {
            console.warn('No jobs found in API response');
            showNoResults();
            return;
        }
        
        // Store all jobs for filtering
        allJobs = jobs;
        console.log(`Loaded ${allJobs.length} jobs from API`);
        
        // Apply any active filters
        applyCurrentFilters();
        
        // Update filter counts based on all available jobs
        updateFilterCounts();
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        showError(`Failed to load jobs: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Get currently active filters
function getActiveFilters() {
    const filters = {};
    
    // Salary filter
    const salaryChecked = Array.from(document.querySelectorAll('input[name="salary"]:checked'))
        .map(input => input.value);
    if (salaryChecked.length > 0) {
        filters.salary = salaryChecked;
    }

    // Job type filter
    const jobTypeChecked = Array.from(document.querySelectorAll('input[name="jobType"]:checked'))
        .map(input => input.value);
    if (jobTypeChecked.length > 0) {
        filters.jobType = jobTypeChecked;
    }

    // Work mode filter
    const workModeChecked = Array.from(document.querySelectorAll('input[name="workMode"]:checked'))
        .map(input => input.value);
    if (workModeChecked.length > 0) {
        filters.workMode = workModeChecked;
    }

    // Function filter
    const functionChecked = Array.from(document.querySelectorAll('input[name="function"]:checked'))
        .map(input => input.value);
    if (functionChecked.length > 0) {
        filters.function = functionChecked;
    }

    // Experience level filter
    const levelChecked = Array.from(document.querySelectorAll('input[name="level"]:checked'))
        .map(input => input.value);
    if (levelChecked.length > 0) {
        filters.level = levelChecked;
    }

    return filters;
}

// Apply current active filters
function applyCurrentFilters() {
    const filters = getActiveFilters();
    console.log('Applying filters:', filters);
    
    if (Object.keys(filters).length === 0) {
        currentJobs = [...allJobs];
    } else {
        currentJobs = allJobs.filter(job => {
            return passesAllFilters(job, filters);
        });
    }
    
    console.log(`Filtered to ${currentJobs.length} jobs from ${allJobs.length} total`);
    
    if (currentJobs.length === 0) {
        showNoResults();
    } else {
        displayJobs(currentJobs);
        updateJobCount(currentJobs.length);
    }
}

// Check if a job passes all active filters
function passesAllFilters(job, filters) {
    // Salary filter
    if (filters.salary && filters.salary.length > 0) {
        let salaryMatch = false;
        for (const range of filters.salary) {
            if (checkSalaryRange(job.salary, range)) {
                salaryMatch = true;
                break;
            }
        }
        if (!salaryMatch) return false;
    }

    // Experience filter
    if (filters.level && filters.level.length > 0) {
        const jobExpRange = extractExperienceRange(
            job.experience || job.experienceLevel || '', 
            job.title || ''
        );
        
        let levelMatch = false;
        for (const level of filters.level) {
            if (checkExperienceOverlap(level, jobExpRange)) {
                levelMatch = true;
                break;
            }
        }
        if (!levelMatch) return false;
    }

    // Job type filter
    if (filters.jobType && filters.jobType.length > 0) {
        const jobType = (job.type || job.jobType || '').toLowerCase();
        let typeMatch = false;
        for (const type of filters.jobType) {
            const typeL = type.toLowerCase();
            if (jobType.includes(typeL) || 
                typeL.includes(jobType) ||
                (typeL === 'full-time' && (jobType === 'full_time' || jobType === 'fulltime')) ||
                (typeL === 'part-time' && (jobType === 'part_time' || jobType === 'parttime'))) {
                typeMatch = true;
                break;
            }
        }
        if (!typeMatch) return false;
    }

    // Work mode filter
    if (filters.workMode && filters.workMode.length > 0) {
        let workModeMatch = false;
        const isRemote = job.remote || job.location?.toLowerCase().includes('remote') || job.workMode === 'remote';
        const isHybrid = job.workMode === 'hybrid' || job.location?.toLowerCase().includes('hybrid');
        
        for (const mode of filters.workMode) {
            const modeL = mode.toLowerCase();
            if ((modeL === 'remote' && isRemote) ||
                (modeL === 'on-site' && !isRemote && !isHybrid) ||
                (modeL === 'hybrid' && isHybrid)) {
                workModeMatch = true;
                break;
            }
        }
        if (!workModeMatch) return false;
    }

    // Function filter
    if (filters.function && filters.function.length > 0) {
        const jobTitle = (job.title || '').toLowerCase();
        const jobDescription = (job.description || '').toLowerCase();
        const jobSkills = (job.skills || job.tags || []).join(' ').toLowerCase();
        const jobDepartment = (job.department || '').toLowerCase();
        
        let functionMatch = false;
        for (const func of filters.function) {
            const funcL = func.toLowerCase();
            if (jobTitle.includes(funcL) || 
                jobDescription.includes(funcL) || 
                jobSkills.includes(funcL) ||
                jobDepartment.includes(funcL) ||
                (funcL === 'engineering' && (jobTitle.includes('developer') || jobTitle.includes('engineer'))) ||
                (funcL === 'design' && (jobTitle.includes('designer') || jobTitle.includes('ui') || jobTitle.includes('ux'))) ||
                (funcL === 'marketing' && (jobTitle.includes('marketing') || jobDepartment.includes('marketing'))) ||
                (funcL === 'product' && (jobTitle.includes('product') || jobDepartment.includes('product')))) {
                functionMatch = true;
                break;
            }
        }
        if (!functionMatch) return false;
    }

    return true;
}

// Update filter counts based on ALL jobs (not filtered jobs)
function updateFilterCounts() {
    console.log('Updating filter counts based on all jobs...');
    
    // Update all filter categories
    updateSalaryCounts();
    updateJobTypeCounts();
    updateWorkModeCounts();
    updateFunctionCounts();
    updateExperienceCounts();
}

function updateSalaryCounts() {
    const ranges = [
        { value: '0-3k', min: 0, max: 3 },
        { value: '3k-6k', min: 3, max: 6 },
        { value: '6k-10k', min: 6, max: 10 },
        { value: '10k+', min: 10, max: 1000 }
    ];
    
    ranges.forEach(range => {
        const checkbox = document.querySelector(`input[name="salary"][value="${range.value}"]`);
        if (checkbox) {
            const count = allJobs.filter(job => checkSalaryRange(job.salary, range.value)).length;
            updateFilterLabel(checkbox, count);
        }
    });
}

function updateJobTypeCounts() {
    const types = [
        { value: 'full-time', variations: ['full-time', 'full_time', 'fulltime'] },
        { value: 'part-time', variations: ['part-time', 'part_time', 'parttime'] },
        { value: 'contract', variations: ['contract', 'freelance'] },
        { value: 'internship', variations: ['internship', 'intern'] }
    ];
    
    types.forEach(type => {
        const checkbox = document.querySelector(`input[name="jobType"][value="${type.value}"]`);
        if (checkbox) {
            const count = allJobs.filter(job => {
                const jobType = (job.type || job.jobType || '').toLowerCase();
                return type.variations.some(variation => 
                    jobType.includes(variation) || variation.includes(jobType)
                );
            }).length;
            updateFilterLabel(checkbox, count);
        }
    });
}

function updateWorkModeCounts() {
    const modes = ['remote', 'on-site', 'hybrid'];
    
    modes.forEach(mode => {
        const checkbox = document.querySelector(`input[name="workMode"][value="${mode}"]`);
        if (checkbox) {
            const count = allJobs.filter(job => {
                const isRemote = job.remote || job.location?.toLowerCase().includes('remote') || job.workMode === 'remote';
                const isHybrid = job.workMode === 'hybrid' || job.location?.toLowerCase().includes('hybrid');
                
                if (mode === 'remote') return isRemote;
                if (mode === 'hybrid') return isHybrid;
                if (mode === 'on-site') return !isRemote && !isHybrid;
                
                return false;
            }).length;
            updateFilterLabel(checkbox, count);
        }
    });
}

function updateFunctionCounts() {
    const functions = ['marketing', 'engineering', 'design', 'product'];
    
    functions.forEach(func => {
        const checkbox = document.querySelector(`input[name="function"][value="${func}"]`);
        if (checkbox) {
            const count = allJobs.filter(job => {
                const jobTitle = (job.title || '').toLowerCase();
                const jobDescription = (job.description || '').toLowerCase();
                const jobSkills = (job.skills || job.tags || []).join(' ').toLowerCase();
                const jobDepartment = (job.department || '').toLowerCase();
                
                if (func === 'engineering') {
                    return jobTitle.includes('developer') || jobTitle.includes('engineer') || 
                           jobDepartment.includes('engineering') || jobSkills.includes('programming') ||
                           jobTitle.includes('software');
                }
                if (func === 'design') {
                    return jobTitle.includes('designer') || jobTitle.includes('ui') || 
                           jobTitle.includes('ux') || jobDepartment.includes('design');
                }
                if (func === 'marketing') {
                    return jobTitle.includes('marketing') || jobDepartment.includes('marketing') ||
                           jobTitle.includes('brand') || jobTitle.includes('campaign');
                }
                if (func === 'product') {
                    return jobTitle.includes('product') || jobDepartment.includes('product') ||
                           jobTitle.includes('pm ') || jobTitle.includes('product manager');
                }
                
                return jobTitle.includes(func) || jobDescription.includes(func) || 
                       jobSkills.includes(func) || jobDepartment.includes(func);
            }).length;
            updateFilterLabel(checkbox, count);
        }
    });
}

function updateExperienceCounts() {
    const levels = [
        { value: 'fresher', range: { min: 0, max: 1 } },
        { value: '1-3', range: { min: 1, max: 3 } },
        { value: '3-5', range: { min: 3, max: 5 } },
        { value: '5-7', range: { min: 5, max: 7 } },
        { value: '7-10', range: { min: 7, max: 10 } },
        { value: '10+', range: { min: 10, max: 25 } }
    ];
    
    levels.forEach(level => {
        const checkbox = document.querySelector(`input[name="level"][value="${level.value}"]`);
        if (checkbox) {
            const count = allJobs.filter(job => {
                const jobExpRange = extractExperienceRange(
                    job.experience || job.experienceLevel || '', 
                    job.title || ''
                );
                return checkExperienceOverlap(level.value, jobExpRange);
            }).length;
            updateFilterLabel(checkbox, count);
        }
    });
}

// Helper function to update filter labels with counts
function updateFilterLabel(checkbox, count) {
    if (!checkbox) return;
    
    const label = checkbox.closest('label') || checkbox.parentElement;
    if (!label) return;
    
    // Get the original label text (before any count)
    let labelText = label.textContent || '';
    
    // Remove existing count if present
    labelText = labelText.replace(/\s*\(\d+[kK]?\)$/, '');
    
    // Add new count
    const countSuffix = count >= 1000 ? `${Math.floor(count/1000)}k` : count.toString();
    label.innerHTML = `${checkbox.outerHTML} ${labelText} (${countSuffix})`;
}

// Extract salary range (both min and max) from salary string
function extractSalaryRange(salaryString) {
    if (!salaryString) return { min: 0, max: 0 };
    
    const cleanString = salaryString.replace(/[₹$,\s]/g, '').toLowerCase();
    
    // Match ranges like "8k-14k", "10k-16k"
    const rangeMatch = cleanString.match(/(\d+)k?[-–](\d+)k?/);
    if (rangeMatch) {
        const min = parseInt(rangeMatch[1]);
        const max = parseInt(rangeMatch[2]);
        return { min, max };
    }
    
    // Match single values with K like "15K"
    const kMatch = cleanString.match(/(\d+)[k]/);
    if (kMatch) {
        const salary = parseInt(kMatch[1]);
        return { min: salary, max: salary };
    }
    
    // Match plain numbers
    const plainMatch = cleanString.match(/(\d+)/);
    if (plainMatch) {
        let salary = parseInt(plainMatch[1]);
        if (salary >= 1000) {
            salary = Math.floor(salary / 1000);
        }
        return { min: salary, max: salary };
    }
    
    return { min: 0, max: 0 };
}

// Check if salary range overlaps with filter range
function checkSalaryRange(salaryString, filterRange) {
    const salaryRange = extractSalaryRange(salaryString);
    
    let filterMin, filterMax;
    
    switch (filterRange) {
        case '0-3k':
            filterMin = 0;
            filterMax = 3;
            break;
        case '3k-6k':
            filterMin = 3;
            filterMax = 6;
            break;
        case '6k-10k':
            filterMin = 6;
            filterMax = 10;
            break;
        case '10k+':
            filterMin = 10;
            filterMax = 1000;
            break;
        default:
            return true;
    }
    
    return (salaryRange.max >= filterMin && filterMax >= salaryRange.min);
}

// Enhanced experience range extraction
function extractExperienceRange(experienceText, jobTitle = '') {
    const text = `${experienceText} ${jobTitle}`.toLowerCase();
    
    // Handle fresher/entry level
    if (text.includes('fresher') || text.includes('0 year') || text.includes('entry') || 
        text.includes('junior') || text.includes('intern')) {
        return { min: 0, max: 1 };
    }
    
    // Handle senior level (without specific numbers)
    if (text.includes('senior') && !text.match(/\d+/)) {
        return { min: 5, max: 15 };
    }
    
    // Extract number patterns
    const patterns = [
        /(\d+)\s*[-–to]+\s*(\d+)\s*years?/i,
        /(\d+)\s*[-–]\s*(\d+)/i,
        /(\d+)\+\s*years?/i,
        /(\d+)\s*years?/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            if (match[2]) {
                return { 
                    min: parseInt(match[1]), 
                    max: parseInt(match[2]) 
                };
            } else if (text.includes('+')) {
                const minExp = parseInt(match[1]);
                return { 
                    min: minExp, 
                    max: minExp + 10 
                };
            } else {
                const exp = parseInt(match[1]);
                return { 
                    min: Math.max(0, exp - 1), 
                    max: exp + 1 
                };
            }
        }
    }
    
    return { min: 0, max: 15 };
}

// Enhanced experience overlap checking
function checkExperienceOverlap(filterLevel, jobExpRange) {
    let filterRange;
    
    switch (filterLevel.toLowerCase()) {
        case 'fresher':
        case '0-1':
            filterRange = { min: 0, max: 1 };
            break;
        case '1-3':
            filterRange = { min: 1, max: 3 };
            break;
        case '3-5':
            filterRange = { min: 3, max: 5 };
            break;
        case '5-7':
            filterRange = { min: 5, max: 7 };
            break;
        case '7-10':
            filterRange = { min: 7, max: 10 };
            break;
        case '10+':
            filterRange = { min: 10, max: 25 };
            break;
        default:
            const rangeMatch = filterLevel.match(/(\d+)-(\d+)/);
            if (rangeMatch) {
                filterRange = { 
                    min: parseInt(rangeMatch[1]), 
                    max: parseInt(rangeMatch[2]) 
                };
            } else {
                return true;
            }
    }
    
    return (filterRange.max >= jobExpRange.min && jobExpRange.max >= filterRange.min);
}

function displayJobs(jobs) {
    console.log('Rendering jobs:', jobs.length);
    const jobGrid = document.getElementById('jobGrid');
    
    if (!jobGrid) {
        console.error('Job grid element not found!');
        return;
    }
    
    if (!jobs || jobs.length === 0) {
        showNoResults();
        return;
    }

    jobGrid.innerHTML = '';
    
    const jobsHTML = jobs.map(job => {
        const jobData = {
            id: job._id || job.id,
            title: job.title || 'Untitled Position',
            company: job.company || 'Company Name',
            location: job.location || 'Location TBD',
            type: job.type || job.jobType || 'FULL-TIME',
            salary: job.salary || 'Competitive',
            experience: job.experience || job.experienceLevel || 'Not specified',
            posted: formatDate(job.createdAt || job.postedDate || job.datePosted),
            skills: job.skills || job.tags || [],
            description: job.description || '',
            applicants: job.applicants || job.applicationCount || 0,
            views: job.views || 0,
            contactEmail: job.contactEmail || '',
            remote: job.remote || false,
            featured: job.featured || false
        };

        const skillsHTML = jobData.skills.slice(0, 5).map(skill => 
            `<span class="tag">${skill}</span>`
        ).join('');

        return `
            <div class="job-card" data-job-id="${jobData.id}">
                <button class="bookmark-btn" onclick="toggleBookmark('${jobData.id}')">
                    <i class="far fa-heart"></i>
                </button>
                
                <div class="job-header">
                    <div class="job-info">
                        <h3>${jobData.title}</h3>
                        <div class="company-info">
                            <div class="company-logo">${jobData.company.charAt(0).toUpperCase()}</div>
                            <span>${jobData.company}</span>
                        </div>
                    </div>
                    <div class="salary">${jobData.salary}</div>
                </div>

                <div class="job-meta">
                    <span class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        ${jobData.location}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-clock"></i>
                        ${jobData.type}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-user-graduate"></i>
                        ${jobData.experience}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-calendar"></i>
                        ${jobData.posted}
                    </span>
                </div>

                <div class="job-tags">
                    ${skillsHTML}
                </div>

                <div class="job-actions">
                    <button class="btn-apply" onclick="applyToJob('${jobData.id}')">
                        Apply now
                    </button>
                    <button class="btn-save" onclick="viewDetails('${jobData.id}')">
                        View details
                    </button>
                    <span class="meta-item" style="margin-left: auto;">
                        <i class="fas fa-users"></i>
                        ${jobData.applicants} applicants
                    </span>
                </div>
            </div>
        `;
    }).join('');
    
    jobGrid.innerHTML = jobsHTML;
    console.log('Jobs rendered successfully');
}

function updateJobCount(count) {
    const jobCountEl = document.getElementById('jobCount');
    if (jobCountEl) {
        jobCountEl.textContent = count;
    }
    
    // Also update the "Loading jobs with filters" message
    const loadingMessage = document.querySelector('.jobs-section h2');
    if (loadingMessage && loadingMessage.textContent.includes('Loading jobs with filters')) {
        loadingMessage.textContent = `Showing ${count} jobs`;
    }
}

function showLoading() {
    const jobGrid = document.getElementById('jobGrid');
    if (jobGrid) {
        jobGrid.innerHTML = `
            <div class="loading" id="loadingState">
                <div class="spinner"></div>
                <p>Loading jobs...</p>
            </div>
        `;
    }
    
    // Update header
    updateJobCount('...');
}

function hideLoading() {
    const loadingElement = document.getElementById('loadingState');
    if (loadingElement) {
        loadingElement.remove();
    }
}

function showNoResults() {
    const jobGrid = document.getElementById('jobGrid');
    if (jobGrid) {
        jobGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No jobs found</h3>
                <p>Try adjusting your search criteria or filters</p>
                <button onclick="clearFilters()" class="btn-apply" style="margin-top: 15px;">Clear Filters</button>
            </div>
        `;
    }
    updateJobCount(0);
}

function showError(message) {
    const jobGrid = document.getElementById('jobGrid');
    if (jobGrid) {
        jobGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <div style="margin-top: 20px;">
                    <button onclick="loadJobs()" class="btn-apply">Try Again</button>
                    <button onclick="testAPI()" class="btn-secondary" style="margin-left: 10px;">Test API</button>
                </div>
                <div style="margin-top: 15px; font-size: 12px; color: #666;">
                    Check browser console (F12) for more details
                </div>
            </div>
        `;
    }
    updateJobCount('Error');
}

async function testAPI() {
    try {
        console.log('Testing API connection...');
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/jobs`);
        const data = await response.json();
        
        console.log('API Test Result:', data);
        
        if (response.ok) {
            const jobCount = Array.isArray(data) ? data.length : 
                           (data.jobs ? data.jobs.length : 
                           (data.data ? data.data.length : 0));
            alert(`API is working! Found ${jobCount} jobs.`);
            loadJobs();
        } else {
            alert(`API returned error: ${data.message || 'Unknown error'}`);
        }
        
    } catch (error) {
        console.error('API test failed:', error);
        alert(`API connection failed: ${error.message}`);
    } finally {
        hideLoading();
    }
}

async function handleSearch(e) {
    e.preventDefault();
    
    const searchData = {
        search: document.getElementById('jobTitle')?.value || '',
        location: document.getElementById('location')?.value || '',
        experience: document.getElementById('experience')?.value || ''
    };

    const filters = Object.fromEntries(
        Object.entries(searchData).filter(([_, value]) => value)
    );

    console.log('Search filters:', filters);
    currentPage = 1;
    await loadJobs(filters);
}

async function handleSort(e) {
    const sortBy = e.target.value;
    
    // Sort current jobs array
    let sortedJobs = [...currentJobs];
    
    switch (sortBy) {
        case 'relevant':
            // Keep original order (most relevant first)
            break;
        case 'newest':
            sortedJobs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            break;
        case 'salary-high':
            sortedJobs.sort((a, b) => {
                const salaryA = extractSalaryRange(a.salary).max;
                const salaryB = extractSalaryRange(b.salary).max;
                return salaryB - salaryA;
            });
            break;
        case 'salary-low':
            sortedJobs.sort((a, b) => {
                const salaryA = extractSalaryRange(a.salary).min;
                const salaryB = extractSalaryRange(b.salary).min;
                return salaryA - salaryB;
            });
            break;
    }
    
    currentJobs = sortedJobs;
    displayJobs(currentJobs);
}

async function applyFilters() {
    console.log('Applying filters...');
    applyCurrentFilters();
}

function clearFilters() {
    console.log('Clearing filters...');
    
    // Uncheck all filter checkboxes
    const filterInputs = document.querySelectorAll('input[type="checkbox"]');
    filterInputs.forEach(input => {
        input.checked = false;
    });

    // Clear search inputs
    const jobTitle = document.getElementById('jobTitle');
    const location = document.getElementById('location');
    const experience = document.getElementById('experience');
    
    if (jobTitle) jobTitle.value = '';
    if (location) location.value = '';
    if (experience) experience.value = '';

    // Reset to show all jobs
    currentPage = 1;
    currentJobs = [...allJobs];
    displayJobs(currentJobs);
    updateJobCount(currentJobs.length);
}

// Bookmark functionality (using in-memory storage)
let bookmarkedJobs = new Set();

function toggleBookmark(jobId) {
    const bookmarkBtn = document.querySelector(`[data-job-id="${jobId}"] .bookmark-btn`);
    if (!bookmarkBtn) return;
    
    const icon = bookmarkBtn.querySelector('i');
    
    if (bookmarkedJobs.has(jobId)) {
        bookmarkedJobs.delete(jobId);
        icon.classList.remove('fas');
        icon.classList.add('far');
        bookmarkBtn.classList.remove('bookmarked');
        console.log(`Unbookmarked job ${jobId}`);
    } else {
        bookmarkedJobs.add(jobId);
        icon.classList.remove('far');
        icon.classList.add('fas');
        bookmarkBtn.classList.add('bookmarked');
        console.log(`Bookmarked job ${jobId}`);
    }
}

async function applyToJob(jobId) {
    console.log(`Applying to job ${jobId}`);
    
    if (!authToken) {
        alert('Please login to apply for jobs');
        return;
    }

    if (confirm('Are you sure you want to apply for this job?')) {
        alert('Application submitted successfully! (Demo mode)');
    }
}

async function viewDetails(jobId) {
    console.log(`Viewing details for job ${jobId}`);
    
    const job = currentJobs.find(j => (j._id || j.id) === jobId);
    if (job) {
        showJobModal(job);
    } else {
        alert('Job details not found');
    }
}

function showJobModal(job) {
    closeJobModal();
    
    const jobData = {
        id: job._id || job.id,
        title: job.title || 'Untitled Position',
        company: job.company || 'Company Name',
        location: job.location || 'Location TBD',
        type: job.type || 'FULL-TIME',
        salary: job.salary || 'Competitive',
        experience: job.experience || 'Not specified',
        description: job.description || 'No description available.',
        skills: job.skills || job.tags || [],
        contactEmail: job.contactEmail || ''
    };
    
    const modalHTML = `
        <div class="job-modal-overlay" id="jobModal" onclick="closeJobModal()">
            <div class="job-modal" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${jobData.title}</h2>
                    <button onclick="closeJobModal()" class="close-btn">&times;</button>
                </div>
                <div class="modal-content">
                    <div class="job-info">
                        <p><strong>Company:</strong> ${jobData.company}</p>
                        <p><strong>Location:</strong> ${jobData.location}</p>
                        <p><strong>Type:</strong> ${jobData.type}</p>
                        <p><strong>Salary:</strong> ${jobData.salary}</p>
                        <p><strong>Experience:</strong> ${jobData.experience}</p>
                        ${jobData.contactEmail ? `<p><strong>Contact:</strong> ${jobData.contactEmail}</p>` : ''}
                    </div>
                    <div class="job-description">
                        <h3>Description</h3>
                        <p>${jobData.description}</p>
                    </div>
                    ${jobData.skills.length > 0 ? `
                        <div class="job-requirements">
                            <h3>Required Skills</h3>
                            <div class="job-tags">
                                ${jobData.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-actions">
                    <button onclick="applyToJob('${jobData.id}')" class="btn-apply">
                        Apply Now
                    </button>
                    <button onclick="closeJobModal()" class="btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeJobModal() {
    const modal = document.getElementById('jobModal');
    if (modal) {
        modal.remove();
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'Recently posted';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString();
    } catch (error) {
        return 'Recently posted';
    }
}

// Debug functions
console.log('Scripts.js loaded successfully');

window.jobPortalDebug = {
    loadJobs,
    testAPI,
    currentJobs: () => currentJobs,
    allJobs: () => allJobs,
    clearFilters,
    applyFilters,
    applyCurrentFilters,
    getActiveFilters,
    updateFilterCounts,
    bookmarkedJobs: () => Array.from(bookmarkedJobs),
    extractSalaryRange,
    checkSalaryRange,
    extractExperienceRange,
    checkExperienceOverlap,
    passesAllFilters
};