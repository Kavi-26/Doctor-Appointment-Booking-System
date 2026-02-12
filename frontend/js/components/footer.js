/* ═══════════════════════════════════════════════════════════
   Footer Component
   ═══════════════════════════════════════════════════════════ */

const Footer = {
    render() {
        const footer = document.getElementById('footer');
        const isLoggedIn = Auth.isLoggedIn();

        footer.innerHTML = `
            <div class="footer">
                <div class="footer-grid">
                    <div>
                        <div class="footer-brand">
                            <i data-lucide="heart-pulse" style="width:20px;height:20px;color:var(--primary)"></i>
                            DocBook
                        </div>
                        <p class="footer-desc">
                            Your trusted platform for seamless doctor appointment booking. 
                            Connect with top healthcare professionals and manage your health journey effortlessly.
                        </p>
                    </div>
                    <div class="footer-col">
                        <h4>Quick Links</h4>
                        <a href="#/">Home</a>
                        <a href="#/patient/search-doctors">Find Doctors</a>
                        <a href="#/patient/register">Register</a>
                        <a href="#/patient/login">Login</a>
                    </div>
                    <div class="footer-col">
                        <h4>For Doctors</h4>
                        <a href="#/doctor/register">Join as Doctor</a>
                        <a href="#/doctor/login">Doctor Login</a>
                    </div>
                    <div class="footer-col">
                        <h4>Support</h4>
                        <a href="#">Help Center</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact Us</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; ${new Date().getFullYear()} DocBook — Doctor Appointment Booking System. All rights reserved.</p>
                </div>
            </div>
        `;

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};
