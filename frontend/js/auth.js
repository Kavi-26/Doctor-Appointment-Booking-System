/* ═══════════════════════════════════════════════════════════
   Auth State Management
   ═══════════════════════════════════════════════════════════ */

const Auth = {
    TOKEN_KEY: 'docbook_token',
    USER_KEY: 'docbook_user',

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    getUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    setAuth(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    getRole() {
        const user = this.getUser();
        return user ? user.role : null;
    },

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    },

    // Check if current user has one of the allowed roles
    hasRole(...roles) {
        return roles.includes(this.getRole());
    }
};
