/**
 * Professional API Utility
 * This wrapper around fetch provides:
 * 1. Automatic base URL handling
 * 2. Automatic JWT token injection
 * 3. Centralized error handling (401/403 logout)
 */

export const BASE_URL = 'http://localhost:8080';

const apiFetch = async (endpoint, options = {}) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Prepare headers
    const headers = {
        ...options.headers,
    };

    // Only set JSON content type if not sending FormData (to let browser set boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Inject token if available (but NOT for login/signup to avoid conflicts)
    const isAuthRequest = endpoint.includes('/api/auth/') || endpoint.includes('/api/v1/auth/');
    if (user && user.token && !isAuthRequest) {
        headers['Authorization'] = `Bearer ${user.token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        // Professional Handle for Unauthorized/Expired tokens
        if (response.status === 401 || response.status === 403) {
            // Check if we are already at login or if the request is FOR login/signup
            const isAuthRequest = endpoint.includes('/api/auth/login') || endpoint.includes('/api/auth/signup');
            
            if (!isAuthRequest) {
                console.warn("Session expired or unauthorized. Logging out...");
                localStorage.removeItem('user');
                
                // Redirect to login only if not already there
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
            return response;
        }

        return response;
    } catch (error) {
        console.error("API Call Error:", error);
        throw error;
    }
};

export default apiFetch;
