/**
 * signup-api.js  –  API integration for signup.html
 *
 * Flow:
 *   1. User fills form → POST /api/Auth/register
 *   2. Backend sends OTP to e-mail
 *   3. Page shows OTP input (hidden initially) → POST /api/Auth/verify-otp
 *   4. On success → redirect to login.html
 *
 * HOW TO USE:
 *   Add just before </body> in signup.html:
 *     <script src="js/api.js"></script>
 *     <script src="js/signup-api.js"></script>
 */

(function () {
    const form = document.getElementById('signupForm');
    if (!form) return;

    // We track the e-mail used for registration so we can pass it to verify-otp
    let registeredEmail = '';

    // ── Step 1: Registration ──────────────────────────────────────
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name            = document.getElementById('name').value.trim();
        const email           = document.getElementById('email').value.trim();
        const password        = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill all fields');
            return;
        }
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const data = await MustAPI.registerUser(name, email, password);
            console.log('Register response:', data);
            registeredEmail = email;
            alert('Account created! ✅ Please check your e-mail for the OTP code.');
            showOtpSection();
        } catch (err) {
            console.error('Register error:', err);
            alert('Registration failed: ' + err.message);
        }
    });

    // ── Step 2: OTP Verification ──────────────────────────────────
    /**
     * Inject a simple OTP field block into the page.
     * We do NOT modify the HTML file – we create the DOM elements via JS.
     */
    function showOtpSection() {
        // Avoid duplicates
        if (document.getElementById('otpSection')) return;

        const otpSection = document.createElement('div');
        otpSection.id = 'otpSection';
        otpSection.style.marginTop = '15px';

        const otpInput = document.createElement('input');
        otpInput.type        = 'text';
        otpInput.id          = 'otpCode';
        otpInput.placeholder = 'Enter OTP Code';
        otpInput.style.width         = '100%';
        otpInput.style.padding       = '12px';
        otpInput.style.border        = '1px solid #ddd';
        otpInput.style.borderRadius  = '10px';
        otpInput.style.outline       = 'none';
        otpInput.style.marginBottom  = '10px';

        const otpBtn = document.createElement('button');
        otpBtn.type        = 'button';
        otpBtn.textContent = 'Verify OTP';
        otpBtn.style.width         = '100%';
        otpBtn.style.padding       = '12px';
        otpBtn.style.border        = 'none';
        otpBtn.style.borderRadius  = '10px';
        otpBtn.style.background    = '#00ac5c';
        otpBtn.style.color         = '#fff';
        otpBtn.style.fontSize      = '16px';
        otpBtn.style.cursor        = 'pointer';

        otpBtn.addEventListener('click', async function () {
            const code = otpInput.value.trim();
            if (!code) { alert('Please enter the OTP code'); return; }

            try {
                const data = await MustAPI.verifyOtp(registeredEmail, code);
                console.log('OTP verify response:', data);
                alert('Email verified successfully ✅ You can now login.');
                window.location.href = 'login.html';
            } catch (err) {
                console.error('OTP error:', err);
                alert('OTP verification failed: ' + err.message);
            }
        });

        otpSection.appendChild(otpInput);
        otpSection.appendChild(otpBtn);

        // Append after the form
        form.parentNode.insertBefore(otpSection, form.nextSibling);

        // Scroll to it
        otpSection.scrollIntoView({ behavior: 'smooth' });
    }
})();
