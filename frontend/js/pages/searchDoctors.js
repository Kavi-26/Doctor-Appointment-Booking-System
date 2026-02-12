/* Search Doctors Page */
const SearchDoctorsPage = {
    render() {
        return `
        <div class="dashboard-page container">
            <div class="page-header"><h1>Find Doctors</h1><p>Search from our network of top healthcare professionals</p></div>
            <div class="search-bar">
                <div class="search-input-wrapper">
                    <i data-lucide="search" style="width:18px;height:18px"></i>
                    <input type="text" class="form-control" id="search-input" placeholder="Search by name, specialization...">
                </div>
                <select class="form-control filter-select" id="filter-specialization">
                    <option value="">All Specializations</option>
                    <option>General Medicine</option><option>Cardiology</option><option>Dermatology</option>
                    <option>ENT</option><option>Gynecology</option><option>Neurology</option>
                    <option>Ophthalmology</option><option>Orthopedics</option><option>Pediatrics</option>
                    <option>Psychiatry</option><option>Dentistry</option>
                </select>
                <select class="form-control filter-select" id="filter-sort" style="min-width:140px;">
                    <option value="">Sort By</option>
                    <option value="rating">Top Rated</option>
                    <option value="experience">Most Experienced</option>
                    <option value="fee_low">Fee: Low to High</option>
                    <option value="fee_high">Fee: High to Low</option>
                </select>
            </div>
            <div id="doctors-list">${Skeleton.card(6)}</div>
            <div id="pagination-container"></div>
        </div>`;
    },
    currentPage: 1,
    async init() {
        if (typeof lucide !== 'undefined') lucide.createIcons();
        const search = Utils.debounce(() => this.loadDoctors(), 400);
        document.getElementById('search-input')?.addEventListener('input', search);
        document.getElementById('filter-specialization')?.addEventListener('change', () => this.loadDoctors());
        document.getElementById('filter-sort')?.addEventListener('change', () => this.loadDoctors());
        this.loadDoctors();
    },
    async loadDoctors(page = 1) {
        this.currentPage = page;
        const search = document.getElementById('search-input')?.value || '';
        const spec = document.getElementById('filter-specialization')?.value || '';
        const sort = document.getElementById('filter-sort')?.value || '';
        let query = `?page=${page}&limit=9`;
        if (search) query += `&search=${encodeURIComponent(search)}`;
        if (spec) query += `&specialization=${encodeURIComponent(spec)}`;
        if (sort === 'rating') query += '&sort=rating&order=DESC';
        if (sort === 'experience') query += '&sort=experience&order=DESC';
        if (sort === 'fee_low') query += '&sort=consultation_fee&order=ASC';
        if (sort === 'fee_high') query += '&sort=consultation_fee&order=DESC';

        try {
            const data = await API.get(`/patient/doctors${query}`);
            const doctors = data.doctors || [];
            const container = document.getElementById('doctors-list');
            if (!doctors.length) {
                container.innerHTML = `<div class="empty-state"><h3>No Doctors Found</h3><p>Try adjusting your search or filters.</p></div>`;
                return;
            }
            container.innerHTML = `<div class="doctors-grid">${doctors.map(d => `
                <div class="doctor-card" onclick="window.location.hash='#/patient/doctor/${d.id}'">
                    <div class="doctor-card-header">
                        <div class="doctor-card-avatar">${d.profile_image ? `<img src="${d.profile_image}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md)">` : Utils.getInitials(d.name)}</div>
                        <div class="doctor-card-info">
                            <h3>Dr. ${Utils.escapeHTML(d.name)}</h3>
                            <div class="specialization">${d.specialization}</div>
                            <div class="experience">${d.experience} yrs experience</div>
                        </div>
                    </div>
                    <div class="doctor-card-stats">
                        <div class="doctor-card-stat"><div class="value">${Utils.starsHTML(d.rating || 0)}</div><div class="label">${d.total_reviews || 0} reviews</div></div>
                        <div class="doctor-card-stat"><div class="value">${Utils.formatCurrency(d.consultation_fee)}</div><div class="label">per visit</div></div>
                    </div>
                </div>`).join('')}</div>`;

            // Pagination
            const totalPages = data.totalPages || 1;
            if (totalPages > 1) {
                let pgHTML = '<div class="pagination">';
                pgHTML += `<button ${page <= 1 ? 'disabled' : ''} onclick="SearchDoctorsPage.loadDoctors(${page - 1})"><i data-lucide="chevron-left" style="width:14px;height:14px"></i></button>`;
                for (let i = 1; i <= totalPages; i++) {
                    pgHTML += `<button class="${i === page ? 'active' : ''}" onclick="SearchDoctorsPage.loadDoctors(${i})">${i}</button>`;
                }
                pgHTML += `<button ${page >= totalPages ? 'disabled' : ''} onclick="SearchDoctorsPage.loadDoctors(${page + 1})"><i data-lucide="chevron-right" style="width:14px;height:14px"></i></button></div>`;
                document.getElementById('pagination-container').innerHTML = pgHTML;
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        } catch (err) {
            Toast.show('Failed to load doctors', 'error');
        }
    }
};
