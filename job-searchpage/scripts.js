// scripts.js 
const API_BASE_URL = 'http://localhost:5000/api';

let currentJobs = [];
let allJobs = []; 
let currentPage = 1;
const jobsPerPage = 10;
let authToken = null;


document.addEventListener('DOMContentLoaded', function() {
    console.log('Job Portal Loading...');
    loadJobs();
    
    
    const searchForm = document.querySelector('.search-form');
    const searchButton = document.getElementById('searchButton');
    
    if (searchButton) {
        searchButton.addEventListener('click', handleSearchSubmit);
    }
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSearchSubmit();
        });
    }
    
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', handleSort);
    }
    
    setTimeout(() => {
        setupFilterListeners();
        console.log('Real-time filter system ready');
    }, 100);
    
    console.log('Event listeners attached');
});

function handleSearchSubmit(e) {
    if (e) e.preventDefault();
    
    console.log('Search form submitted');
    showLoading();
    
    // Small delay for better UX
    setTimeout(() => {
        applySearchAndFilters();
    }, 300);
}

// Setup filter event listeners for real-time filtering 
function setupFilterListeners() {
    console.log('Setting up filter listeners...');
    
    // Salary range filters
    const salaryFilters = document.querySelectorAll('input[name="salary"]');
    salaryFilters.forEach(input => {
        input.addEventListener('change', function() {
            console.log('Salary filter changed:', this.value, this.checked);
            applySearchAndFilters();
        });
    });

    // Job type filters
    const jobTypeFilters = document.querySelectorAll('input[name="jobType"]');
    jobTypeFilters.forEach(input => {
        input.addEventListener('change', function() {
            console.log('Job type filter changed:', this.value, this.checked);
            applySearchAndFilters();
        });
    });

    // Work mode filters
    const workModeFilters = document.querySelectorAll('input[name="workMode"]');
    workModeFilters.forEach(input => {
        input.addEventListener('change', function() {
            console.log('Work mode filter changed:', this.value, this.checked);
            applySearchAndFilters();
        });
    });

    // Function filters
    const functionFilters = document.querySelectorAll('input[name="function"]');
    functionFilters.forEach(input => {
        input.addEventListener('change', function() {
            console.log('Function filter changed:', this.value, this.checked);
            applySearchAndFilters();
        });
    });

    // Experience level filters
    const levelFilters = document.querySelectorAll('input[name="level"]');
    levelFilters.forEach(input => {
        input.addEventListener('change', function() {
            console.log('Level filter changed:', this.value, this.checked);
            applySearchAndFilters();
        });
    });

    console.log('Real-time filter listeners setup complete');
}

// Load jobs from API
async function loadJobs(searchFilters = {}) {
    try {
        showLoading();
        
        const queryParams = new URLSearchParams({
            limit: 100,
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
        applySearchAndFilters();
        
        // Update filter counts based on all available jobs
        updateAllFilterCounts();
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        showError(`Failed to load jobs: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Apply search and all filters with improved real-time response
function applySearchAndFilters() {
    console.log('Applying filters in real-time...');
    
    const searchFilters = getSearchFilters();
    const checkboxFilters = getActiveFilters();
    
    console.log('Current filters:', { searchFilters, checkboxFilters });
    
    // Start with all jobs
    let filteredJobs = [...allJobs];
    
    // Apply search filters first
    if (searchFilters.search && searchFilters.search.trim()) {
        const searchTerm = searchFilters.search.trim().toLowerCase();
        filteredJobs = filteredJobs.filter(job => {
            // Enhanced partial matching for job titles
            const title = (job.title || '').toLowerCase();
            const company = (job.company || '').toLowerCase();
            const description = (job.description || '').toLowerCase();
            const skills = (job.skills || job.tags || []).join(' ').toLowerCase();
            
            // Check if search term is contained in any of these fields
            return title.includes(searchTerm) ||
                   company.includes(searchTerm) ||
                   description.includes(searchTerm) ||
                   skills.includes(searchTerm);
        });
    }
    
    if (searchFilters.location && searchFilters.location.trim()) {
        const locationTerm = searchFilters.location.trim().toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
            job.location && job.location.toLowerCase().includes(locationTerm)
        );
    }
    
    // Enhanced experience filtering with range support
    if (searchFilters.experience && searchFilters.experience.trim()) {
        const expValue = searchFilters.experience.trim();
        filteredJobs = filteredJobs.filter(job => {
            return matchesExperienceRange(job, expValue);
        });
    }
    
    // Apply checkbox filters with real-time updates
    if (Object.keys(checkboxFilters).length > 0) {
        filteredJobs = filteredJobs.filter(job => {
            return passesAllFilters(job, checkboxFilters);
        });
    }
    
    currentJobs = filteredJobs;
    console.log(`Real-time filtered to ${currentJobs.length} jobs from ${allJobs.length} total`);
    
    // Update UI immediately for better UX
    updateJobDisplayImmediate();
    
    // Update filter counts in real-time
    updateAllFilterCounts();
}

// Enhanced experience matching function
function matchesExperienceRange(job, selectedExpRange) {
    const jobExpText = (job.experience || job.experienceLevel || '').toLowerCase();
    const jobTitle = (job.title || '').toLowerCase();
    
    // Extract numeric experience from job
    const jobExpRange = extractExperienceRange(jobExpText, jobTitle);
    
    // Define experience ranges based on dropdown selection
    let searchRange;
    
    switch (selectedExpRange) {
        case '0-1':
            searchRange = { min: 0, max: 1 };
            break;
        case '1-3':
            searchRange = { min: 1, max: 3 };
            break;
        case '3-5':
            searchRange = { min: 3, max: 5 };
            break;
        case '5-10':
            searchRange = { min: 5, max: 10 };
            break;
        case '10+':
            searchRange = { min: 10, max: 50 };
            break;
        default:
            return true; // If no specific range, show all
    }
    
    // Check if job experience overlaps with search range
    return checkExperienceOverlap(searchRange, jobExpRange);
}

// Check if two experience ranges overlap
function checkExperienceOverlap(searchRange, jobRange) {
    // If job has no experience specified, include it for entry level positions
    if (jobRange.min === 0 && jobRange.max === 0) {
        return searchRange.min === 0; // Only show for 0-1 range
    }
    
    // Check for overlap: ranges overlap if max of first >= min of second AND min of first <= max of second
    return searchRange.max >= jobRange.min && searchRange.min <= jobRange.max;
}

// Get search input values
function getSearchFilters() {
    return {
        search: document.getElementById('jobTitle')?.value || '',
        location: document.getElementById('location')?.value || '',
        experience: document.getElementById('experience')?.value || ''
    };
}

// Get currently active checkbox filters
function getActiveFilters() {
    const filters = {};
    
    const salaryChecked = Array.from(document.querySelectorAll('input[name="salary"]:checked'))
        .map(input => input.value);
    if (salaryChecked.length > 0) {
        filters.salary = salaryChecked;
    }

    const jobTypeChecked = Array.from(document.querySelectorAll('input[name="jobType"]:checked'))
        .map(input => input.value);
    if (jobTypeChecked.length > 0) {
        filters.jobType = jobTypeChecked;
    }

    const workModeChecked = Array.from(document.querySelectorAll('input[name="workMode"]:checked'))
        .map(input => input.value);
    if (workModeChecked.length > 0) {
        filters.workMode = workModeChecked;
    }

    const functionChecked = Array.from(document.querySelectorAll('input[name="function"]:checked'))
        .map(input => input.value);
    if (functionChecked.length > 0) {
        filters.function = functionChecked;
    }

    const levelChecked = Array.from(document.querySelectorAll('input[name="level"]:checked'))
        .map(input => input.value);
    if (levelChecked.length > 0) {
        filters.level = levelChecked;
    }

    return filters;
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

    // Experience filter (for checkbox filters)
    if (filters.level && filters.level.length > 0) {
        const jobExpRange = extractExperienceRange(
            job.experience || job.experienceLevel || '', 
            job.title || ''
        );
        
        let levelMatch = false;
        for (const level of filters.level) {
            if (checkExperienceLevelOverlap(level, jobExpRange)) {
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

// Enhanced experience overlap checking for filter levels
function checkExperienceLevelOverlap(filterLevel, jobExpRange) {
    let filterRange;
    
    switch (filterLevel.toLowerCase()) {
        case 'entry':
            filterRange = { min: 0, max: 2 };
            break;
        case 'junior':
            filterRange = { min: 1, max: 4 };
            break;
        case 'senior':
            filterRange = { min: 4, max: 15 };
            break;
        case 'lead':
            filterRange = { min: 7, max: 25 };
            break;
        default:
            return true;
    }
    
    return checkExperienceOverlap(filterRange, jobExpRange);
}

// Update all filter counts based on currently filtered jobs
function updateAllFilterCounts() {
    console.log('Updating all filter counts...');
    
    updateSalaryCounts();
    updateJobTypeCounts();
    updateWorkModeCounts();
    updateFunctionCounts();
    updateExperienceCounts();
    
    // Ensure event listeners are still attached after DOM updates
    setTimeout(() => {
        // Check if event listeners are still working, if not reattach them
        const testCheckbox = document.querySelector('input[name="salary"]');
        if (testCheckbox && !testCheckbox.onchange) {
            console.log('Event listeners lost, reattaching...');
            setupFilterListeners();
        }
    }, 100);
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
    const functions = ['marketing', 'engineering', 'design', 'sales'];
    
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
                if (func === 'sales') {
                    return jobTitle.includes('sales') || jobDepartment.includes('sales') ||
                           jobTitle.includes('account') || jobTitle.includes('business development');
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
        { value: 'entry', label: 'Entry-level' },
        { value: 'junior', label: 'Junior' },
        { value: 'senior', label: 'Senior' },
        { value: 'lead', label: 'Lead/Managerial' }
    ];
    
    levels.forEach(level => {
        const checkbox = document.querySelector(`input[name="level"][value="${level.value}"]`);
        if (checkbox) {
            const count = allJobs.filter(job => {
                const jobExpRange = extractExperienceRange(
                    job.experience || job.experienceLevel || '', 
                    job.title || ''
                );
                return checkExperienceLevelOverlap(level.value, jobExpRange);
            }).length;
            updateFilterLabel(checkbox, count, level.label);
        }
    });
}

// Fixed helper function to update filter labels with live counts WITHOUT breaking event listeners
function updateFilterLabel(checkbox, count, customLabel = null) {
    if (!checkbox) return;
    
    const label = checkbox.closest('label') || checkbox.parentElement;
    if (!label) return;
    
    // Get the original label text
    let labelText = customLabel || checkbox.value;
    
    // Format the label based on the filter type
    if (checkbox.name === 'salary') {
        labelText = checkbox.value.replace('k', 'K');
    } else if (checkbox.name === 'jobType') {
        const typeLabels = {
            'full-time': 'Full Time',
            'part-time': 'Part Time',
            'contract': 'Contract',
            'internship': 'Internship'
        };
        labelText = typeLabels[checkbox.value] || checkbox.value;
    } else if (checkbox.name === 'workMode') {
        const modeLabels = {
            'on-site': 'On-Site',
            'remote': 'Remote',
            'hybrid': 'Hybrid'
        };
        labelText = modeLabels[checkbox.value] || checkbox.value;
    } else if (checkbox.name === 'function') {
        labelText = checkbox.value.charAt(0).toUpperCase() + checkbox.value.slice(1);
    }
    
    // Format count
    const countSuffix = count >= 1000 ? `${Math.floor(count/1000)}k` : count.toString();
    
    // COMPLETELY FIXED: Clear all content except checkbox and rebuild
    const checkboxElement = checkbox.cloneNode(true);
    
    // Clear the label completely and add back only checkbox + text
    label.innerHTML = '';
    label.appendChild(checkboxElement);
    
    // Add the formatted text
    const textSpan = document.createElement('span');
    textSpan.className = 'filter-label-text';
    textSpan.textContent = ` ${labelText} (${countSuffix})`;
    label.appendChild(textSpan);
    
    // Re-attach the event listener to the new checkbox
    checkboxElement.addEventListener('change', function() {
        console.log(`${this.name} filter changed:`, this.value, this.checked);
        applySearchAndFilters();
    });
}

// Immediate job display update for real-time filtering
function updateJobDisplayImmediate() {
    const jobGrid = document.getElementById('jobGrid');
    
    if (currentJobs.length === 0) {
        showNoResults();
    } else {
        // Immediate update without fade effect for better real-time feel
        displayJobs(currentJobs);
        updateJobCount(currentJobs.length);
    }
}

// New function for smooth job display updates
function updateJobDisplay() {
    const jobGrid = document.getElementById('jobGrid');
    
    if (currentJobs.length === 0) {
        showNoResults();
    } else {
        // Add fade effect
        if (jobGrid) {
            jobGrid.style.opacity = '0.7';
            setTimeout(() => {
                displayJobs(currentJobs);
                jobGrid.style.opacity = '1';
            }, 100);
        } else {
            displayJobs(currentJobs);
        }
        updateJobCount(currentJobs.length);
    }
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
            contactEmail: job.contactEmail || '',
            remote: job.remote || false
        };

        const skillsHTML = jobData.skills.slice(0, 4).map(skill => 
            `<span class="tag">${skill}</span>`
        ).join('');

        return `
            <div class="job-card" data-job-id="${jobData.id}">
                <div class="job-header">
                    <div class="job-info">
                        <h3>${jobData.title}</h3>
                        <div class="company-info">
                            <div class="company-logo">${jobData.company.charAt(0).toUpperCase()}</div>
                            <div class="company-details">
                                <span class="company-name">${jobData.company}</span>
                                <span class="job-location">
                                    <i class="fas fa-map-marker-alt"></i>
                                    ${jobData.location}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="salary-info">
                        <span class="salary">${jobData.salary}</span>
                        <span class="job-type">${jobData.type}</span>
                    </div>
                </div>

                <div class="job-meta">
                    <span class="meta-item">
                        <i class="fas fa-user-graduate"></i>
                        ${jobData.experience}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-calendar"></i>
                        ${jobData.posted}
                    </span>
                    ${jobData.remote ? '<span class="remote-badge">Remote</span>' : ''}
                </div>

                <div class="job-tags">
                    ${skillsHTML}
                </div>

                <div class="job-footer">
                    <div class="job-actions">
                        <button class="btn-save" onclick="viewDetails('${jobData.id}')">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                        <button class="btn-apply" onclick="applyToJob('${jobData.id}')">
                            <i class="fas fa-paper-plane"></i>
                            Apply Now
                        </button>
                    </div>
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
    
    // Update results header
    const resultsCount = document.querySelector('.results-count');
    if (resultsCount) {
        resultsCount.innerHTML = `Showing <strong>${count}</strong> jobs`;
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
                <button onclick="clearFilters()" class="btn-apply" style="margin-top: 15px;">Clear All Filters</button>
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

async function handleSort(e) {
    const sortBy = e.target.value;
    
    let sortedJobs = [...currentJobs];
    
    switch (sortBy) {
        case 'relevant':
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

// Enhanced clear filters function
function clearFilters() {
    console.log('Clearing all filters...');
    
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

    // Reset to show all jobs immediately
    currentPage = 1;
    applySearchAndFilters();
    
    console.log('All filters cleared');
}

async function applyToJob(jobId) {
    console.log(`Applying to job ${jobId}`);
    
    // Simple demo functionality
    if (confirm('Apply for this position?\n\nNote: This is a demo. In a real application, this would redirect to the application form.')) {
        // Show success message
        showNotification('Application submitted successfully!', 'success');
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

// Show notification function
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Extract salary range (both min and max) from salary string
function extractSalaryRange(salaryString) {
    if (!salaryString) return { min: 0, max: 0 };
    
    const cleanString = salaryString.replace(/[₹$,\s]/g, '').toLowerCase();
    
    const rangeMatch = cleanString.match(/(\d+)k?[-–](\d+)k?/);
    if (rangeMatch) {
        const min = parseInt(rangeMatch[1]);
        const max = parseInt(rangeMatch[2]);
        return { min, max };
    }
    
    const kMatch = cleanString.match(/(\d+)[k]/);
    if (kMatch) {
        const salary = parseInt(kMatch[1]);
        return { min: salary, max: salary };
    }
    
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
    
    // Handle special cases first
    if (text.includes('fresher') || text.includes('0 year') || text.includes('no experience') || 
        text.includes('entry level') || text.includes('graduate')) {
        return { min: 0, max: 1 };
    }
    
    if (text.includes('intern')) {
        return { min: 0, max: 0 };
    }
    
    // Look for specific patterns
    const patterns = [
        // Range patterns like "3-5 years", "2 to 4 years"
        /(\d+)\s*[-–to]+\s*(\d+)\s*years?/i,
        // Plus patterns like "5+ years", "3+ yrs"
        /(\d+)\+\s*(?:years?|yrs?)/i,
        // Single number patterns like "3 years", "5 yrs"
        /(\d+)\s*(?:years?|yrs?)/i,
        // Minimum patterns like "minimum 2 years"
        /minimum\s+(\d+)/i,
        // At least patterns like "at least 3 years"
        /at\s+least\s+(\d+)/i
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            if (match[2]) {
                // Range found (e.g., "3-5 years")
                return { 
                    min: parseInt(match[1]), 
                    max: parseInt(match[2]) 
                };
            } else if (text.includes('+') || text.includes('minimum') || text.includes('at least')) {
                // Plus or minimum pattern (e.g., "5+ years", "minimum 3 years")
                const minExp = parseInt(match[1]);
                return { 
                    min: minExp, 
                    max: Math.min(minExp + 5, 15) // Cap at reasonable max
                };
            } else {
                // Single number (e.g., "3 years") - assume +/- 1 year flexibility
                const exp = parseInt(match[1]);
                return { 
                    min: Math.max(0, exp - 1), 
                    max: exp + 1 
                };
            }
        }
    }
    
    // Check for seniority levels in title/description
    if (text.includes('senior') && !text.match(/\d+/)) {
        return { min: 5, max: 15 };
    }
    
    if (text.includes('junior') && !text.match(/\d+/)) {
        return { min: 1, max: 3 };
    }
    
    if (text.includes('lead') || text.includes('manager') || text.includes('head')) {
        return { min: 7, max: 20 };
    }
    
    // Default case - no specific experience mentioned
    return { min: 0, max: 15 };
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
        if (diffDays <= 30) return `${Math.ceil(diffDays/7)} weeks ago`;
        if (diffDays <= 365) return `${Math.ceil(diffDays/30)} months ago`;
        
        return date.toLocaleDateString();
    } catch (error) {
        return 'Recently posted';
    }
}

// Keyboard event handlers
document.addEventListener('keydown', function(e) {
    // Close modal on Escape key
    if (e.key === 'Escape') {
        closeJobModal();
    }
    
    // Trigger search on Enter key in search inputs
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && (
            activeElement.id === 'jobTitle' || 
            activeElement.id === 'location' || 
            activeElement.id === 'experience'
        )) {
            e.preventDefault();
            handleSearchSubmit();
        }
    }
});

// Debug function to test filter functionality
function debugFilters() {
    console.log('=== FILTER DEBUG ===');
    console.log('Active filters:', getActiveFilters());
    console.log('Search filters:', getSearchFilters());
    console.log('Current jobs count:', currentJobs.length);
    console.log('All jobs count:', allJobs.length);
    
    // Test if event listeners are attached
    const testInputs = document.querySelectorAll('input[name="salary"], input[name="jobType"], input[name="workMode"]');
    console.log('Inputs with event listeners:', 
        Array.from(testInputs).map(input => ({
            name: input.name,
            value: input.value,
            hasListener: !!input.onchange || input.addEventListener.toString().includes('native')
        }))
    );
}

// Debug functions and window exports
console.log('Enhanced Scripts.js loaded successfully with REAL-TIME filtering');

window.jobPortalDebug = {
    loadJobs,
    testAPI,
    currentJobs: () => currentJobs,
    allJobs: () => allJobs,
    clearFilters,
    applySearchAndFilters,
    getActiveFilters,
    getSearchFilters,
    updateAllFilterCounts,
    extractSalaryRange,
    checkSalaryRange,
    extractExperienceRange,
    checkExperienceOverlap,
    matchesExperienceRange,
    passesAllFilters,
    handleSearchSubmit,
    debugFilters,
    setupFilterListeners
};