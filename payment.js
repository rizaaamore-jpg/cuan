// Payment Module
const PaymentModule = (function() {
    // Payment methods data
    const paymentMethods = [
        {
            id: 'credit',
            name: 'Credit/Debit Card',
            description: 'Visa, Mastercard, JCB',
            icon: 'fas fa-credit-card'
        },
        {
            id: 'ewallet',
            name: 'E-Wallet',
            description: 'GoPay, OVO, Dana',
            icon: 'fas fa-wallet'
        },
        {
            id: 'bank',
            name: 'Bank Transfer',
            description: 'BCA, Mandiri, BRI',
            icon: 'fas fa-university'
        }
    ];

    // Pricing plans
    const plans = {
        monthly: {
            id: 'monthly',
            name: 'Monthly',
            price: 49999,
            description: 'per month'
        },
        quarterly: {
            id: 'quarterly',
            name: 'Quarterly',
            price: 134997, // 3 months with 10% discount
            description: 'every 3 months (save 10%)',
            discount: 0.1
        },
        yearly: {
            id: 'yearly',
            name: 'Yearly',
            price: 479992, // 12 months with 20% discount
            description: 'per year (save 20%)',
            discount: 0.2
        }
    };

    // Coupon codes
    const coupons = {
        'VIP50': 0.5, // 50% discount
        'VIP30': 0.3, // 30% discount
        'WELCOME': 0.2 // 20% discount for new users
    };

    // Calculate total with tax and discount
    function calculateTotal(planId, couponCode = '') {
        const plan = plans[planId] || plans.monthly;
        let subtotal = plan.price;
        let discount = 0;
        
        // Apply coupon if valid
        if (couponCode && coupons[couponCode.toUpperCase()]) {
            discount = subtotal * coupons[couponCode.toUpperCase()];
        }
        
        const afterDiscount = subtotal - discount;
        const tax = afterDiscount * 0.1; // 10% tax
        const total = afterDiscount + tax;
        
        return {
            subtotal,
            discount,
            tax,
            total,
            plan: plan.name,
            couponApplied: !!discount
        };
    }

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Process payment
    function processPayment(paymentData) {
        return new Promise((resolve, reject) => {
            // Validate payment data
            if (!paymentData.name || !paymentData.email || !paymentData.method) {
                reject(new Error('Please fill in all required fields'));
                return;
            }

            // Simulate payment processing
            setTimeout(() => {
                // Simulate random success (90% success rate)
                const isSuccess = Math.random() < 0.9;
                
                if (isSuccess) {
                    resolve({
                        success: true,
                        transactionId: 'TXN' + Date.now(),
                        amount: paymentData.amount,
                        timestamp: new Date().toISOString(),
                        message: 'Payment successful! VIP activated for 30 days.'
                    });
                } else {
                    reject(new Error('Payment failed. Please try again or use a different payment method.'));
                }
            }, 2000);
        });
    }

    // Setup payment modal
    function setupPaymentModal() {
        const paymentModal = document.getElementById('paymentModal');
        if (!paymentModal) return;

        // Payment method selection
        paymentMethods.forEach(method => {
            const methodElement = document.querySelector(`.payment-method[data-method="${method.id}"]`);
            if (methodElement) {
                methodElement.addEventListener('click', function() {
                    document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
                    this.classList.add('selected');
                });
            }
        });

        // Plan selection
        const planSelect = document.getElementById('paymentAmount');
        if (planSelect) {
            planSelect.innerHTML = Object.values(plans).map(plan => 
                `<option value="${plan.id}">${plan.name} - ${formatCurrency(plan.price)} ${plan.description}</option>`
            ).join('');
            
            planSelect.addEventListener('change', updatePaymentSummary);
        }

        // Coupon code
        const couponInput = document.getElementById('couponCode');
        if (couponInput) {
            couponInput.addEventListener('input', updatePaymentSummary);
        }

        // Payment form submission
        const confirmBtn = document.getElementById('confirmPayment');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', handlePayment);
        }

        // Close modal
        const closeBtn = document.getElementById('closePayment');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                paymentModal.style.display = 'none';
                resetPaymentForm();
            });
        }

        const cancelBtn = document.getElementById('cancelPaymentBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                paymentModal.style.display = 'none';
                resetPaymentForm();
            });
        }
    }

    // Update payment summary
    function updatePaymentSummary() {
        const planId = document.getElementById('paymentAmount')?.value || 'monthly';
        const couponCode = document.getElementById('couponCode')?.value || '';
        
        const summary = calculateTotal(planId, couponCode);
        const totalElement = document.getElementById('totalPayment');
        
        if (totalElement) {
            totalElement.textContent = formatCurrency(summary.total);
        }
    }

    // Handle payment
    async function handlePayment() {
        const name = document.getElementById('paymentName')?.value.trim();
        const email = document.getElementById('paymentEmail')?.value.trim();
        const selectedMethod = document.querySelector('.payment-method.selected');
        const planId = document.getElementById('paymentAmount')?.value || 'monthly';
        const couponCode = document.getElementById('couponCode')?.value || '';
        
        // Validation
        if (!name || !email) {
            showPaymentNotification('Please fill in all fields', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            showPaymentNotification('Please enter a valid email address', 'error');
            return;
        }

        if (!selectedMethod) {
            showPaymentNotification('Please select a payment method', 'error');
            return;
        }

        const method = selectedMethod.dataset.method;
        const summary = calculateTotal(planId, couponCode);

        // Prepare payment data
        const paymentData = {
            name,
            email,
            method,
            plan: summary.plan,
            amount: summary.total,
            couponCode: couponCode || null,
            timestamp: new Date().toISOString()
        };

        // Show loading state
        const confirmBtn = document.getElementById('confirmPayment');
        const originalText = confirmBtn.innerHTML;
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        confirmBtn.disabled = true;

        try {
            // Process payment
            const result = await processPayment(paymentData);
            
            // Update app state
            if (window.app) {
                window.app.state.isVip = true;
                window.app.updateUI();
                window.app.saveToStorage();
            }

            // Show success
            showPaymentNotification(result.message, 'success');
            
            // Close modal
            document.getElementById('paymentModal').style.display = 'none';
            resetPaymentForm();
            
            // Show VIP features modal after delay
            setTimeout(() => {
                showVIPFeaturesModal();
            }, 1000);

        } catch (error) {
            showPaymentNotification(error.message, 'error');
        } finally {
            // Reset button
            confirmBtn.innerHTML = originalText;
            confirmBtn.disabled = false;
        }
    }

    // Reset payment form
    function resetPaymentForm() {
        document.getElementById('paymentName').value = '';
        document.getElementById('paymentEmail').value = '';
        document.getElementById('couponCode').value = '';
        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
        updatePaymentSummary();
    }

    // Show VIP features modal
    function showVIPFeaturesModal() {
        const features = [
            'Unlimited links',
            'All premium themes',
            'Custom domain support',
            'Analytics dashboard',
            'Priority support',
            'No branding',
            'Export to multiple formats',
            'Advanced customization'
        ];

        const modalContent = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-crown"></i> Welcome to VIP!</h2>
                    <button class="close-modal" onclick="this.closest('.modal').style.display='none'">&times;</button>
                </div>
                <div class="form-group">
                    <p style="text-align: center; margin-bottom: 20px;">Congratulations! Your VIP access has been activated.</p>
                    <div style="background: linear-gradient(135deg, #f0f4ff 0%, #eef2ff 100%); border-radius: var(--radius); padding: 20px;">
                        <h3 style="margin-bottom: 15px; color: var(--primary);">VIP Features Unlocked:</h3>
                        <ul style="list-style: none; padding: 0;">
                            ${features.map(feature => `
                                <li style="margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                                    <i class="fas fa-check" style="color: var(--success);"></i>
                                    ${feature}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                <div class="form-group mt-4">
                    <button class="btn btn-vip w-100" onclick="this.closest('.modal').style.display='none'">
                        <i class="fas fa-rocket"></i> Start Building!
                    </button>
                </div>
            </div>
        `;

        // Create modal if it doesn't exist
        let modal = document.getElementById('vipFeaturesModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'vipFeaturesModal';
            modal.className = 'modal';
            modal.style.display = 'flex';
            modal.innerHTML = modalContent;
            document.body.appendChild(modal);
        } else {
            modal.innerHTML = modalContent;
            modal.style.display = 'flex';
        }

        // Close on outside click
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    }

    // Show payment notification
    function showPaymentNotification(message, type = 'success') {
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
        } else {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        setupPaymentModal();
    });

    // Public API
    return {
        calculateTotal,
        processPayment,
        setupPaymentModal,
        showVIPFeaturesModal
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.PaymentModule = PaymentModule;
}
