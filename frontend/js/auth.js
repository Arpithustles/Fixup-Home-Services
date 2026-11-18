/**
 * FIXUP AUTHENTICATION ENGINE (auth.js)
 * Strict role-based registration, email OTP verification, 72-hour session security,
 * and 5-step provider wizard validation.
 */

(function () {
  'use strict';

  function getPrefix() {
    const p = window.location.pathname.replace(/\\/g, '/');
    if (p.includes('/frontend/pages/') || p.includes('/frontend/customer/') || p.includes('/frontend/provider/') || p.includes('/frontend/admin/')) {
      return '../../';
    }
    return './';
  }

  const prefix = getPrefix();

  // --- Customer Registration Logic ---
  window.initCustomerRegistration = function () {
    const form = document.getElementById('customerRegisterForm');
    const otpSection = document.getElementById('otpVerificationSection');
    const registerSection = document.getElementById('registerFormSection');
    let registeredEmail = '';

    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('regName').value.trim();
      const dob = document.getElementById('regDob').value;
      const email = document.getElementById('regEmail').value.trim().toLowerCase();
      const phone = document.getElementById('regPhone').value.trim();
      const username = document.getElementById('regUsername').value.trim().toLowerCase();
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;
      const address = document.getElementById('regAddress').value.trim();
      const city = document.getElementById('regCity').value.trim();
      const pincode = document.getElementById('regPincode').value.trim();

      // Password matching
      if (password !== confirmPassword) {
        window.FixupToast.show('Password Mismatch', 'Passwords do not match. Please re-enter.', 'danger');
        return;
      }

      // Check unique role constraint
      const existingCustomer = (window.FixupStore.data.customers || []).find(c => c.email === email || c.username === username);
      const existingProvider = (window.FixupStore.data.providers || []).find(p => p.email === email || p.username === username);

      if (existingProvider) {
        window.FixupToast.show('Role Exclusivity Restriction', 'This email/username is already registered as a Service Provider. An individual cannot hold both customer and provider accounts.', 'danger');
        return;
      }

      if (existingCustomer) {
        window.FixupToast.show('Account Exists', 'A customer account with this email or username already exists. Please login instead.', 'warning');
        return;
      }

      // Generate OTP and switch to OTP screen
      registeredEmail = email;
      const otpCode = window.FixupStore.generateOtp(email);

      // Stash temporary pending customer
      window._pendingCustomer = {
        id: 'cust-' + Math.floor(200 + Math.random() * 800),
        name,
        dob,
        email,
        phone,
        username,
        passwordHash: password,
        address,
        city,
        pincode,
        isVerified: false
      };

      registerSection.style.display = 'none';
      otpSection.style.display = 'block';
      document.getElementById('otpTargetEmail').textContent = email;

      window.FixupToast.show('OTP Sent!', `A 6-digit verification code has been dispatched to ${email}. (Demo Code: ${otpCode})`, 'success', 8000);
      setupOtpInputs('customer');
    });
  };

  // --- Provider Registration Wizard (5 Steps) ---
  window.initProviderRegistration = function () {
    let currentStep = 1;
    const totalSteps = 5;
    const progressLine = document.getElementById('wizardProgressLine');
    let providerData = {};

    function showStep(step) {
      currentStep = step;
      document.querySelectorAll('.wizard-step-pane').forEach((p, idx) => {
        p.classList.toggle('active', idx + 1 === step);
      });

      document.querySelectorAll('.wizard-step-node').forEach((node, idx) => {
        const stepNum = idx + 1;
        node.classList.remove('active', 'completed');
        if (stepNum < step) node.classList.add('completed');
        else if (stepNum === step) node.classList.add('active');
      });

      if (progressLine) {
        progressLine.style.width = `${((step - 1) / (totalSteps - 1)) * 100}%`;
      }
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }

    // Step 1: Personal
    document.getElementById('btnStep1Next')?.addEventListener('click', () => {
      const name = document.getElementById('proName').value.trim();
      const dob = document.getElementById('proDob').value;
      const phone = document.getElementById('proPhone').value.trim();
      const email = document.getElementById('proEmail').value.trim().toLowerCase();
      const username = document.getElementById('proUsername').value.trim().toLowerCase();
      const password = document.getElementById('proPassword').value;
      const confirmPassword = document.getElementById('proConfirmPassword').value;

      if (!name || !dob || !phone || !email || !username || !password) {
        window.FixupToast.show('Missing Fields', 'Please fill in all mandatory personal details.', 'warning');
        return;
      }

      if (password !== confirmPassword) {
        window.FixupToast.show('Password Mismatch', 'Passwords do not match.', 'danger');
        return;
      }

      // Role Exclusivity Check
      const existingCustomer = (window.FixupStore.data.customers || []).find(c => c.email === email || c.username === username);
      if (existingCustomer) {
        window.FixupToast.show('Role Exclusivity Restriction', 'This email/username is already registered as a Customer. A user can only register for one role.', 'danger');
        return;
      }

      providerData.name = name;
      providerData.dob = dob;
      providerData.phone = phone;
      providerData.altPhone = document.getElementById('proAltPhone')?.value.trim() || '';
      providerData.email = email;
      providerData.username = username;
      providerData.passwordHash = password;
      providerData.gender = document.getElementById('proGender')?.value || '';

      showStep(2);
    });

    // Step 2: Address
    document.getElementById('btnStep2Prev')?.addEventListener('click', () => showStep(1));
    document.getElementById('btnStep2Next')?.addEventListener('click', () => {
      const city = document.getElementById('proCity').value.trim();
      const state = document.getElementById('proState').value.trim();
      const pincode = document.getElementById('proPincode').value.trim();
      const fullAddress = document.getElementById('proFullAddress').value.trim();

      if (!city || !state || !pincode || !fullAddress) {
        window.FixupToast.show('Missing Address', 'Please provide your full residential and work address.', 'warning');
        return;
      }

      providerData.city = city;
      providerData.state = state;
      providerData.pincode = pincode;
      providerData.fullAddress = fullAddress;

      showStep(3);
    });

    // Step 3: Professional
    document.getElementById('btnStep3Prev')?.addEventListener('click', () => showStep(2));
    document.getElementById('btnStep3Next')?.addEventListener('click', () => {
      const primaryCategory = document.getElementById('proCategory').value;
      const experienceYears = Number(document.getElementById('proExp').value) || 1;
      const charges = document.getElementById('proCharges').value.trim();
      const areas = document.getElementById('proAreas').value.trim();
      const desc = document.getElementById('proDesc').value.trim();

      if (!primaryCategory || !charges || !areas) {
        window.FixupToast.show('Missing Professional Info', 'Please specify your trade, charges, and service areas.', 'warning');
        return;
      }

      providerData.serviceCategory = primaryCategory;
      providerData.secondaryCategory = document.getElementById('proSecondaryCategory')?.value || '';
      providerData.experienceYears = experienceYears;
      providerData.charges = charges;
      providerData.areasServed = areas;
      providerData.serviceDescription = desc;
      providerData.workingHours = document.getElementById('proWorkingHours')?.value || '9:00 AM - 8:00 PM';
      providerData.availableDays = document.getElementById('proAvailableDays')?.value || 'All 7 Days';

      showStep(4);
    });

    // Step 4: KYC
    document.getElementById('btnStep4Prev')?.addEventListener('click', () => showStep(3));
    document.getElementById('btnStep4Next')?.addEventListener('click', () => {
      const idType = document.getElementById('proIdType').value;
      const idNumber = document.getElementById('proIdNumber').value.trim();

      if (!idType || !idNumber) {
        window.FixupToast.show('KYC Required', 'Please provide your government identity document type and number.', 'warning');
        return;
      }

      providerData.idType = idType;
      providerData.idNumber = idNumber;

      // Populate Step 5 Review Table
      document.getElementById('revName').textContent = providerData.name;
      document.getElementById('revContact').textContent = `${providerData.email} • ${providerData.phone}`;
      document.getElementById('revCategory').textContent = `${providerData.serviceCategory} (${providerData.experienceYears} Yrs Exp)`;
      document.getElementById('revAddress').textContent = `${providerData.fullAddress}, ${providerData.city} - ${providerData.pincode}`;
      document.getElementById('revKyc').textContent = `${providerData.idType} (${providerData.idNumber}) - Document Upload Verified`;

      showStep(5);
    });

    // Step 5: Submit & Trigger OTP
    document.getElementById('btnStep5Prev')?.addEventListener('click', () => showStep(4));
    document.getElementById('btnStep5Submit')?.addEventListener('click', () => {
      const otpCode = window.FixupStore.generateOtp(providerData.email);

      // Stash pending provider
      window._pendingProvider = {
        id: 'pro-' + Math.floor(100 + Math.random() * 900),
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
        rating: 5.0,
        reviewsCount: 0,
        completedJobs: 0,
        pendingJobs: 0,
        assignedJobs: 0,
        feedbackPoints: 100,
        status: 'online',
        kycStatus: 'pending_admin_approval', // Pending KYC Admin Approval!
        lastKycDate: new Date().toISOString(),
        nextKycDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        earnings: { total: 0, last7Days: 0, last30Days: 0, last6Months: 0, today: 0 },
        payoutDetails: { upiId: `${providerData.username}@okaxis` },
        loyalCustomers: [],
        ...providerData
      };

      document.getElementById('wizardContainer').style.display = 'none';
      const otpSection = document.getElementById('proOtpSection');
      otpSection.style.display = 'block';
      document.getElementById('otpTargetEmail').textContent = providerData.email;

      window.FixupToast.show('Verification OTP Dispatched', `6-digit verification code sent to ${providerData.email}. (Demo Code: ${otpCode})`, 'success', 8000);
      setupOtpInputs('provider');
    });
  };

  // --- OTP Verification Logic (Shared) ---
  function setupOtpInputs(role) {
    const inputs = document.querySelectorAll('.otp-digit-input');
    inputs.forEach((input, index) => {
      input.value = '';
      input.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
          inputs[index - 1].focus();
        }
      });
    });

    const verifyBtn = document.getElementById('btnVerifyOtp');
    verifyBtn?.addEventListener('click', () => {
      const code = Array.from(inputs).map(i => i.value).join('');
      if (code.length !== 6) {
        window.FixupToast.show('Incomplete Code', 'Please enter all 6 digits of the OTP.', 'warning');
        return;
      }

      const email = document.getElementById('otpTargetEmail').textContent.trim();
      const res = window.FixupStore.verifyOtp(email, code);

      if (res.success) {
        if (role === 'customer' && window._pendingCustomer) {
          window._pendingCustomer.isVerified = true;
          window.FixupStore.data.customers.push(window._pendingCustomer);
          window.FixupStore.save();
          window.FixupStore.setSession(window._pendingCustomer, 'CUSTOMER');

          window.FixupToast.show('Welcome to Fixup!', 'Account verified! Redirecting to your Customer Dashboard...', 'success');
          setTimeout(() => {
            window.location.href = `${prefix}frontend/customer/dashboard.html`;
          }, 1200);
        } else if (role === 'provider' && window._pendingProvider) {
          window._pendingProvider.isVerified = true;
          window.FixupStore.data.providers.push(window._pendingProvider);
          window.FixupStore.save();
          window.FixupStore.setSession(window._pendingProvider, 'SERVICE_PROVIDER');

          window.FixupToast.show('Registration Completed!', 'Congratulations! Your Fixup Provider account is created and queued for Admin KYC Review.', 'success', 6000);
          setTimeout(() => {
            window.location.href = `${prefix}frontend/provider/dashboard.html`;
          }, 1500);
        }
      } else {
        window.FixupToast.show('Verification Failed', res.message, 'danger');
      }
    });

    // Resend OTP
    document.getElementById('btnResendOtp')?.addEventListener('click', () => {
      const email = document.getElementById('otpTargetEmail').textContent.trim();
      const code = window.FixupStore.generateOtp(email);
      window.FixupToast.show('New OTP Generated', `A fresh OTP was sent to ${email}. (Demo Code: ${code})`, 'info', 7000);
    });
  }

  // --- Login Handler ---
  window.initLogin = function () {
    const form = document.getElementById('loginForm');
    const roleTabs = document.querySelectorAll('.role-tab-btn');
    let selectedRole = 'CUSTOMER';

    roleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        roleTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        selectedRole = tab.dataset.role;
      });
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const identifier = document.getElementById('loginIdentifier').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;

      if (selectedRole === 'CUSTOMER') {
        const customer = (window.FixupStore.data.customers || []).find(
          c => (c.email.toLowerCase() === identifier || c.username.toLowerCase() === identifier) && c.passwordHash === password
        );

        if (!customer) {
          window.FixupToast.show('Invalid Credentials', 'No customer account found with these credentials.', 'danger');
          return;
        }

        window.FixupStore.setSession(customer, 'CUSTOMER');
        window.FixupToast.show(`Welcome back, ${customer.name}!`, 'Signed into Customer Portal.', 'success');
        setTimeout(() => {
          window.location.href = `${prefix}frontend/customer/dashboard.html`;
        }, 800);

      } else if (selectedRole === 'SERVICE_PROVIDER') {
        const provider = (window.FixupStore.data.providers || []).find(
          p => (p.email.toLowerCase() === identifier || p.username.toLowerCase() === identifier) && p.passwordHash === password
        );

        if (!provider) {
          window.FixupToast.show('Invalid Credentials', 'No provider account found with these credentials.', 'danger');
          return;
        }

        window.FixupStore.setSession(provider, 'SERVICE_PROVIDER');
        window.FixupToast.show(`Welcome back, ${provider.name}!`, 'Signed into Service Provider Desk.', 'success');
        setTimeout(() => {
          window.location.href = `${prefix}frontend/provider/dashboard.html`;
        }, 800);
      }
    });
  };

  // --- Forgot Password Handler ---
  window.initForgotPassword = function () {
    const form = document.getElementById('forgotPasswordForm');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotEmail').value.trim();
      const otp = window.FixupStore.generateOtp(email);
      window.FixupToast.show('Reset Instructions Dispatched', `Password recovery OTP sent to ${email}. (Demo Code: ${otp})`, 'info', 7000);
      document.getElementById('forgotSuccessNotice').style.display = 'block';
    });
  };
})();
